from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User, UserRole
from app.models.project import Project, ProjectCreate, ProjectUpdate, ProjectStatus
from app.models.employee import EmployeeProfile, Skill, SkillLevel
from app.api.deps import get_current_user, RoleChecker
from app.agents.planner_agent import PlannerAgent
from app.agents.matcher_agent import MatcherAgent
from beanie import PydanticObjectId
from beanie.operators import In
from datetime import datetime

router = APIRouter()

is_admin = RoleChecker([UserRole.ADMIN])
is_authenticated = get_current_user

@router.post("/", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(is_admin)
):
    project = Project(**project_data.dict())
    await project.insert()
    return project

@router.get("/", response_model=List[Project])
async def list_projects(
    status: Optional[ProjectStatus] = None,
    current_user: User = Depends(is_authenticated)
):
    query = {}
    if status:
        query["status"] = status
    return await Project.find(query).to_list()

@router.get("/portfolio", response_model=List[Project])
async def get_portfolio(current_user: User = Depends(is_authenticated)):
    # Portfolio shows finalized projects
    return await Project.find(Project.status == ProjectStatus.FINALIZED).to_list()

@router.get("/{project_id}", response_model=dict)
async def get_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_authenticated)
):
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Populate team profiles
    team = []
    if project.assigned_team:
        for emp_id in project.assigned_team:
            profile = await EmployeeProfile.get(emp_id)
            if profile:
                skills = await Skill.find(Skill.employee_id == profile.id).to_list()
                team.append({
                    "profile": profile,
                    "skills": skills
                })
    
    return {
        "project": project,
        "team": team
    }

@router.get("/my-projects", response_model=List[Project])
async def get_my_projects(current_user: User = Depends(is_authenticated)):
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile:
        return []
    # Find projects where profile.id is in the assigned_team list
    return await Project.find({"assigned_team": profile.id}).to_list()

@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: PydanticObjectId,
    update_data: ProjectUpdate,
    current_user: User = Depends(is_admin)
):
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_dict = update_data.dict(exclude_unset=True)
    if update_dict:
        for key, value in update_dict.items():
            setattr(project, key, value)
        project.updated_at = datetime.utcnow()
        await project.save()
    
    return project

@router.delete("/{project_id}")
async def delete_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_admin)
):
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await project.delete()
    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/plan")
async def generate_project_plan(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_admin)
):
    """Generate AI-powered project plan with tasks"""
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        planner = PlannerAgent()
        required_skills = [skill.skill_name for skill in project.required_skills]
        
        plan = await planner.plan(
            project_title=project.title,
            project_description=project.description,
            required_skills=required_skills,
            experience_required=project.experience_required
        )
        
        return plan
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate plan: {str(e)}"
        )

@router.get("/{project_id}/match")
async def match_employees_to_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_admin)
):
    """AI-powered employee matching for project"""
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all employee users first to exclude admins
    employees_users = await User.find(User.role == UserRole.EMPLOYEE).to_list()
    employee_user_ids = [u.id for u in employees_users]

    # Get profiles only for these employees
    profiles = await EmployeeProfile.find(In(EmployeeProfile.user_id, employee_user_ids)).to_list()
    candidates = []
    
    for profile in profiles:
        skills = await Skill.find(Skill.employee_id == profile.id).to_list()
        candidates.append({
            "profile": profile,
            "skills": skills
        })
    
    if not candidates:
        return {"matches": [], "total_candidates": 0}
    
    # 1. Use existing tasks if available, otherwise generate
    tasks = project.tasks or []
    if not tasks:
        try:
            planner = PlannerAgent()
            required_skills_list = [skill.skill_name for skill in project.required_skills]
            plan = await planner.plan(
                project_title=project.title,
                project_description=project.description,
                required_skills=required_skills_list,
                experience_required=project.experience_required
            )
            tasks = plan.get("tasks", [])
            # Persist these tasks so they stay consistent
            project.tasks = tasks
            await project.save()
        except Exception as e:
            print(f"Warning: Task planning failed: {e}")
            tasks = [{"title": "General System Integration", "description": "Execute core project modules", "required_skills": []}]

    try:
        # 2. Match with tasks
        matcher = MatcherAgent()
        result = await matcher.match(project=project, candidates=candidates, tasks=tasks)
        
        # Enrich matches with full profile data and filter for Core Team (score > 0)
        enriched_matches = []
        for match in result.get("matches", []):
            if match["match_score"] <= 0:
                continue
                
            # Find the candidate profile
            candidate = next(
                (c for c in candidates if str(c["profile"].id) == match["employee_id"]),
                None
            )
            if candidate:
                enriched_matches.append({
                    "profile": candidate["profile"],
                    "skills": candidate["skills"],
                    "score": match["match_score"],
                    "matched_skills": match["matched_skills"],
                    "suggested_task": match["suggested_task"],
                    "suggested_description": match.get("suggested_description", ""),
                    "suggested_deadline": match.get("suggested_deadline", "TBD"),
                    "reasoning": match["reasoning"]
                })
        
        return enriched_matches
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to match employees: {str(e)}"
        )

@router.post("/match-preview")
async def match_preview(
    project_data: ProjectCreate,
    current_user: User = Depends(is_admin)
):
    """AI-powered matching for unsaved project drafts"""
    print(f"DEBUG: match-preview called with title: {project_data.title}")
    
    # Create temporary project object (not saved to DB)
    project = Project(**project_data.dict())
    
    
    # Get all employee users first to exclude admins
    employees_users = await User.find(User.role == UserRole.EMPLOYEE).to_list()
    print(f"DEBUG: Found {len(employees_users)} users with role 'employee'")
    employee_user_ids = [u.id for u in employees_users]

    # Get profiles only for these employees
    profiles = await EmployeeProfile.find(In(EmployeeProfile.user_id, employee_user_ids)).to_list()
    print(f"DEBUG: Found {len(profiles)} profiles linked to these users")
    
    candidates = []
    
    for profile in profiles:
        skills = await Skill.find(Skill.employee_id == profile.id).to_list()
        print(f"DEBUG: Candidate {profile.full_name} has {len(skills)} skills: {[s.skill_name for s in skills]}")
        candidates.append({
            "profile": profile,
            "skills": skills
        })
    
    if not candidates:
        print("DEBUG: No candidates found for matching")
        return {"matches": [], "total_candidates": 0}
    
    print(f"DEBUG: Starting match preview for {len(candidates)} candidates")
    print(f"DEBUG: Required skills: {[s.skill_name for s in project.required_skills]}")
    
    tasks = []
    try:
        # 1. Generate tasks for the draft
        planner = PlannerAgent()
        required_skills_list = [skill.skill_name for skill in project.required_skills]
        plan = await planner.plan(
            project_title=project.title,
            project_description=project.description,
            required_skills=required_skills_list,
            experience_required=project.experience_required
        )
        tasks = plan.get("tasks", [])
    except Exception as e:
        print(f"Warning: Draft planning failed: {e}")
        tasks = [{"title": "Initial Implementation Phase", "description": "Begin core project logic", "required_skills": []}]

    try:
        # 2. Match with tasks
        matcher = MatcherAgent()
        result = await matcher.match(project=project, candidates=candidates, tasks=tasks)
        
        print(f"DEBUG: Matcher returned {len(result.get('matches', []))} matches")
        
        # Enrich matches
        enriched_matches = []
        for match in result.get("matches", []):
            candidate = next(
                (c for c in candidates if str(c["profile"].id) == match["employee_id"] or str(c["profile"].get('_id') if isinstance(c["profile"], dict) else getattr(c["profile"], 'id', '')) == match["employee_id"]),
                None
            )
            if not candidate:
                 # Try one more way to find the candidate if the above failed
                 for c in candidates:
                     pid = str(getattr(c["profile"], 'id', '')) or str(c["profile"].get('_id', ''))
                     if pid == match["employee_id"]:
                         candidate = c
                         break

            if candidate:
                print(f"DEBUG: Enriched match for {candidate['profile'].full_name if hasattr(candidate['profile'], 'full_name') else 'Unknown'}")
                enriched_matches.append({
                    "profile": candidate["profile"],
                    "skills": candidate["skills"],
                    "score": match["match_score"],
                    "matched_skills": match["matched_skills"],
                    "suggested_task": match["suggested_task"],
                    "suggested_description": match.get("suggested_description", ""),
                    "suggested_deadline": match.get("suggested_deadline", "TBD"),
                    "reasoning": match["reasoning"]
                })
            else:
                print(f"DEBUG: Could not find candidate profile for ID {match['employee_id']}")
        
        print(f"DEBUG: Returning {len(enriched_matches)} enriched matches")
        return enriched_matches
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to match employees: {str(e)}"
        )

@router.post("/{project_id}/replan")
async def replan_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_admin)
):
    """AI-powered project replanning"""
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        # Fetch current team and tasks
        # For Demo/MVP, we'll re-run matching but with a "replan" context
        # In a real scenario, we'd look at task progress, deadlines, and conflicts.
        
        planner = PlannerAgent()
        required_skills_list = [skill.skill_name for skill in project.required_skills]
        plan = await planner.plan(
            project_title=project.title,
            project_description=project.description,
            required_skills=required_skills_list,
            experience_required=project.experience_required
        )
        tasks = plan.get("tasks", [])
        
        # Save tasks to project
        project.tasks = tasks
        await project.save()

        # Get all candidates

        employees_users = await User.find(User.role == UserRole.EMPLOYEE).to_list()
        employee_user_ids = [u.id for u in employees_users]
        profiles = await EmployeeProfile.find(In(EmployeeProfile.user_id, employee_user_ids)).to_list()
        candidates = []
        for profile in profiles:
            skills = await Skill.find(Skill.employee_id == profile.id).to_list()
            candidates.append({"profile": profile, "skills": skills})

        matcher = MatcherAgent()
        result = await matcher.match(project=project, candidates=candidates, tasks=tasks)
        
        # Enrich matches
        enriched_matches = []
        for match in result.get("matches", []):
            candidate = next((c for c in candidates if str(c["profile"].id) == match["employee_id"]), None)
            if candidate:
                enriched_matches.append({
                    "profile": candidate["profile"],
                    "skills": candidate["skills"],
                    "score": match["match_score"],
                    "matched_skills": match["matched_skills"],
                    "suggested_task": match["suggested_task"],
                    "reasoning": match["reasoning"]
                })
        
        return {
            "status": "success",
            "message": "Project replanned successfully",
            "tasks": tasks,
            "team": enriched_matches
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replanning failed: {str(e)}")

@router.post("/{project_id}/decompose")
async def decompose_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_admin)
):
    """Explicit task decomposition agent endpoint"""
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        planner = PlannerAgent()
        required_skills_list = [skill.skill_name for skill in project.required_skills]
        plan = await planner.plan(
            project_title=project.title,
            project_description=project.description,
            required_skills=required_skills_list,
            experience_required=project.experience_required
        )
        
        # Save tasks to project for persistence
        tasks = plan.get("tasks", [])
        project.tasks = tasks
        await project.save()
        
        return plan

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decomposition failed: {str(e)}")


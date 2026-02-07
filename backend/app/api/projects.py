from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from app.models.user import User, UserRole
from app.models.project import Project, ProjectCreate, ProjectUpdate, ProjectStatus
from app.models.employee import EmployeeProfile, Skill, SkillLevel
from app.api.deps import get_current_user, RoleChecker
from app.agents.planner_agent import PlannerAgent
from app.agents.matcher_agent import MatcherAgent
from beanie import PydanticObjectId
from beanie.operators import In
from datetime import datetime

from bson import ObjectId
from app.core.serialization import serialize_doc
from pydantic import BaseModel
from app.models.notification import Notification, NotificationType

class TaskStatusUpdate(BaseModel):
    task_title: str
    status: str

class HealthResponse(BaseModel):
    health: str # stable | warning | critical
    issues: List[str]
    metrics: dict

class DeadlineExtension(BaseModel):
    new_deadline: str
    reason: Optional[str] = None

router = APIRouter()

is_admin = RoleChecker([UserRole.ADMIN])
is_authenticated = get_current_user

@router.post("/", response_model=dict)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(is_admin)
):
    project = Project(**project_data.dict())
    await project.insert()
    return serialize_doc(project)

@router.get("/", response_model=List[dict])
async def list_projects(
    status: Optional[ProjectStatus] = None,
    current_user: User = Depends(is_authenticated)
):
    query = {}
    if status:
        query["status"] = status
    
    projects = await Project.find(query).to_list()
    
    # Enrich with team previews for dashboard
    enriched_projects = []
    for project in projects:
        team_previews = []
        if project.assigned_team:
            for emp_id in project.assigned_team:
                profile = await EmployeeProfile.get(emp_id)
                if profile:
                    team_previews.append({
                        "id": str(profile.id),
                        "full_name": profile.full_name,
                        "avatar_url": profile.avatar_url
                    })
        
        project_dict = serialize_doc(project)
        project_dict["team_previews"] = team_previews
        enriched_projects.append(project_dict)
        
    return enriched_projects

@router.get("/portfolio", response_model=List[dict])
async def get_portfolio(current_user: User = Depends(is_authenticated)):
    # Portfolio shows finalized projects
    projects = await Project.find(Project.status == ProjectStatus.FINALIZED).to_list()
    
    enriched_projects = []
    for project in projects:
        team_previews = []
        if project.assigned_team:
            for emp_id in project.assigned_team:
                profile = await EmployeeProfile.get(emp_id)
                if profile:
                    team_previews.append({
                        "id": str(profile.id),
                        "full_name": profile.full_name,
                        "avatar_url": profile.avatar_url
                    })
        
        project_dict = serialize_doc(project)
        project_dict["team_previews"] = team_previews
        enriched_projects.append(project_dict)
        
    return enriched_projects

@router.get("/my-projects", response_model=List[dict])
async def get_my_projects(current_user: User = Depends(is_authenticated)):
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile:
        print(f"CRITICAL: No profile for user {current_user.email} ({current_user.id})")
        return []
    
    # Query projects where user is in assigned_team
    # We use a broad trace for debugging
    projects = await Project.find({"assigned_team": profile.id}).to_list()
    
    print(f"SYNC: User {current_user.email} (Profile: {profile.id}) matched {len(projects)} projects")
    
    if not projects:
         # Fallback check: maybe status needs to be checked? 
         # Or maybe the ID type in assigned_team is a string?
         projects_alt = await Project.find({"assigned_team": str(profile.id)}).to_list()
         if projects_alt:
             print(f"SYNC WARNING: Matched {len(projects_alt)} projects using STRING ID fallback!")
             projects = projects_alt
        
    return serialize_doc(projects)

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
    
    return serialize_doc({
        "project": project,
        "team": team
    })

@router.put("/{project_id}", response_model=dict)
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
    
    return serialize_doc(project)

@router.put("/{project_id}/tasks/status", response_model=dict)
async def update_task_status(
    project_id: PydanticObjectId,
    update_data: TaskStatusUpdate,
    current_user: User = Depends(is_authenticated)
):
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is in the team (unless admin)
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if current_user.role != UserRole.ADMIN:
        if not profile or profile.id not in project.assigned_team:
            raise HTTPException(status_code=403, detail="You are not assigned to this project")

    # Find and update the task
    task_found = False
    for task in project.tasks:
        if task.title == update_data.task_title:
            task.status = update_data.status
            task_found = True
            break
    
    if not task_found:
        raise HTTPException(status_code=404, detail=f"Task '{update_data.task_title}' not found in project")
    
    project.updated_at = datetime.utcnow()
    await project.save()
    
    return serialize_doc(project)

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
        
        # Calculate days remaining
        days_remaining = 7
        if project.deadline:
            try:
                deadline_dt = datetime.fromisoformat(project.deadline.replace('Z', '+00:00'))
                days_remaining = (deadline_dt.date() - datetime.utcnow().date()).days
                days_remaining = max(1, days_remaining)
            except: pass

        plan = await planner.plan(
            project_title=project.title,
            project_description=project.description,
            required_skills=required_skills,
            experience_required=project.experience_required,
            days_remaining=days_remaining
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
    
    # If the project has an assigned team, we ONLY match those employees
    if project.assigned_team:
        profiles = await EmployeeProfile.find(In(EmployeeProfile.id, project.assigned_team)).to_list()
    else:
        # Get all employee users first to exclude admins
        employees_users = await User.find(User.role == UserRole.EMPLOYEE).to_list()
        employee_user_ids = [u.id for u in employees_users]
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
            
            # Calculate days remaining
            days_remaining = 7
            if project.deadline:
                try:
                    deadline_dt = datetime.fromisoformat(project.deadline.replace('Z', '+00:00'))
                    days_remaining = (deadline_dt.date() - datetime.utcnow().date()).days
                    days_remaining = max(1, days_remaining)
                except: pass

            plan = await planner.plan(
                project_title=project.title,
                project_description=project.description,
                required_skills=required_skills_list,
                experience_required=project.experience_required,
                days_remaining=days_remaining
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
        
        # Calculate days remaining
        days_remaining = 7
        if project.deadline:
            try:
                deadline_dt = datetime.fromisoformat(project.deadline.replace('Z', '+00:00'))
                days_remaining = (deadline_dt.date() - datetime.utcnow().date()).days
                days_remaining = max(1, days_remaining)
            except: pass

        plan = await planner.plan(
            project_title=project.title,
            project_description=project.description,
            required_skills=required_skills_list,
            experience_required=project.experience_required,
            days_remaining=days_remaining
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

@router.put("/{project_id}/extend-deadline")
async def extend_project_deadline(
    project_id: PydanticObjectId,
    extension_data: DeadlineExtension,
    current_user: User = Depends(is_admin)
):
    """
    Extend project deadline with admin approval.
    Recalculates health metrics and expected progress.
    """
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        old_deadline = project.deadline
        project.deadline = extension_data.new_deadline
        project.updated_at = datetime.utcnow()
        await project.save()
        
        # Notify team members if project is finalized (active)
        notifications_sent = 0
        if project.status == ProjectStatus.FINALIZED and project.assigned_team:
            for employee_id in project.assigned_team:
                notification = Notification(
                    employee_id=employee_id,
                    project_id=project.id,
                    notification_type=NotificationType.DEADLINE_EXTENDED,
                    title=f"⏰ Deadline Extended - {project.title}",
                    message=f"The project deadline has been extended to {extension_data.new_deadline}. " +
                            (f"Reason: {extension_data.reason}" if extension_data.reason else ""),
                    read=False
                )
                await notification.insert()
                notifications_sent += 1
                
        return {
            "status": "success", 
            "message": "Deadline extended successfully",
            "new_deadline": project.deadline,
            "notifications_sent": notifications_sent
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extend deadline: {str(e)}")

@router.get("/{project_id}/health", response_model=HealthResponse)
async def get_project_health(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_authenticated)
):
    """
    Evaluate project health based on tasks, deadlines, and workload.
    
    Health States:
    - stable (🟢): All metrics within acceptable thresholds
    - warning (🟡): Minor risks detected (workload > 75%, deadline < 7 days)
    - critical (🔴): Major risks (overdue, unassigned tasks, overload > 90%)
    
    Risk Score Calculation:
    - Task progress < expected progress: +30 points
    - Employee load > 90%: +40 points
    - Deadline risk (< 3 days): +20 points
    - Unassigned/blocked tasks: +50 points
    
    Threshold: risk_score > 50 triggers replanning
    """
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    issues = []
    health = "stable"
    risk_score = 0
    
    total_tasks = len(project.tasks)
    if total_tasks == 0:
        return HealthResponse(
            health="stable", 
            issues=[], 
            metrics={
                "total_tasks": 0, 
                "completed": 0, 
                "risk_score": 0,
                "progress": 0,
                "expected_progress": 0,
                "max_load": 0
            }
        )
        
    completed_tasks = len([t for t in project.tasks if t.status == "completed"])
    in_progress_tasks = len([t for t in project.tasks if t.status == "in_progress"])
    progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    # Calculate expected progress based on time elapsed
    expected_progress = 0
    days_left = None
    if project.deadline:
        try:
            deadline_dt = datetime.fromisoformat(project.deadline.replace('Z', '+00:00'))
            # Assume project started when created
            created_dt = project.created_at if hasattr(project, 'created_at') else datetime.utcnow()
            total_duration = (deadline_dt - created_dt).days
            elapsed = (datetime.utcnow() - created_dt).days
            
            if total_duration > 0:
                expected_progress = (elapsed / total_duration) * 100
                expected_progress = min(100, max(0, expected_progress))
            
            days_left = (deadline_dt.date() - datetime.utcnow().date()).days
        except:
            pass
    
    # 1. Task Progress vs Expected Progress
    if expected_progress > 0 and progress < (expected_progress - 15):
        issues.append("progress_behind_schedule")
        risk_score += 30
        if health == "stable": health = "warning"
    
    # 2. Deadline Risk
    if days_left is not None:
        if days_left < 0:
            issues.append("deadline_overdue")
            risk_score += 50
            health = "critical"
        elif days_left < 3:
            issues.append("deadline_critical")
            risk_score += 20
            health = "critical"
        elif days_left < 7:
            issues.append("deadline_approaching")
            risk_score += 10
            if health == "stable": health = "warning"

    # 3. Unassigned Tasks (Critical Issue)
    unassigned_tasks = [t for t in project.tasks if not t.assigned_to and t.status != "completed"]
    if len(unassigned_tasks) > 0:
        issues.append("unassigned_tasks")
        risk_score += 50
        health = "critical"
    
    # 4. Employee Workload Analysis
    employee_loads = {}
    employee_hours = {}
    
    for t in project.tasks:
        if t.assigned_to and t.status != "completed":
            eid = str(t.assigned_to)
            employee_loads[eid] = employee_loads.get(eid, 0) + 1
            
            # Track estimated hours
            hours = getattr(t, 'estimated_hours', 8)
            employee_hours[eid] = employee_hours.get(eid, 0) + hours
    
    max_load = max(employee_loads.values()) if employee_loads else 0
    max_hours = max(employee_hours.values()) if employee_hours else 0
    
    # Check for overload (> 4 active tasks or > 40 hours)
    for eid, load in employee_loads.items():
        hours = employee_hours.get(eid, 0)
        load_percentage = (hours / 40) * 100 if hours > 0 else 0  # Assume 40h/week capacity
        
        if load > 5 or load_percentage > 90:
            issues.append("capacity_critical_overload")
            risk_score += 40
            health = "critical"
        elif load > 3 or load_percentage > 75:
            issues.append("capacity_near_limit")
            risk_score += 15
            if health == "stable": health = "warning"
    
    # 5. Blocked/Dependency Issues (if we had dependency tracking)
    # For now, we'll check for tasks stuck in "in_progress" for too long
    # This is a placeholder for future dependency tracking
    
    return HealthResponse(
        health=health,
        issues=list(set(issues)),
        metrics={
            "progress": round(progress, 1),
            "expected_progress": round(expected_progress, 1),
            "days_left": days_left if days_left is not None else 0,
            "max_load": max_load,
            "max_hours": max_hours,
            "risk_score": risk_score,
            "total_tasks": total_tasks,
            "completed": completed_tasks,
            "in_progress": in_progress_tasks,
            "unassigned": len(unassigned_tasks)
        }
    )

@router.post("/{project_id}/replan-simulate")
async def simulate_replan_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_admin)
):
    """Simulate project replanning without saving changes"""
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        planner = PlannerAgent()
        required_skills_list = [skill.skill_name for skill in project.required_skills]
        
        days_remaining = 7
        if project.deadline:
            try:
                deadline_dt = datetime.fromisoformat(project.deadline.replace('Z', '+00:00'))
                days_remaining = (deadline_dt.date() - datetime.utcnow().date()).days
                days_remaining = max(1, days_remaining)
            except: pass

        plan = await planner.plan(
            project_title=project.title,
            project_description=project.description,
            required_skills=required_skills_list,
            experience_required=project.experience_required,
            days_remaining=days_remaining
        )
        tasks = plan.get("tasks", [])
        
        # Get all candidates for matching simulation
        employees_users = await User.find(User.role == UserRole.EMPLOYEE).to_list()
        employee_user_ids = [u.id for u in employees_users]
        profiles = await EmployeeProfile.find(In(EmployeeProfile.user_id, employee_user_ids)).to_list()
        candidates = []
        for profile in profiles:
            skills = await Skill.find(Skill.employee_id == profile.id).to_list()
            candidates.append({"profile": profile, "skills": skills})

        matcher = MatcherAgent()
        result = await matcher.match(project=project, candidates=candidates, tasks=tasks)
        
        enriched_matches = []
        for match in result.get("matches", []):
            candidate = next((c for c in candidates if str(c["profile"].id) == match["employee_id"]), None)
            if candidate:
                enriched_matches.append({
                    "profile": serialize_doc(candidate["profile"]),
                    "skills": serialize_doc(candidate["skills"]),
                    "score": match["match_score"],
                    "matched_skills": match["matched_skills"],
                    "suggested_task": match["suggested_task"],
                    "reasoning": match["reasoning"]
                })
        
        # Identify changes (Simulation Diff)
        # In a real app, we'd compare old and new plans.
        # For now, we'll return the proposed plan.
        
        return {
            "proposed_tasks": tasks,
            "proposed_assignments": enriched_matches,
            "summary": f"Proposed re-distribution of {len(tasks)} tasks across {len(enriched_matches)} agents."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@router.post("/{project_id}/replan-apply")
async def apply_replan_project(
    project_id: PydanticObjectId,
    plan_data: dict, # Expects { tasks: [], assignments: [] }
    current_user: User = Depends(is_admin)
):
    """
    Apply a simulated replan to the project.
    This will:
    1. Update project tasks with new assignments
    2. Update assigned team list
    3. Set project status to FINALIZED (deploy to portfolio)
    4. Send notifications to all employees about their new tasks
    """
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        tasks = plan_data.get("tasks", [])
        assignments = plan_data.get("assignments", [])
        
        # Task Preservation & Rerouting Logic
        current_tasks = {t.title: t for t in project.tasks}
        updated_tasks = []
        task_assignments = {}
        rerouted_notifications = []

        for t_dict in tasks:
            title = t_dict["title"]
            # Preserve status if task already exists
            status = "backlog"
            old_assignee = None
            if title in current_tasks:
                status = current_tasks[title].status
                old_assignee = current_tasks[title].assigned_to

            # Find new assignment
            match = next((a for a in assignments if a["suggested_task"] == title), None)
            if match:
                profile_data = match["profile"]
                # Handle both _id and id formats
                pid = profile_data.get("_id") or profile_data.get("id")
                if not pid:
                    continue
                    
                new_assignee_id = PydanticObjectId(pid)
                
                # Check for Reroute
                if old_assignee and old_assignee != new_assignee_id:
                    rerouted_notifications.append({
                        "employee_id": old_assignee,
                        "title": f"🔄 Task Rerouted - {title}",
                        "message": f"Task '{title}' has been moved to another agent for optimization."
                    })

                t_dict["assigned_to"] = new_assignee_id
                t_dict["status"] = status # Preserved status
                
                if new_assignee_id not in task_assignments:
                    task_assignments[new_assignee_id] = []
                task_assignments[new_assignee_id].append(t_dict)

            updated_tasks.append(t_dict)
            
        project.tasks = updated_tasks
        
        # Update assigned team list
        new_team_ids = set()
        for a in assignments:
            profile_data = a["profile"]
            pid = profile_data.get("_id") or profile_data.get("id")
            if pid:
                new_team_ids.add(PydanticObjectId(pid))
                
        project.assigned_team = list(new_team_ids)
        
        # 🚀 FINALIZE PROJECT (Deploy to Portfolio)
        project.status = ProjectStatus.FINALIZED
        
        project.updated_at = datetime.utcnow()
        await project.save()
        
        # 📧 SEND NOTIFICATIONS TO EMPLOYEES
        notifications_sent = 0
        for employee_id, tasks_list in task_assignments.items():
            # Create notification for each employee
            task_titles = [t["title"] for t in tasks_list]
            task_count = len(tasks_list)
            
            notification = Notification(
                employee_id=employee_id,
                project_id=project.id,
                notification_type=NotificationType.REPLANNING_APPLIED,
                title=f"🔄 New Tasks Assigned - {project.title}",
                message=f"You have been assigned {task_count} task{'s' if task_count > 1 else ''} in the replanned project '{project.title}': {', '.join(task_titles[:3])}{'...' if task_count > 3 else ''}",
                read=False
            )
            await notification.insert()
            notifications_sent += 1
        
        # 📧 SEND REROUTED NOTIFICATIONS
        for r_notif in rerouted_notifications:
            notification = Notification(
                employee_id=r_notif["employee_id"],
                project_id=project.id,
                notification_type=NotificationType.TASK_REROUTED,
                title=r_notif["title"],
                message=r_notif["message"],
                read=False
            )
            await notification.insert()
            notifications_sent += 1
        
        return {
            "status": "success", 
            "message": f"Neural replan applied successfully. Project deployed to portfolio.",
            "project_status": "finalized",
            "notifications_sent": notifications_sent,
            "tasks_updated": len(updated_tasks),
            "team_size": len(project.assigned_team)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply plan: {str(e)}")


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
        
        # Calculate days remaining
        days_remaining = 7
        if project.deadline:
            try:
                deadline_dt = datetime.fromisoformat(project.deadline.replace('Z', '+00:00'))
                days_remaining = (deadline_dt.date() - datetime.utcnow().date()).days
                days_remaining = max(1, days_remaining)
            except: pass

        plan = await planner.plan(
            project_title=project.title,
            project_description=project.description,
            required_skills=required_skills_list,
            experience_required=project.experience_required,
            days_remaining=days_remaining
        )
        
        # Save tasks to project for persistence
        tasks = plan.get("tasks", [])
        project.tasks = tasks
        await project.save()
        
        return plan

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decomposition failed: {str(e)}")


from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User, UserRole
from app.models.project import Project, ProjectCreate, ProjectUpdate, ProjectStatus
from app.models.employee import EmployeeProfile, Skill, SkillLevel
from app.api.deps import get_current_user, RoleChecker
from beanie import PydanticObjectId
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

@router.get("/{project_id}/match")
async def match_employees_to_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(is_admin)
):
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Simple matching logic:
    # 1. Get all employees
    # 2. For each employee, calculate a score
    
    profiles = await EmployeeProfile.find_all().to_list()
    matches = []
    
    level_weights = {
        SkillLevel.JUNIOR: 1,
        SkillLevel.MID: 2,
        SkillLevel.SENIOR: 3
    }
    
    for profile in profiles:
        employee_skills = await Skill.find(Skill.employee_id == profile.id).to_list()
        
        score = 0
        matched_skills = []
        
        for req_skill in project.required_skills:
            # Find if employee has this skill
            emp_skill = next((s for s in employee_skills if s.skill_name.lower() == req_skill.skill_name.lower()), None)
            
            if emp_skill:
                # Basic match check
                if level_weights[emp_skill.level] >= level_weights[req_skill.level]:
                    score += 10 # Base score for matching skill and level
                    
                    # Bonus for experience
                    if emp_skill.years_of_experience >= project.experience_required:
                        score += 5
                    
                    matched_skills.append({
                        "skill_name": req_skill.skill_name,
                        "emp_level": emp_skill.level,
                        "req_level": req_skill.level,
                        "years": emp_skill.years_of_experience
                    })
        
        if score > 0:
            matches.append({
                "profile": profile,
                "score": score,
                "matched_skills": matched_skills
            })
            
    # Sort by score descending
    matches.sort(key=lambda x: x["score"], reverse=True)
    
    return matches

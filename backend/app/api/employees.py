from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User, UserRole
from app.models.employee import EmployeeProfile, Skill, ProfileUpdate, SkillCreate, ProfileCreate
from app.api.deps import get_current_user, RoleChecker
from beanie import PydanticObjectId
from beanie.operators import In
from app.core.serialization import serialize_doc
from datetime import datetime

router = APIRouter()

is_employee = RoleChecker([UserRole.EMPLOYEE])
is_admin = RoleChecker([UserRole.ADMIN])

@router.post("/profile", response_model=dict)
async def create_profile(
    profile_data: ProfileCreate, 
    current_user: User = Depends(get_current_user)
):
    existing_profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )
    
    profile = EmployeeProfile(
        user_id=current_user.id,
        full_name=profile_data.full_name,
        specialization=profile_data.specialization,
        avatar_url=profile_data.avatar_url
    )
    await profile.insert()
    return serialize_doc(profile)

@router.put("/profile")
async def update_profile_and_skills(
    update_data: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile:
        # If profile doesn't exist, create it (Upsert logic)
        profile = EmployeeProfile(
            user_id=current_user.id, 
            full_name=update_data.full_name or "Employee",
            specialization=update_data.specialization,
            avatar_url=update_data.avatar_url
        )
        await profile.insert()
    
    # Update profile fields if they exist and differ
    if update_data.full_name:
        profile.full_name = update_data.full_name
    if update_data.specialization:
        profile.specialization = update_data.specialization
    if update_data.avatar_url:
        profile.avatar_url = update_data.avatar_url
    
    profile.updated_at = datetime.utcnow()
    await profile.save()
    
    # Update skills if provided
    if update_data.skills is not None:
        # Delete old skills and insert new ones
        await Skill.find(Skill.employee_id == profile.id).delete()
        
        new_skills = [
            Skill(
                employee_id=profile.id,
                skill_name=s.skill_name,
                level=s.level,
                years_of_experience=s.years_of_experience
            ) for s in update_data.skills
        ]
        if new_skills:
            await Skill.insert_many(new_skills)
            
    return {"status": "success", "message": "Profile and skills updated"}

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    
    if not profile:
        # Self-healing: Create default profile if it doesn't exist (e.g. for manual DB entries)
        profile = EmployeeProfile(
            user_id=current_user.id,
            full_name=current_user.email.split('@')[0],
            specialization="System Administrator" if current_user.role == UserRole.ADMIN else "Unassigned",
            avatar_url=""
        )
        await profile.insert()
    
    skills = await Skill.find(Skill.employee_id == profile.id).to_list()
    
    return serialize_doc({
        "user": {
            "email": current_user.email,
            "role": current_user.role
        },
        "profile": profile,
        "skills": skills
    })
@router.get("/", response_model=List[dict])
async def list_all_employees(current_user: User = Depends(is_admin)):
    # Only list users with EMPLOYEE role
    employee_users = await User.find(User.role == UserRole.EMPLOYEE).to_list()
    employee_user_ids = [u.id for u in employee_users]
    
    profiles = await EmployeeProfile.find(In(EmployeeProfile.user_id, employee_user_ids)).to_list()
    result = []
    
    for profile in profiles:
        skills = await Skill.find(Skill.employee_id == profile.id).to_list()
        # Get count of active projects
        from app.models.project import Project, ProjectStatus
        project_count = await Project.find({
            "assigned_team": profile.id,
            "status": ProjectStatus.FINALIZED
        }).count()
        
        result.append({
            "profile": profile,
            "skills": skills,
            "project_count": project_count
        })
        
    return serialize_doc(result)

@router.get("/{employee_id}", response_model=dict)
async def get_employee_details(
    employee_id: PydanticObjectId,
    current_user: User = Depends(is_admin)
):
    profile = await EmployeeProfile.get(employee_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    skills = await Skill.find(Skill.employee_id == profile.id).to_list()
    
    return serialize_doc({
        "profile": profile,
        "skills": skills
    })

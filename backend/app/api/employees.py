from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User, UserRole
from app.models.employee import EmployeeProfile, Skill, ProfileUpdate, SkillCreate
from app.api.deps import get_current_user, RoleChecker
from beanie import PydanticObjectId
from datetime import datetime

router = APIRouter()

is_employee = RoleChecker([UserRole.EMPLOYEE])

@router.post("/profile", response_model=EmployeeProfile)
async def create_profile(
    full_name: str, 
    avatar_url: Optional[str] = None,
    current_user: User = Depends(is_employee)
):
    existing_profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )
    
    profile = EmployeeProfile(
        user_id=current_user.id,
        full_name=full_name,
        avatar_url=avatar_url
    )
    await profile.insert()
    return profile

@router.put("/profile")
async def update_profile_and_skills(
    update_data: ProfileUpdate,
    current_user: User = Depends(is_employee)
):
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update profile fields
    if update_data.full_name:
        profile.full_name = update_data.full_name
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
async def get_my_profile(current_user: User = Depends(is_employee)):
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile:
        # Business logic: New employees must add skills/profile before dashboard
        # But here we just return not found or a specific flag
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profile not found. Please complete your profile first."
        )
    
    skills = await Skill.find(Skill.employee_id == profile.id).to_list()
    
    return {
        "user": {
            "email": current_user.email,
            "role": current_user.role
        },
        "profile": profile,
        "skills": skills
    }

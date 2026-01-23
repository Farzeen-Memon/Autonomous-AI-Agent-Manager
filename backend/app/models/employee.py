from datetime import datetime
from typing import Optional, List
from beanie import Document, Link, PydanticObjectId
from pydantic import Field, BaseModel
from enum import Enum

class SkillLevel(str, Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"

class Skill(Document):
    employee_id: PydanticObjectId
    skill_name: str
    level: SkillLevel
    years_of_experience: float
    
    class Settings:
        name = "skills"

class EmployeeProfile(Document):
    user_id: PydanticObjectId
    full_name: str
    avatar_url: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "employee_profiles"

# For API responses and requests
class SkillCreate(BaseModel):
    skill_name: str
    level: SkillLevel
    years_of_experience: float

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[SkillCreate]] = None

from datetime import datetime
from typing import Optional, List
from beanie import Document, Link, PydanticObjectId
from pydantic import Field, BaseModel, ConfigDict
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
    specialization: Optional[str] = None
    avatar_url: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "user_profiles"

# For API responses and requests
class SkillCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    skill_name: str
    level: SkillLevel
    years_of_experience: float

class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[SkillCreate]] = None

class ProfileCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    full_name: str
    specialization: Optional[str] = None
    avatar_url: Optional[str] = None

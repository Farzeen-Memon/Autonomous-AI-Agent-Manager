from datetime import datetime
from typing import List, Optional
from beanie import Document, PydanticObjectId
from pydantic import Field, BaseModel
from enum import Enum
from app.models.employee import SkillLevel

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    FINALIZED = "finalized"

class RequiredSkill(BaseModel):
    skill_name: str
    level: SkillLevel

class Project(Document):
    title: str
    description: str
    required_skills: List[RequiredSkill]
    experience_required: float # In years
    status: ProjectStatus = ProjectStatus.DRAFT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"

class ProjectCreate(BaseModel):
    title: str
    description: str
    required_skills: List[RequiredSkill]
    experience_required: float

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[RequiredSkill]] = None
    experience_required: Optional[float] = None
    status: Optional[ProjectStatus] = None

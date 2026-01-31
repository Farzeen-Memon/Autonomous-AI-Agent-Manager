from datetime import datetime
from typing import List, Optional
from beanie import Document, PydanticObjectId
from pydantic import Field, BaseModel, ConfigDict
from enum import Enum
from app.models.employee import SkillLevel

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    FINALIZED = "finalized"

class RequiredSkill(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    skill_name: str
    level: SkillLevel

class Project(Document):
    title: str
    description: str
    required_skills: List[RequiredSkill]
    experience_required: float # In years
    team_size: int = 5
    status: ProjectStatus = ProjectStatus.DRAFT
    assigned_team: List[PydanticObjectId] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"

class ProjectCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    title: str
    description: str
    required_skills: List[RequiredSkill]
    experience_required: float
    team_size: Optional[int] = 5
    assigned_team: Optional[List[PydanticObjectId]] = []

class ProjectUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[RequiredSkill]] = None
    experience_required: Optional[float] = None
    team_size: Optional[int] = None
    status: Optional[ProjectStatus] = None
    assigned_team: Optional[List[PydanticObjectId]] = None

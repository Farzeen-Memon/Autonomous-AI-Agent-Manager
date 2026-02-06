from beanie import Document, PydanticObjectId
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationType:
    TASK_ASSIGNED = "task_assigned"
    TASK_UPDATED = "task_updated"
    PROJECT_DEPLOYED = "project_deployed"
    DEADLINE_APPROACHING = "deadline_approaching"
    REPLANNING_APPLIED = "replanning_applied"

class Notification(Document):
    """
    Notification model for employee alerts
    """
    employee_id: PydanticObjectId  # The employee who receives this notification
    project_id: Optional[PydanticObjectId] = None
    task_title: Optional[str] = None
    notification_type: str  # task_assigned, project_deployed, etc.
    title: str
    message: str
    read: bool = False
    created_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "notifications"
        indexes = [
            "employee_id",
            "read",
            "created_at"
        ]

class NotificationCreate(BaseModel):
    employee_id: str
    project_id: Optional[str] = None
    task_title: Optional[str] = None
    notification_type: str
    title: str
    message: str

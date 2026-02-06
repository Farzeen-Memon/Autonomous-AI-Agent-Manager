from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User
from app.models.employee import EmployeeProfile, Skill
from app.models.project import Project
from app.models.notification import Notification
from app.core.config import settings

async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User,
            EmployeeProfile,
            Skill,
            Project,
            Notification
        ]
    )

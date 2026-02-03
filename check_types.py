
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.project import Project
from app.models.employee import EmployeeProfile
from app.models.user import User
from app.core.config import settings
from bson import ObjectId

async def check_data():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.nexo_db, document_models=[Project, EmployeeProfile, User])
    
    projects = await Project.find_all().to_list()
    print(f"Found {len(projects)} projects")
    for p in projects:
        print(f"Project: {p.title} (Status: {p.status})")
        print(f"  Assigned Team Types: {[type(tid) for tid in p.assigned_team]}")
        for task in p.tasks:
            print(f"  - Task: {task.title} (Assigned to: {task.assigned_to}, Type: {type(task.assigned_to)})")
            
    profiles = await EmployeeProfile.find_all().to_list()
    for prof in profiles:
        print(f"Profile: {prof.full_name} (ID: {prof.id}, Type: {type(prof.id)})")

if __name__ == "__main__":
    asyncio.run(check_data())

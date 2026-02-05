
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.project import Project
from app.models.employee import EmployeeProfile
from app.models.user import User
from app.core.config import settings
from bson import ObjectId

async def simulate_by_id(profile_id_str):
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.nexo_db, document_models=[Project, EmployeeProfile, User])
    
    pid = ObjectId(profile_id_str)
    projects = await Project.find({"assigned_team": pid}).to_list()
    print(f"DEBUG: Profile ID: {pid} matched {len(projects)} projects")
    for p in projects:
        print(f"DEBUG: Project {p.title} (Status: {p.status}) tasks counts: {len(p.tasks)}")
        for task in p.tasks:
            if task.assigned_to == pid:
                print(f"  - Assigned Task: {task.title} (Status: {task.status})")

if __name__ == "__main__":
    import sys
    profile_id = sys.argv[1] if len(sys.argv) > 1 else "69798b081b69c1761185b156"
    asyncio.run(simulate_by_id(profile_id))

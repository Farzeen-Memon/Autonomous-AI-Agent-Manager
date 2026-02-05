
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.project import Project
from app.models.employee import EmployeeProfile
from app.models.user import User
from app.core.config import settings
from bson import ObjectId

async def check_users():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.nexo_db, document_models=[Project, EmployeeProfile, User])
    
    users = await User.find_all().to_list()
    profiles = await EmployeeProfile.find_all().to_list()
    
    profile_map = {p.user_id: p for p in profiles}
    
    for u in users:
        p = profile_map.get(u.id)
        p_id = p.id if p else "NO PROFILE"
        print(f"User: {u.email} (Role: {u.role}) -> Profile ID: {p_id}")
        
    projects = await Project.find(Project.status == "finalized").to_list()
    print("\nFinalized Projects Team Assignments:")
    for proj in projects:
        print(f"Project: {proj.title}")
        print(f"  Team IDs: {proj.assigned_team}")

if __name__ == "__main__":
    asyncio.run(check_users())

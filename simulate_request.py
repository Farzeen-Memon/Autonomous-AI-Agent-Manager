
import requests
import json
import sys

# Replace with actual email/password if known, or try to get token from storage if I could
# Since I don't have the password, I'll use a script that runs INSIDE the backend environment 
# to simulate the request or just call the function directly.

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.project import Project
from app.models.employee import EmployeeProfile
from app.models.user import User
from app.core.config import settings

async def simulate_request(email):
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.nexo_db, document_models=[Project, EmployeeProfile, User])
    
    user = await User.find_one(User.email == email)
    if not user:
        print(f"User {email} not found")
        return
    
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == user.id)
    if not profile:
        print(f"Profile for {email} not found")
        return
        
    projects = await Project.find({"assigned_team": profile.id}).to_list()
    print(f"DEBUG: User {email} (Profile ID: {profile.id}) matched {len(projects)} projects")
    for p in projects:
        print(f"DEBUG: Project {p.title} tasks counts: {len(p.tasks)}")
        for task in p.tasks:
            if task.assigned_to == profile.id:
                print(f"  - Assigned Task: {task.title} (Status: {task.status})")

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "swejal@nexus.com" # Guessing email based on name
    asyncio.run(simulate_request(email))

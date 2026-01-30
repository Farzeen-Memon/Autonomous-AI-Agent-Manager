import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def inspect():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL', 'mongodb://localhost:27017'))
    db = client[os.getenv('DATABASE_NAME', 'nexo_db')]
    
    # Use lowercase collection names as Beanie does by default (or check what they are)
    # Based on models: 
    # EmployeeProfile.Settings.name = "user_profiles"
    # Skill.Settings.name = "skills"
    
    profiles_cursor = db.user_profiles.find()
    profiles = await profiles_cursor.to_list(length=100)
    
    print(f"\nFound {len(profiles)} profiles in 'user_profiles' collection:")
    for p in profiles:
        p_id = p['_id']
        name = p.get('full_name', 'Unknown')
        spec = p.get('specialization', 'N/A')
        
        skills_cursor = db.skills.find({'employee_id': p_id})
        skills = await skills_cursor.to_list(length=100)
        
        skills_str = ", ".join([f"{s.get('skill_name')} ({s.get('level')})" for s in skills]) if skills else "No skills found"
        print(f" - {name} ({spec}): {skills_str}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect())

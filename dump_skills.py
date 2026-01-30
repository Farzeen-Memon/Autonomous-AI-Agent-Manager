import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))
load_dotenv('backend/.env')

async def dump_skills():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL', 'mongodb://localhost:27017'))
    db = client[os.getenv('DATABASE_NAME', 'nexo_db')]
    
    profiles = await db.user_profiles.find().to_list(100)
    print(f"TOTAL PROFILES: {len(profiles)}")
    
    for p in profiles:
        name = p.get('full_name', 'Unknown')
        p_id = p['_id']
        skills = await db.skills.find({'employee_id': p_id}).to_list(100)
        skill_names = [s.get('skill_name') for s in skills]
        print(f"EMPLOYEE: {name} | SKILLS: {', '.join(skill_names)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(dump_skills())

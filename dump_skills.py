import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.employee import EmployeeProfile, Skill
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def dump():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    await init_beanie(database=client['nexo_db'], document_models=[EmployeeProfile, Skill])
    
    profiles = await EmployeeProfile.find_all().to_list()
    
    for p in profiles:
        skills = await Skill.find(Skill.employee_id == p.id).to_list()
        s_names = [s.skill_name for s in skills]
        print(f"NAME: {p.full_name}")
        print(f"SKILLS: {s_names}")
        print("-" * 20)

    client.close()

if __name__ == "__main__":
    asyncio.run(dump())

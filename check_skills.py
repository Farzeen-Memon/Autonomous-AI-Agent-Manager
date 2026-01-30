import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.employee import EmployeeProfile, Skill
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def inspect():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    await init_beanie(database=client['nexo_db'], document_models=[EmployeeProfile, Skill])
    
    profiles = await EmployeeProfile.find_all().to_list()
    print(f"Found {len(profiles)} profiles")
    
    for p in profiles:
        skills = await Skill.find(Skill.employee_id == p.id).to_list()
        names = [s.skill_name for s in skills]
        print(f"Employee: {p.full_name}, Spec: {p.specialization}, Skills: {names}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect())

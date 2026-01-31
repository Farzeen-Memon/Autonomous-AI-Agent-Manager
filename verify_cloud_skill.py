import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.employee import EmployeeProfile, Skill
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def check_cloud():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    await init_beanie(database=client['nexo_db'], document_models=[EmployeeProfile, Skill])
    
    profiles = await EmployeeProfile.find_all().to_list()
    print(f"Scanning {len(profiles)} profiles for 'cloud' skill...")
    
    found_count = 0
    for p in profiles:
        skills = await Skill.find(Skill.employee_id == p.id).to_list()
        cloud_skills = [s for s in skills if 'cloud' in s.skill_name.lower()]
        
        if cloud_skills:
            found_count += 1
            s_names = [s.skill_name for s in cloud_skills]
            print(f"MATCH: {p.full_name} (ID: {p.id}) has skills: {s_names}")
        else:
            all_skills = [s.skill_name for s in skills]
            print(f"NO MATCH: {p.full_name} (ID: {p.id}) skills: {all_skills}")

    print(f"Total with 'cloud': {found_count}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_cloud())

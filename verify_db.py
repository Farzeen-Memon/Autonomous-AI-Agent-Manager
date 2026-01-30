import asyncio
import sys
import os

sys.path.insert(0, 'backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def verify():
    client = AsyncIOMotorClient(os.getenv('MONGO_URL', 'mongodb://localhost:27017'))
    db = client[os.getenv('MONGO_DB_NAME', 'nexo_db')]
    
    profile_count = await db.employeeprofile.count_documents({})
    skill_count = await db.skill.count_documents({})
    
    print(f"\n✅ Database Status:")
    print(f"   Profiles: {profile_count}")
    print(f"   Skills: {skill_count}")
    
    if profile_count > 0:
        print(f"\n📋 First 3 Employees:")
        profiles = await db.employeeprofile.find().limit(3).to_list(3)
        for p in profiles:
            name = p.get('full_name', 'Unknown')
            spec = p.get('specialization', 'N/A')
            print(f"   - {name} ({spec})")
    else:
        print("\n❌ NO PROFILES FOUND! Run create_sample_employees.py")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(verify())


import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def debug_db():
    print("Checking database directly...")
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME')]
    
    profiles = await db.user_profiles.find().to_list(100)
    print(f"Profiles found: {len(profiles)}")
    for p in profiles:
        print(f"- Profile ID: {p['_id']}, Name: {p.get('full_name')}")
        skills = await db.skills.find({'employee_id': p['_id']}).to_list(100)
        print(f"  Skills ({len(skills)}): {[s.get('skill_name') for s in skills]}")

    client.close()

if __name__ == "__main__":
    asyncio.run(debug_db())

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))
load_dotenv('backend/.env')

async def migrate():
    mongo_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DATABASE_NAME', 'nexo_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"🚀 Starting migration for database: {db_name}")

    # 1. Migrate Profiles: employeeprofile -> user_profiles
    old_profiles_count = await db.employeeprofile.count_documents({})
    if old_profiles_count > 0:
        print(f"📋 Migrating {old_profiles_count} profiles from 'employeeprofile' to 'user_profiles'...")
        profiles = await db.employeeprofile.find().to_list(None)
        # Avoid duplicates
        for p in profiles:
            exists = await db.user_profiles.find_one({'_id': p['_id']})
            if not exists:
                await db.user_profiles.insert_one(p)
        print("✅ Profiles migrated.")
    else:
        print("ℹ️ No profiles found in 'employeeprofile'.")

    # 2. Migrate Skills: skill -> skills
    old_skills_count = await db.skill.count_documents({})
    if old_skills_count > 0:
        print(f"📋 Migrating {old_skills_count} skills from 'skill' to 'skills'...")
        skills = await db.skill.find().to_list(None)
        for s in skills:
            exists = await db.skills.find_one({'_id': s['_id']})
            if not exists:
                await db.skills.insert_one(s)
        print("✅ Skills migrated.")
    else:
        print("ℹ️ No skills found in 'skill'.")

    # Optional: Clean up old collections
    # await db.employeeprofile.drop()
    # await db.skill.drop()
    # print("🧹 Old collections dropped.")

    print("\n🎉 Migration complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate())

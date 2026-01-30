"""
Quick check to see database contents
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('./backend/.env')

async def check_db():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')
    
    print(f"Connecting to: {mongo_url}")
    print(f"Database: {db_name}\n")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Count documents
    user_count = await db.users.count_documents({'role': 'employee'})
    profile_count = await db.employeeprofile.count_documents({})
    skill_count = await db.skill.count_documents({})
    
    print(f"👥 Employee Users: {user_count}")
    print(f"📋 Employee Profiles: {profile_count}")
    print(f"🛠️  Skills: {skill_count}\n")
    
    # List profiles with skills
    if profile_count > 0:
        print("=" * 60)
        print("EMPLOYEE PROFILES:")
        print("=" * 60)
        
        profiles = await db.employeeprofile.find().to_list(100)
        for i, profile in enumerate(profiles, 1):
            print(f"\n{i}. {profile.get('full_name', 'Unknown')}")
            print(f"   ID: {profile.get('_id')}")
            print(f"   Specialization: {profile.get('specialization', 'N/A')}")
            
            # Get skills for this profile
            profile_skills = await db.skill.find({'employee_id': profile.get('_id')}).to_list(100)
            if profile_skills:
                print(f"   Skills:")
                for skill in profile_skills:
                    print(f"      - {skill.get('skill_name')}: {skill.get('level')} ({skill.get('years_of_experience')} years)")
            else:
                print(f"   Skills: None")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_db())

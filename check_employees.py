"""
Quick script to check if employees exist in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

async def check_employees():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check users
    users = await db.users.find({"role": "employee"}).to_list(100)
    print(f"\n[INFO] Found {len(users)} employee users:")
    for user in users:
        print(f"  - {user.get('email')} (id: {user.get('_id')})")
    
    # Check employee profiles
    profiles = await db.employeeprofile.find().to_list(100)
    print(f"\n[INFO] Found {len(profiles)} employee profiles:")
    for profile in profiles:
        print(f"  - {profile.get('full_name')} (user_id: {profile.get('user_id')})")
    
    # Check skills
    skills = await db.skill.find().to_list(100)
    print(f"\n[INFO] Found {len(skills)} skills:")
    for skill in skills:
        print(f"  - {skill.get('skill_name')}: {skill.get('level')} (employee_id: {skill.get('employee_id')})")
    
    client.close()
    
    if len(users) == 0:
        print("\n[WARNING] No employee users found! You need to create employee accounts first.")
    if len(profiles) == 0:
        print("\n[WARNING] No employee profiles found! Employees need to complete their profiles.")
    if len(skills) == 0:
        print("\n[WARNING] No skills found! Employees need to add their skills.")

if __name__ == "__main__":
    asyncio.run(check_employees())

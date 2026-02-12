
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime
from bson import ObjectId

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
load_dotenv('./backend/.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def ensure_employees():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    employees_to_create = [
        {
            "name": "Rohan Patel",
            "email": "rohan@gmail.com",
            "specialization": "Cloud Engineer",
            "skills": [
                {"skill_name": "AWS", "level": "senior", "years_of_experience": 5.0},
                {"skill_name": "Docker", "level": "senior", "years_of_experience": 4.0},
                {"skill_name": "Kubernetes", "level": "mid", "years_of_experience": 2.0},
            ]
        },
        {
            "name": "Ananya Verma",
            "email": "ananya@gmail.com",
            "specialization": "Data Scientist",
            "skills": [
                {"skill_name": "ML", "level": "mid", "years_of_experience": 3.0},
                {"skill_name": "Python", "level": "senior", "years_of_experience": 4.0},
                {"skill_name": "SQL", "level": "mid", "years_of_experience": 3.0},
            ]
        },
        {
            "name": "Vikram Sharma",
            "email": "vikram@gmail.com",
            "specialization": "Frontend Developer",
            "skills": [
                {"skill_name": "React", "level": "mid", "years_of_experience": 2.0},
                {"skill_name": "JavaScript", "level": "senior", "years_of_experience": 4.0},
                {"skill_name": "CSS", "level": "mid", "years_of_experience": 3.0},
            ]
        }
    ]

    print("Creating/Updating Employees...\n")

    for emp in employees_to_create:
        # 1. Create/Get User
        user = await db.users.find_one({"email": emp["email"]})
        if not user:
            print(f"Creating user for {emp['name']}...")
            user_id = ObjectId()
            hashed_password = pwd_context.hash("123456")
            user = {
                "_id": user_id,
                "email": emp["email"],
                "hashed_password": hashed_password,
                "role": "employee",
                "is_active": True,
                "created_at": datetime.utcnow()
            }
            await db.users.insert_one(user)
        else:
            print(f"User {emp['email']} exists. Resetting password...")
            hashed_password = pwd_context.hash("123456")
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"hashed_password": hashed_password}}
            )
            user_id = user["_id"]

        # 2. Create/Update Profile
        profile = await db.user_profiles.find_one({"user_id": user_id})
        if not profile:
            print(f"Creating profile for {emp['name']}...")
            profile_id = ObjectId()
            profile = {
                "_id": profile_id,
                "user_id": user_id,
                "full_name": emp["name"],
                "specialization": emp["specialization"],
                "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={emp['name']}",
                "updated_at": datetime.utcnow()
            }
            await db.user_profiles.insert_one(profile)
        else:
            print(f"Updating profile for {emp['name']}...")
            await db.user_profiles.update_one(
                {"_id": profile["_id"]},
                {"$set": {
                    "full_name": emp["name"],
                    "specialization": emp["specialization"],
                    "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={emp['name']}"
                }}
            )
            profile_id = profile["_id"]

        # 3. Update Skills (Clear and Re-insert)
        await db.skills.delete_many({"employee_id": profile_id})
        for skill_data in emp["skills"]:
            skill = {
                "employee_id": profile_id,
                "skill_name": skill_data["skill_name"],
                "level": skill_data["level"],
                "years_of_experience": skill_data["years_of_experience"],
                "created_at": datetime.utcnow()
            }
            await db.skills.insert_one(skill)
        
        print(f"✅ {emp['name']} Ready: {emp['email']} / 123456")

    client.close()

if __name__ == "__main__":
    asyncio.run(ensure_employees())

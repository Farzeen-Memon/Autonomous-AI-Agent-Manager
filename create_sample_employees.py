"""
Create sample employee profiles with skills for testing
"""
import asyncio
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv('./backend/.env')

async def create_sample_data():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🚀 Creating sample employee profiles with skills...\n")
    
    # Get existing employee users
    users = await db.users.find({'role': 'employee'}).to_list(100)
    
    if len(users) == 0:
        print("❌ No employee users found! Create employee accounts first.")
        client.close()
        return
    
    print(f"✅ Found {len(users)} employee users\n")
    
    # Sample employee data
    sample_employees = [
        {
            "name": "Aarav Kumar",
            "specialization": "ML Engineer",
            "skills": [
                {"skill_name": "ML", "level": "senior", "years_of_experience": 5.0},
                {"skill_name": "Python", "level": "senior", "years_of_experience": 6.0},
                {"skill_name": "TensorFlow", "level": "mid", "years_of_experience": 3.0},
            ]
        },
        {
            "name": "Priya Singh",
            "specialization": "Full Stack Developer",
            "skills": [
                {"skill_name": "React", "level": "senior", "years_of_experience": 4.0},
                {"skill_name": "Node.js", "level": "mid", "years_of_experience": 3.0},
                {"skill_name": "MongoDB", "level": "mid", "years_of_experience": 2.0},
            ]
        },
        {
            "name": "Rohan Patel",
            "specialization": "Cloud Engineer",
            "skills": [
                {"skill_name": "AWS", "level": "senior", "years_of_experience": 5.0},
                {"skill_name": "Docker", "level": "senior", "years_of_experience": 4.0},
                {"skill_name": "Kubernetes", "level": "mid", "years_of_experience": 2.0},
            ]
        },
        {
            "name": "Ananya Verma",
            "specialization": "Data Scientist",
            "skills": [
                {"skill_name": "ML", "level": "mid", "years_of_experience": 3.0},
                {"skill_name": "Python", "level": "senior", "years_of_experience": 4.0},
                {"skill_name": "SQL", "level": "mid", "years_of_experience": 3.0},
            ]
        },
        {
            "name": "Vikram Sharma",
            "specialization": "Frontend Developer",
            "skills": [
                {"skill_name": "React", "level": "mid", "years_of_experience": 2.0},
                {"skill_name": "JavaScript", "level": "senior", "years_of_experience": 4.0},
                {"skill_name": "CSS", "level": "mid", "years_of_experience": 3.0},
            ]
        },
        {
            "name": "Ishita Reddy",
            "specialization": "DevOps Engineer",
            "skills": [
                {"skill_name": "CI/CD", "level": "senior", "years_of_experience": 4.0},
                {"skill_name": "Jenkins", "level": "mid", "years_of_experience": 2.0},
                {"skill_name": "Python", "level": "mid", "years_of_experience": 2.0},
            ]
        },
    ]
    
    for i, user in enumerate(users[:6]):  # Use first 6 users
        if i >= len(sample_employees):
            break
            
        employee_data = sample_employees[i]
        
        # Create profile
        profile_id = ObjectId()
        profile = {
            "_id": profile_id,
            "user_id": user['_id'],
            "full_name": employee_data["name"],
            "specialization": employee_data["specialization"],
            "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={employee_data['name']}",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.user_profiles.insert_one(profile)
        print(f"✅ Created profile: {employee_data['name']} ({employee_data['specialization']})")
        
        # Create skills
        for skill_data in employee_data["skills"]:
            skill = {
                "_id": ObjectId(),
                "employee_id": profile_id,
                "skill_name": skill_data["skill_name"],
                "level": skill_data["level"],
                "years_of_experience": skill_data["years_of_experience"],
                "created_at": datetime.utcnow()
            }
            await db.skills.insert_one(skill)
            print(f"   + {skill_data['skill_name']}: {skill_data['level']} ({skill_data['years_of_experience']} years)")
    
    print(f"\n🎉 Sample data created successfully!")
    print(f"\n💡 Now refresh your browser and you should see employees with scores!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_sample_data())

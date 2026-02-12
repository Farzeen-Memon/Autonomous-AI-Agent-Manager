
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
load_dotenv('./backend/.env')

async def diagnose_assignments():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    print("--- DIAGNOSING TASK VISIBILITY ---\n")

    # 1. Get Projects
    projects = await db.projects.find({}).to_list(None)
    print(f"Total Projects: {len(projects)}")

    for proj in projects:
        print(f"\nProject: {proj.get('title')} (Status: {proj.get('status')})")
        assigned_team = proj.get('assigned_team', [])
        print(f"  Assigned Team IDs ({len(assigned_team)}): {assigned_team}")

        # tasks
        tasks = proj.get('tasks', [])
        print(f"  Total Tasks: {len(tasks)}")
        
        assigned_tasks = [t for t in tasks if t.get('assigned_to')]
        print(f"  Assigned Tasks: {len(assigned_tasks)}")
        
        for t in assigned_tasks:
             print(f"    - Task: {t.get('title')} -> Assigned To: {t.get('assigned_to')}")

    # 2. Check Employees
    print("\n--- EMPLOYEE PROFILES ---")
    profiles = await db.user_profiles.find({}).to_list(None)
    for p in profiles:
        print(f"Name: {p.get('full_name')} | ID: {p.get('_id')} | UserID: {p.get('user_id')}")

    client.close()

if __name__ == "__main__":
    asyncio.run(diagnose_assignments())

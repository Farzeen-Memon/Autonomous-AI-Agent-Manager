
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
    
    with open("visibility_report_clean.txt", "w", encoding="utf-8") as f:
        f.write("--- DIAGNOSING TASK VISIBILITY ---\n")

        # 1. Get Projects
        projects = await db.projects.find({}).to_list(None)
        f.write(f"\nTotal Projects: {len(projects)}\n")

        for proj in projects:
            f.write(f"\nProject: {proj.get('title')} (Status: {proj.get('status')})\n")
            assigned_team = proj.get('assigned_team', [])
            f.write(f"  Assigned Team IDs ({len(assigned_team)}): {[str(i) for i in assigned_team]}\n")

            # tasks
            tasks = proj.get('tasks', [])
            f.write(f"  Total Tasks: {len(tasks)}\n")
            
            assigned_tasks = [t for t in tasks if t.get('assigned_to')]
            f.write(f"  Assigned Tasks: {len(assigned_tasks)}\n")
            
            for t in assigned_tasks:
                 f.write(f"    - Task: {t.get('title')} -> Assigned To: {t.get('assigned_to')}\n")

        # 2. Check Employees
        f.write("\n--- EMPLOYEE PROFILES ---\n")
        profiles = await db.user_profiles.find({}).to_list(None)
        for p in profiles:
            f.write(f"Name: {p.get('full_name')} | ID: {str(p.get('_id'))} | UserID: {p.get('user_id')}\n")

    client.close()
    print("Report generated: visibility_report_clean.txt")

if __name__ == "__main__":
    asyncio.run(diagnose_assignments())

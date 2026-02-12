
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
load_dotenv('./backend/.env')

async def consolidate_profiles():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Consolidating Duplicate Profiles...\n")
    
    # Map of Email -> Latest Profile ID (the one we just created)
    # We will identify the CORRECT Profile ID for each user email
    user_email_map = {
        "rohan@gmail.com": None,
        "vikram@gmail.com": None,
        "ananya@gmail.com": None,
        # Add others if needed
    }
    
    # 1. Find the User IDs for these emails
    for email in user_email_map.keys():
        user = await db.users.find_one({"email": email})
        if user:
            print(f"User {email} has ID: {user['_id']}")
            
            # Find ALL profiles for this user
            profiles = await db.user_profiles.find({"user_id": user["_id"]}).to_list(None)
            print(f"  > Found {len(profiles)} profiles linked to this user.")
            
            if profiles:
                # The latest one is likely the one we want to keep if we just created it
                # Sort by creation id (monotonic)
                profiles.sort(key=lambda x: x["_id"], reverse=True)
                correct_profile = profiles[0]
                correct_profile_id = correct_profile["_id"]
                user_email_map[email] = correct_profile_id
                print(f"  > KEEPING profile: {correct_profile_id} ({correct_profile.get('full_name')})")
                
                # Delete older duplicate profiles for this user
                for p in profiles[1:]:
                    print(f"  > DELETING old profile: {p['_id']}")
                    await db.user_profiles.delete_one({"_id": p["_id"]})

            
    # 2. Update Projects to point to the Correct Profile ID
    # For any task or assignment pointing to a deleted/old profile, we need to remap it?
    # This is tricky without knowing which old ID maps to which new ID.
    # Instead, let's just ensure that projects assigned to these *Users* use the *Current Profile ID*.
    
    # Actually, the easier fix for visibility is:
    # ensure the projects are assigned to the ID that the User actually has now.
    
    print("\nCorrecting Project Assignments...")
    projects = await db.projects.find({}).to_list(None)
    
    for proj in projects:
        updated = False
        new_team = []
        assigned_team = proj.get("assigned_team", [])
        
        # We need to check if any of the assigned IDs are "stale"
        # Ideally, we look up the USER associated with the assigned ID, then get their NEW Profile ID.
        
        current_team_set = set()
        
        for pid in assigned_team:
            # Is this a valid profile?
            profile = await db.user_profiles.find_one({"_id": pid})
            
            final_pid = pid
            
            if not profile:
                print(f"  [Project: {proj['title']}] Found ORPHANED assignment {pid}")
                # Try to rescue?
                # Cannot easily rescue without context.
                updated = True # Remove it
                continue
            else:
                 # It exists. Is it the "current" one for that user?
                 user_id = profile["user_id"]
                 # Find the 'best' profile for this user
                 # (Which we determined earlier, or just find fresh)
                 best_profile = await db.user_profiles.find_one({"user_id": user_id}, sort=[("_id", -1)])
                 
                 if best_profile and best_profile["_id"] != pid:
                     print(f"  [Project: {proj['title']}] Migration: {pid} -> {best_profile['_id']} ({best_profile['full_name']})")
                     final_pid = best_profile["_id"]
                     updated = True
            
            current_team_set.add(final_pid)

        if updated:
            new_team = list(current_team_set)
            await db.projects.update_one(
                {"_id": proj["_id"]},
                {"$set": {"assigned_team": new_team}}
            )
            print(f"  > Updated team for {proj['title']}")
            
        # Also need to update TASKS
        tasks = proj.get("tasks", [])
        tasks_updated = False
        new_tasks = []
        for t in tasks:
            assignee = t.get("assigned_to")
            if assignee:
                 # Check if this assignee ID needs migration
                 p = await db.user_profiles.find_one({"_id": assignee})
                 if p:
                     user_id = p["user_id"]
                     best_profile = await db.user_profiles.find_one({"user_id": user_id}, sort=[("_id", -1)])
                     if best_profile and best_profile["_id"] != assignee:
                          print(f"  [Task: {t['title']}] Migration: {assignee} -> {best_profile['_id']}")
                          t["assigned_to"] = best_profile["_id"]
                          tasks_updated = True
                 else:
                     # Orphaned task assignment
                     print(f"  [Task: {t['title']}] Unassigning orphaned ID {assignee}")
                     t["assigned_to"] = None
                     tasks_updated = True
            new_tasks.append(t)
            
        if tasks_updated:
            await db.projects.update_one(
                {"_id": proj["_id"]},
                {"$set": {"tasks": new_tasks}}
            )
            print(f"  > Updated tasks for {proj['title']}")

    client.close()
    print("Consolidation Complete.")

if __name__ == "__main__":
    asyncio.run(consolidate_profiles())

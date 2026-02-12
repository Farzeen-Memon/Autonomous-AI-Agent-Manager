
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
load_dotenv('./backend/.env')

async def fix_users():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    print("Fixing user documents in DB...")
    
    users = await db.users.find({}).to_list(None)
    
    for user in users:
        print(f"Checking user {user.get('email')}...")
        updates = {}
        unset = {}
        
        # 1. Fix password field name
        if "hashed_password" in user:
            print(f"  - renaming hashed_password -> password_hash")
            updates["password_hash"] = user["hashed_password"]
            unset["hashed_password"] = ""
        
        # 2. Add password_hash if missing
        if "password_hash" not in user and "hashed_password" not in user:
             # Just set a placeholder hash for now if strictly needed
             print(f"  - WARNING: No password hash found!")
        
        # 3. Ensure role matches Enum
        if "role" in user and user["role"] not in ["admin", "employee"]:
             print(f"  - WARNING: Invalid role {user['role']}")

        operation = {}
        if updates:
            operation["$set"] = updates
        if unset:
            operation["$unset"] = unset
            
        if operation:
            await db.users.update_one({"_id": user["_id"]}, operation)
            print("  - Updated.")
        else:
            print("  - No changes needed.")

    client.close()
    print("Fix complete.")

if __name__ == "__main__":
    asyncio.run(fix_users())

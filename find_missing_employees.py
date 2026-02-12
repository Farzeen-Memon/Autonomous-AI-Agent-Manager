
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
load_dotenv('./backend/.env')

async def find_specific_employees():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    target_names = ["Rohan", "Vikram", "Ananya"]
    print(f"Searching for keys: {target_names}...\n")

    for name in target_names:
        # Case insensitive regex search
        profile = await db.user_profiles.find_one({"full_name": {"$regex": name, "$options": "i"}})
        
        if profile:
            user = await db.users.find_one({"_id": profile["user_id"]})
            email = user["email"] if user else "No User Account Linked"
            print(f"✅ Found {profile['full_name']}")
            print(f"   - Email: {email}")
            print(f"   - Role: {user.get('role', 'N/A')}")
            print(f"   - Specialization: {profile.get('specialization', 'N/A')}")
        else:
            print(f"❌ {name} not found in user_profiles.")

    print("\n--- Listing All Profiles to check mismatches ---")
    profiles = await db.user_profiles.find({}).to_list(None)
    for p in profiles:
         user = await db.users.find_one({"_id": p["user_id"]})
         email = user["email"] if user else "Orphaned"
         print(f"- {p.get('full_name')} ({p.get('specialization')}) -> {email}")

    client.close()

if __name__ == "__main__":
    asyncio.run(find_specific_employees())

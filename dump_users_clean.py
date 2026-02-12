
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
load_dotenv('./backend/.env')

async def dump_users():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    users = await db.users.find({}).to_list(None)
    
    with open("users_clean.txt", "w", encoding="utf-8") as f:
        f.write(f"Users Count: {len(users)}\n")
        for user in users:
            try:
                role = user.get('role', 'N/A')
                email = user.get('email', 'N/A')
                # Try to get profile
                profile = await db.user_profiles.find_one({"user_id": user["_id"]})
                full_name = profile.get("full_name", "N/A") if profile else "N/A"
                
                f.write(f"Email: {email}, Role: {role}, Name: {full_name}\n")
            except Exception as e:
                f.write(f"Error parsing user: {e}\n")

    client.close()
    print("Done writing to users_clean.txt")

if __name__ == "__main__":
    asyncio.run(dump_users())

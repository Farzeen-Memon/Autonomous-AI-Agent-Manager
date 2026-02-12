
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

    print(f"Connecting to {mongo_url}, DB: {db_name}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    users = await db.users.find({}).to_list(None)
    print(f"Found {len(users)} users:\n")

    print(f"{'Email':<35} | {'Role':<10} | {'Full Name':<25}")
    print("-" * 80)

    for user in users:
        profile = await db.user_profiles.find_one({"user_id": user["_id"]})
        full_name = profile["full_name"] if profile else "N/A"
        print(f"{user['email']:<35} | {user['role']:<10} | {full_name:<25}")

    client.close()

if __name__ == "__main__":
    asyncio.run(dump_users())

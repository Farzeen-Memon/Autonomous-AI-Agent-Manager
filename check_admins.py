"""
Check admin users in the database
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('./backend/.env')

async def check_admins():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("[INFO] Checking admin users...\n")
    
    # Get admin users
    admins = await db.users.find({'role': 'admin'}).to_list(100)
    
    if len(admins) == 0:
        print("[WARN] No admin users found!")
    else:
        print(f"[INFO] Found {len(admins)} admin users:")
        for admin in admins:
            print(f"  - {admin.get('email', 'N/A')} (id: {admin['_id']})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_admins())

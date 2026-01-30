import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))
load_dotenv('backend/.env')

async def list_collections():
    mongo_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DATABASE_NAME', 'nexo_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    cols = await db.list_collection_names()
    print(f"Database: {db_name}")
    print(f"Collections: {cols}")
    
    for col in cols:
        count = await db[col].count_documents({})
        print(f" - {col}: {count} documents")
        
        if count > 0:
            doc = await db[col].find_one()
            print(f"   Example: {doc.keys()}")
            
    client.close()

if __name__ == "__main__":
    asyncio.run(list_collections())

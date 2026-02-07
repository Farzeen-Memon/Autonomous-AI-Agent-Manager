import asyncio
import os
import sys
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load env from backend if possible, to get local config
load_dotenv('backend/.env')

async def copy_data():
    print("🚀 Mongo Backup: Local -> Atlas")
    
    # Local Connection
    local_uri = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    print(f"📡 Connecting to LOCAL: {local_uri}")
    local_client = AsyncIOMotorClient(local_uri)
    
    # Check for CLI argument first, then prompt
    if len(sys.argv) > 1:
        atlas_uri = sys.argv[1]
    else:
        atlas_uri = input("Paste your Atlas Connection String: ").strip()
    
    if not atlas_uri:
        print("❌ Connection string required.")
        return

    try:
        atlas_client = AsyncIOMotorClient(atlas_uri)
        # Test connection
        await atlas_client.server_info()
        print("✅ Connected to Atlas!")
    except Exception as e:
        print(f"❌ Could not connect to Atlas: {e}")
        return

    # SOURCE DB
    source_db_name = "nexo_db" 
    target_db_name = "nexo_db"

    source_db = local_client[source_db_name]
    target_db = atlas_client[target_db_name]

    collections = await source_db.list_collection_names()
    print(f"📦 Found collections: {collections}")

    for col_name in collections:
        print(f"   ➡️  Migrating '{col_name}'...")
        cursor = source_db[col_name].find({})
        docs = await cursor.to_list(length=None)
        
        if docs:
            # Clear target collection first to avoid duplicates/conflicts during migration
            await target_db[col_name].drop()
            await target_db[col_name].insert_many(docs)
            print(f"      ✅ Copied {len(docs)} documents.")
        else:
            print(f"      ⚠️ No documents found.")

    print("\n🎉 Upload Complete!")
    local_client.close()
    atlas_client.close()

if __name__ == "__main__":
    try:
        import motor
        asyncio.run(copy_data())
    except ImportError:
        print("❌ 'motor' library missing. Run: pip install motor")

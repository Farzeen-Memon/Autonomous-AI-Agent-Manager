import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.config import settings

async def list_projects():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client.nexo_db
    projects = await db.projects.find().to_list(100)
    print("--- PROJECTS ---")
    for p in projects:
        deadline = p.get('deadline', 'None')
        print(f"ID: {str(p['_id'])} | Title: {p.get('title')} | Status: {p.get('status')} | Deadline: {deadline}")
    print("----------------")

if __name__ == "__main__":
    asyncio.run(list_projects())

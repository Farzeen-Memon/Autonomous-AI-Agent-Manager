from app.models.project import Project
from app.db.database import init_db
import asyncio

async def check_deadline():
    await init_db()
    projects = await Project.find_all().to_list()
    for p in projects:
        print(f"Project: {p.title}, Deadline: {p.deadline}")

if __name__ == "__main__":
    asyncio.run(check_deadline())

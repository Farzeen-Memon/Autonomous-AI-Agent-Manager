"""
Debug script to test the matching system end-to-end
This bypasses authentication to directly test the matcher agent
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from app.agents.matcher_agent import MatcherAgent
from app.models.project import Project, RequiredSkill

load_dotenv('./backend/.env')

async def test_matching():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB_NAME', 'nexo_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("[INFO] Testing matching system...\n")
    
    # Get employee profiles
    profiles_cursor = db.user_profiles.find()
    profiles = await profiles_cursor.to_list(100)
    
    candidates = []
    for profile in profiles:
        skills_cursor = db.skills.find({'employee_id': profile['_id']})
        skills = await skills_cursor.to_list(100)
        candidates.append({
            'profile': profile,
            'skills': skills
        })
    
    print(f"[INFO] Found {len(candidates)} candidates\n")
    
    # Create a test project
    class TestProject:
        title = "ML-Powered Web Application"
        description = "Build a machine learning web app with React frontend"
        required_skills = [
            RequiredSkill(skill_name="ML", level="mid"),
            RequiredSkill(skill_name="Python", level="senior"),
            RequiredSkill(skill_name="React", level="mid")
        ]
        experience_required = 2.0
    
    project = TestProject()
    
    print(f"[TEST] Project: {project.title}")
    print(f"[TEST] Required skills: {[s.skill_name for s in project.required_skills]}\n")
    
    # Run matcher
    matcher = MatcherAgent()
    result = await matcher.match(project=project, candidates=candidates, tasks=[])
    
    print(f"\n[RESULT] Matches returned: {len(result.get('matches', []))}")
    print(f"[RESULT] Total candidates: {result.get('total_candidates', 0)}\n")
    
    for i, match in enumerate(result.get('matches', [])[:5], 1):
        print(f"Match #{i}:")
        print(f"  Name: {match.get('employee_name', 'Unknown')}")
        print(f"  Score: {match.get('match_score', 'N/A')}")
        print(f"  Matched Skills: {match.get('matched_skills', [])}")
        print(f"  Reasoning: {match.get('reasoning', 'N/A')[:80]}...")
        print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_matching())

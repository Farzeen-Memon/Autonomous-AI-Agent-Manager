"""
Quick test script to verify skill matching is working
"""
import asyncio
import sys
import os
from dotenv import load_dotenv

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
load_dotenv('./backend/.env')

from motor.motor_asyncio import AsyncIOMotorClient
from app.db.database import init_db
from app.agents.matcher_agent import MatcherAgent
from app.models.project import Project, RequiredSkill
from app.models.employee import SkillLevel

async def test_matching():
    print("=" * 60)
    print("SKILL MATCHING TEST")
    print("=" * 60)
    
    # Initialize database
    await init_db()
    
    # Connect to MongoDB directly
    mongo_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DATABASE_NAME', 'nexo_db')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Get real candidates from database
    print("\n1. Fetching employees from database...")
    profiles = await db.user_profiles.find().to_list(100)
    print(f"   Found {len(profiles)} profiles")
    
    candidates = []
    for profile in profiles:
        skills = await db.skills.find({'employee_id': profile['_id']}).to_list(100)
        if skills:  # Only include if they have skills
            candidates.append({
                'profile': profile,
                'skills': skills
            })
            print(f"   - {profile.get('full_name')}: {[s.get('skill_name') for s in skills]}")
    
    print(f"\n2. Total candidates with skills: {len(candidates)}")
    
    # Create test project
    print("\n3. Creating test project requiring 'Python'...")
    project = Project(
        title="Python Development Project",
        description="A project requiring Python expertise",
        required_skills=[
            RequiredSkill(skill_name="Python", level=SkillLevel.MID)
        ],
        experience_required=2.0
    )
    
    # Run matching
    print("\n4. Running AI Matcher...")
    matcher = MatcherAgent()
    
    try:
        result = await matcher.match(project, candidates)
        
        print("\n" + "=" * 60)
        print("MATCHING RESULTS")
        print("=" * 60)
        
        matches = result.get('matches', [])
        print(f"\nTotal matches found: {len(matches)}")
        
        if matches:
            print("\nTop Matches:")
            for i, match in enumerate(matches[:5], 1):
                print(f"\n{i}. {match['employee_name']}")
                print(f"   Score: {match['match_score']}/20")
                print(f"   Matched Skills: {', '.join(match['matched_skills'])}")
                print(f"   Reasoning: {match['reasoning'][:100]}...")
        else:
            print("\n❌ NO MATCHES FOUND!")
            print("This means the AI didn't return any candidates.")
            print("Check the backend terminal for 'LOGGING LLM RESULT' to see what the AI returned.")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    client.close()
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(test_matching())

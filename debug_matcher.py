import sys
import os
from dotenv import load_dotenv

# Add backend to path and load env
sys.path.append(os.path.join(os.getcwd(), "backend"))
load_dotenv(os.path.join(os.getcwd(), "backend", ".env"))

import asyncio
from app.agents.matcher_agent import MatcherAgent
from app.models.project import Project, RequiredSkill
from app.models.employee import SkillLevel

from app.db.database import init_db

async def test_matching():
    # Initialize DB for Beanie models
    await init_db()
    
    os.environ["LLM_PROVIDER"] = "gemini"
    
    agent = MatcherAgent()
    project = Project(
        title="AI Resume Analyser",
        description="A project to analyze resumes using ML.",
        required_skills=[
            RequiredSkill(skill_name="ML", level=SkillLevel.SENIOR),
            RequiredSkill(skill_name="Fullstack", level=SkillLevel.MID)
        ],
        experience_required=5.0
    )
    
    candidates = [
        {
            "profile": {"id": "1", "full_name": "Test ML Engineer", "specialization": "ML"},
            "skills": [{"skill_name": "ML", "level": "senior", "years_of_experience": 6}]
        },
        {
            "profile": {"id": "2", "full_name": "Test DevOps", "specialization": "DevOps"},
            "skills": [{"skill_name": "Docker", "level": "senior", "years_of_experience": 5}]
        }
    ]
    
    try:
        result = await agent.match(project, candidates)
        print("Matching Result:")
        import json
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Matching failed with error: {e}")

if __name__ == "__main__":
    asyncio.run(test_matching())

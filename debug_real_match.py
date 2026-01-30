import sys
import os
from dotenv import load_dotenv
import asyncio
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Diagnostics
env_path = os.path.join(os.getcwd(), "backend", ".env")
print(f"Loading env from: {env_path}")
print(f"File exists: {os.path.exists(env_path)}")

load_dotenv(env_path)

print(f"LLM_API_KEY found: {'Yes' if os.getenv('LLM_API_KEY') else 'No'}")
print(f"GOOGLE_API_KEY found: {'Yes' if os.getenv('GOOGLE_API_KEY') else 'No'}")

from app.agents.matcher_agent import MatcherAgent
from app.models.project import Project, RequiredSkill
from app.models.employee import EmployeeProfile, Skill, SkillLevel
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

async def test_real_match():
    # Initialize Beanie
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL', 'mongodb://localhost:27017'))
    await init_beanie(
        database=client[os.getenv('DATABASE_NAME', 'nexo_db')],
        document_models=[EmployeeProfile, Skill, Project]
    )
    
    # Get a project
    project = await Project.find_one()
    if not project:
        print("No project found in DB. Creating a dummy one.")
        project = Project(
            title="AI System Integration",
            description="Integrating AI agents into the existing hub.",
            required_skills=[
                RequiredSkill(skill_name="Python", level=SkillLevel.SENIOR),
                RequiredSkill(skill_name="AI/ML", level=SkillLevel.MID)
            ],
            experience_required=3.0
        )
    else:
        print(f"Testing with project: {project.title}")
        print(f"Required skills: {[f'{s.skill_name} ({s.level})' for s in project.required_skills]}")

    # Get all employees
    profiles = await EmployeeProfile.find_all().to_list()
    candidates = []
    for profile in profiles:
        skills = await Skill.find(Skill.employee_id == profile.id).to_list()
        candidates.append({
            "profile": profile,
            "skills": skills
        })
    
    print(f"Evaluating {len(candidates)} candidates.")
    
    agent = MatcherAgent()
    try:
        # We need some dummy tasks
        tasks = [
            {"title": "Backend API Development", "description": "Develop the core API", "required_skills": ["Python"]},
            {"title": "AI Model Training", "description": "Fine-tune models", "required_skills": ["AI/ML"]}
        ]
        
        result = await agent.match(project, candidates, tasks=tasks)
        print("\nMatching Result:")
        print(json.dumps(result, indent=2))
        
        if not result.get('matches'):
            print("\n⚠️ NO MATCHES FOUND!")
            # Print candidate summaries as seen by the prompt
            print("\nCandidate summaries being sent to LLM:")
            summaries = []
            for c in candidates:
                p = c['profile']
                s_list = [f"{s.skill_name} ({s.level})" for s in c['skills']]
                summaries.append(f"Name: {p.full_name}, Skills: {', '.join(s_list)}")
            print("\n".join(summaries))
            
    except Exception as e:
        print(f"\nMatching failed: {e}")
        import traceback
        traceback.print_exc()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_real_match())

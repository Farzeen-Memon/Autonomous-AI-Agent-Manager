import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.employee import EmployeeProfile, Skill
from app.models.project import Project, RequiredSkill
from app.agents.matcher_agent import MatcherAgent
from app.models.employee import SkillLevel
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def debug_match():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    await init_beanie(database=client['nexo_db'], document_models=[EmployeeProfile, Skill, Project])
    
    # 1. Investigate Pranav
    pranav = await EmployeeProfile.find_one({"full_name": "Pranav"})
    if pranav:
        skills = await Skill.find(Skill.employee_id == pranav.id).to_list()
        skill_names = [s.skill_name for s in skills]
        print(f"PRANAV FOUND: Spec={pranav.specialization}, Skills={skill_names}")
    else:
        print("PRANAV NOT FOUND BY NAME 'Pranav'")
        # Try finding someone with DevOps spec
        devops_guy = await EmployeeProfile.find_one({"specialization": "DEVOPS"})
        if devops_guy:
            print(f"DEVOPS GUY: {devops_guy.full_name}, Skills={[s.skill_name for s in await Skill.find(Skill.employee_id == devops_guy.id).to_list()]}")

    # 2. Test MatcherAgent logic directly
    matcher = MatcherAgent()
    
    # Mock project like in the screenshot
    project = Project(
        title="Infrastructure Migration",
        description="Migrating to cloud",
        required_skills=[
            RequiredSkill(skill_name="devops", level=SkillLevel.MID),
            RequiredSkill(skill_name="python", level=SkillLevel.MID),
            RequiredSkill(skill_name="react", level=SkillLevel.MID)
        ],
        experience_required=2.0
    )
    
    # Get all candidates
    profiles = await EmployeeProfile.find_all().to_list()
    candidates = []
    for p in profiles:
        s = await Skill.find(Skill.employee_id == p.id).to_list()
        candidates.append({"profile": p, "skills": s})
    
    # Test match
    print("\nDRY RUN MATCHING...")
    result = await matcher.match(project, candidates)
    
    print(f"TOTAL MATCHES: {len(result.get('matches', []))}")
    for m in result.get('matches', []):
        print(f"Match: {m['employee_name']}, Score: {m['match_score']}, Reason: {m['reasoning']}")

    client.close()

if __name__ == "__main__":
    asyncio.run(debug_match())

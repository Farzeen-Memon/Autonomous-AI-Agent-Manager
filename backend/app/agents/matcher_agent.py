from typing import List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.core.llm import LLMClient
from app.models.employee import EmployeeProfile, Skill
from app.models.project import Project

class EmployeeMatch(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    """Schema for a single employee match"""
    employee_id: str = Field(description="Employee profile ID")
    employee_name: str = Field(description="Employee full name")
    match_score: float = Field(description="Match score from 0-20")
    matched_skills: List[str] = Field(description="Skills that matched project requirements")
    suggested_task: str = Field(description="Specific project task assigned to this person")
    reasoning: str = Field(description="Explanation of why this employee is a good fit and suitable for the assigned task")

class MatchResponse(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    """Schema for a single matching response"""
    matches: List[EmployeeMatch] = Field(description="List of matched employees, sorted by score")
    total_candidates: int = Field(description="Total number of candidates evaluated")

class MatcherAgent:
    """
    AI Agent responsible for matching employees to projects.
    Uses LLM to analyze project requirements and employee profiles to find optimal matches.
    """
    
    def __init__(self):
        self.llm = LLMClient()
    
    async def match(
        self,
        project: Project,
        candidates: List[Dict[str, Any]],
        tasks: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Match employees to a project based on skills and requirements.
        
        Args:
            project: Project document with requirements
            candidates: List of employee profiles with skills
        
        Returns:
            Dictionary containing matched employees with scores and reasoning
        """
        
        # Format project requirements
        required_skills = [f"{skill.skill_name} ({skill.level})" for skill in project.required_skills]
        
        # Format candidate profiles
        candidate_summaries = []
        for candidate in candidates:
            profile = candidate.get('profile')
            skills_docs = candidate.get('skills', [])
            
            # Robustly handle both dicts and objects
            def get_val(obj, key, default=None):
                if isinstance(obj, dict):
                    return obj.get(key, default)
                return getattr(obj, key, default)

            skill_list = []
            for s in skills_docs:
                name = get_val(s, 'skill_name', 'Unknown')
                level = get_val(s, 'level', 'unknown')
                yoe = get_val(s, 'years_of_experience', 0)
                skill_list.append(f"{name} ({level}, {yoe} years)")
            
            p_id = str(get_val(profile, 'id', get_val(profile, '_id', 'unknown')))
            name = get_val(profile, 'full_name', 'Unknown')
            spec = get_val(profile, 'specialization', 'Unassigned')
            
            candidate_summaries.append({
                'id': p_id,
                'name': name,
                'specialization': spec,
                'skills': skill_list
            })
        
        # Construct the matching prompt
        prompt = f"""You are an expert technical recruiter matching employees to projects.

Project Requirements:
- Title: {project.title}
- Description: {project.description}
- Required Skills: {', '.join(required_skills)}
- Experience Required: {project.experience_required} years

Project Tasks:
{self._format_tasks(tasks) if tasks else "No specific tasks generated yet. Assign general roles."}

Available Candidates:
{self._format_candidates(candidate_summaries)}

Your task is to:
1. **INCLUSIVE MATCHING (CRITICAL)**: You MUST include EVERY candidate that has at least ONE matching skill in your response list. DO NOT filter out candidates with low scores if they have a matching skill.
2. **Assign a match score from 0-20**:
   - 18-20: Perfect match (all or most required skills at high proficiency).
   - 14-17: Strong match (several key skills match).
   - 10-13: Moderate match (At least ONE required skill matches).
   - 0-9: Weak match (No direct skill matches, or only tangentially related).
3. **Identify matched skills**: List the specific skills from the candidate's profile that directly match the project's "Required Skills".
4. **Assign suitable tasks**: Assign the most suitable project task to each candidate based on their specific strengths.
5. **Provide reasoning**: Focus on WHY their skills makes them suitable for the assigned task.

Consider:
- **Skill Overlap (CRITICAL)**: Any candidate with even ONE matching skill should be considered a "Match" and get a score of at least 10.
- Proficiency level and years of experience.
- Specialization alignment.

Return ALL potential matches (do not limit to top 10 if more qualify), sorted by score (highest first).

Return your response in the following JSON format:
{{
    "matches": [
        {{
            "employee_id": "candidate_id",
            "employee_name": "Full Name",
            "match_score": 18.5,
            "matched_skills": ["skill1", "skill2"],
            "suggested_task": "Name or description of the task assigned",
            "reasoning": "Strong match because they have [Skill X] which is crucial for [Task Y]..."
        }}
    ],
    "total_candidates": {len(candidate_summaries)}
}}"""
        
        try:
            # Generate structured response
            result = await self.llm.generate_structured(
                prompt=prompt,
                response_schema=MatchResponse,
                temperature=0.5  # Lower temperature for more consistent scoring
            )
            print("LOGGING LLM RESULT:", result) # Add debug monitoring log
            
            return result
            
        except Exception as e:
            import traceback
            print(f"AI Matching failed, falling back to keyword matching: {str(e)}")
            traceback.print_exc()
            return self._fallback_match(project, candidate_summaries, tasks)

    def _fallback_match(
        self,
        project: Project,
        summaries: List[Dict[str, Any]],
        tasks: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Simple keyword matching fallback when AI is unavailable"""
        required_names = [s.skill_name.lower() for s in project.required_skills]
        matches = []
        
        for cand in summaries:
            score = 0
            matched_skills = []
            
            cand_skills_str = " ".join(cand['skills']).lower()
            
            for req in required_names:
                if req in cand_skills_str:
                    score += 10  # Increased from 5 to ensure visibility
                    matched_skills.append(req.title())
            
            # Bonus for specialization
            p_title = (project.title or "").lower()
            c_spec = (cand.get('specialization') or "").lower()
            p_desc = (project.description or "").lower()
            
            if (p_title and p_title in c_spec) or (c_spec and c_spec in p_desc):
                score += 3
            
            # Cap at 20
            score = min(score, 20)
            
            if score > 0:
                matches.append({
                    "employee_id": cand['id'],
                    "employee_name": cand['name'],
                    "match_score": float(score),
                    "matched_skills": matched_skills,
                    "suggested_task": tasks[0].get('title', 'Project Implementation') if tasks else 'Implementation',
                    "reasoning": f"Matched skills ({', '.join(matched_skills)}) identified via keyword analysis. (Fallback Mode)"
                })
        
        # Sort by score
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return {
            "matches": matches[:10],
            "total_candidates": len(summaries)
        }
    
    def _format_candidates(self, candidates: List[Dict]) -> str:
        """Format candidate list for the prompt"""
        formatted = []
        for i, candidate in enumerate(candidates, 1):
            skills_str = ', '.join(candidate['skills']) if candidate['skills'] else 'No skills listed'
            formatted.append(
                f"{i}. {candidate['name']} (ID: {candidate['id']})\n"
                f"   Specialization: {candidate['specialization']}\n"
                f"   Skills: {skills_str}"
            )
        return '\n\n'.join(formatted)

    def _format_tasks(self, tasks: List[Dict]) -> str:
        """Format task list for the prompt"""
        formatted = []
        for i, task in enumerate(tasks, 1):
            formatted.append(
                f"{i}. {task.get('title', 'Unknown Task')}\n"
                f"   Description: {task.get('description', '')}\n"
                f"   Required Skills: {', '.join(task.get('required_skills', []))}"
            )
        return '\n\n'.join(formatted)

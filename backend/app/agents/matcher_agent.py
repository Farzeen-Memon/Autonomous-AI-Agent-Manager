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
    suggested_task: str = Field(description="Specific project task title assigned to this person")
    suggested_description: str = Field(description="Personalized, detailed implementation briefing for this specific task")
    suggested_deadline: str = Field(description="Deadline for this task (e.g. '3 days', 'Next Friday')")
    suggested_hours: float = Field(default=8.0, description="Estimated hours left/required for this task")
    reasoning: str = Field(description="Explanation of why this employee's skills make them perfect for this SPECIFIC task")

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

    @staticmethod
    def _get_val(obj, key, default=None):
        """Robustly handle both dicts and objects for attribute/key access"""
        if obj is None:
            return default
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

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
            
            skill_list = []
            for s in skills_docs:
                name = self._get_val(s, 'skill_name', 'Unknown')
                level = self._get_val(s, 'level', 'unknown')
                yoe = self._get_val(s, 'years_of_experience', 0)
                skill_list.append(f"{name} ({level}, {yoe} years)")
            
            p_id = str(self._get_val(profile, 'id', self._get_val(profile, '_id', 'unknown')))
            name = self._get_val(profile, 'full_name', 'Unknown')
            spec = self._get_val(profile, 'specialization', 'Unassigned')
            
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
- Target Team Size: {project.team_size} members

Project Tasks (Task Pool):
{self._format_tasks(tasks) if tasks else "No specific tasks generated yet. Assign general roles."}

Available Candidates:
{self._format_candidates(candidate_summaries)}

Your task is to:
1. **STRICT MATCHING (CRITICAL)**: You MUST only assign a score greater than 0 if the candidate possesses at least one of the REQUIRED skills.
2. **Select the Core Team**: Identify the best {project.team_size} candidates who form a complete, well-rounded team.
3. **Assign Scores**:
   - 18-20: Perfect match.
   - 14-17: Strong match.
   - 0: NO MATCH.
4. **Distribute Tasks (STRICT UNIQUE ASSIGNMENT)**:
   - For the top {project.team_size} candidates (the Core Team), assign specific, distinct, and unique tasks from the Task Pool list.
   - **CRITICAL: ONE TASK PER PERSON**: Every Core Team member MUST be assigned a completely different task name from the pool. 
   - Ensure the Core Team covers the variety of Frontend UI, Backend Logic, Database, and Auth/Login if those exist in the pool.
   - **Personalized Briefing**: Create a `suggested_description` that is a rich, technical, and unique implementation guide for that specific task.
   - **Deadlines**: Use the `deadline` provided in the Task Pool for the assigned task.
   - **Neural Load**: Assign the exact `estimated_hours` from the Task Pool as `suggested_hours`.
   - For others (score 0), assign "Backup Support" or "General Integration" with 0 hours.
5. **Zero Score Rule**: If a candidate has NO matching skills, score MUST be 0.

Return ALL candidates. Return your response in the following JSON format:
{{
    "matches": [
        {{
            "employee_id": "candidate_id",
            "employee_name": "Full Name",
            "match_score": 18.5,
            "matched_skills": ["skill1", "skill2"],
            "suggested_task": "The specific task title from the pool",
            "suggested_description": "Custom technical briefing for this employee and task",
            "suggested_deadline": "Realistic deadline",
            "suggested_hours": 8.0,
            "reasoning": "Why this specific match works"
        }}
    ],
    "total_candidates": {len(candidate_summaries)}
}}"""
        
        try:
            # Generate structured response
            result = await self.llm.generate_structured(
                prompt=prompt,
                response_schema=MatchResponse,
                temperature=0.3 # Lower temperature for better constraint following
            )
            return result
        except Exception as e:
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
                    score += 10
                    matched_skills.append(req.title())
            
            score = min(score, 20)
            
            # Round-robin task assignment if AI fails
            task_title = "Implementation"
            if tasks:
                task_idx = len(matches) % len(tasks)
                task_title = self._get_val(tasks[task_idx], 'title', 'Project Implementation')

            matches.append({
                "employee_id": cand['id'],
                "employee_name": cand['name'],
                "match_score": float(score),
                "matched_skills": matched_skills,
                "suggested_task": task_title,
                "suggested_description": "Initial implementation of assigned module.",
                "suggested_deadline": "7 days",
                "suggested_hours": float(self._get_val(tasks[task_idx], 'estimated_hours', 8.0)) if tasks else 8.0,
                "reasoning": f"Matched skills ({', '.join(matched_skills)}) identified via keyword analysis." if score > 0 else "No matching skills found."
            })
        
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        return {
            "matches": matches[:10],
            "total_candidates": len(summaries)
        }
    
    def _format_candidates(self, candidates: List[Dict]) -> str:
        formatted = []
        for i, candidate in enumerate(candidates, 1):
            skills_str = ', '.join(candidate['skills']) if candidate['skills'] else 'No skills listed'
            formatted.append(
                f"{i}. {candidate['name']} (ID: {candidate['id']})\n"
                f"   Specialization: {candidate['specialization']}\n"
                f"   Skills: {skills_str}"
            )
        return '\n\n'.join(formatted)

    def _format_tasks(self, tasks: List[Any]) -> str:
        formatted = []
        for i, task in enumerate(tasks, 1):
            title = self._get_val(task, 'title', 'Unknown Task')
            description = self._get_val(task, 'description', '')
            req_skills = self._get_val(task, 'required_skills', [])
            deadline = self._get_val(task, 'deadline', 'TBD')
            
            formatted.append(
                f"{i}. {title} (Deadline: {deadline})\n"
                f"   Description: {description}\n"
                f"   Required Skills: {', '.join(req_skills)}"
            )
        return '\n\n'.join(formatted)


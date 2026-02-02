from typing import List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.core.llm import LLMClient

class GeneratedTask(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    """Schema for a single generated task"""
    title: str = Field(description="Task title")
    description: str = Field(description="Detailed task description")
    estimated_hours: float = Field(description="Estimated hours to complete")
    required_skills: List[str] = Field(description="Skills required for this task")
    priority: str = Field(description="Priority level: high, medium, or low")
    deadline: str = Field(description="Relative deadline (e.g. 'Day 2', 'Week 1', 'After Feature X')")

class PlanResponse(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    """Schema for the complete planning response"""
    tasks: List[GeneratedTask] = Field(description="List of generated tasks")
    total_estimated_hours: float = Field(description="Total project hours")
    recommended_team_size: int = Field(description="Recommended team size")

class PlannerAgent:
    """
    AI Agent responsible for breaking down projects into actionable tasks.
    Uses LLM to analyze project requirements and generate detailed task plans.
    """
    
    def __init__(self):
        self.llm = LLMClient()
    
    async def plan(
        self, 
        project_title: str, 
        project_description: str,
        required_skills: List[str],
        experience_required: float,
        days_remaining: int = 7
    ) -> Dict[str, Any]:
        """
        Generate a detailed project plan with technical tasks.
        """
        
        # Construct the planning prompt
        prompt = f"""You are an expert technical architect and project manager.
        
Project: {project_title}
Context: {project_description}
Expertise Level: {experience_required} years
Project Duration: {days_remaining} days remaining until final deadline.

Your goal is to decompose this project into EXACTLY 10 technical tasks that follow a logical implementation sequence.

CRITICAL LOGIC RULES:
1. **SEQUENTIAL DEPENDENCY**: You cannot deploy what isn't built. Infrastructure and Core Features MUST come before 'Final Deployment' or 'Production Setup'.
2. **PHASED APPROACH**: 
   - Early: Database Schema, Auth, Core API.
   - Middle: Frontend UI, Business Logic, Integration.
   - Late: Testing, DevOps, Production Deployment.
3. **REALISTIC DEADLINES**: Assign a `deadline` that MUST be within the {days_remaining} day project window.
   - Use formats like 'Day 1-2', 'Day 3', 'Day {days_remaining}'.
   - NO task deadline can exceed Day {days_remaining}.
4. **TIME PRESSURE**: If days remaining is low (e.g. 3-5 days), tasks must be more aggressive and focused on MVP.

Categories to cover:
- Frontend UI
- Authentication/Security
- Backend API & Logic
- Database Architecture
- DevOps/Infrastructure

For each task, provide:
1. Title: Unique and specific.
2. Description: Deep technical implementation details.
3. Estimated Hours: Realistic engineering effort.
4. Required Skills: Specific technologies needed.
5. Priority: Based on path-to-launch importance.
6. Deadline: Relative timing in the project lifecycle (MUST be within Day 1 to Day {days_remaining}).

Return ONLY a valid JSON object:
{{
    "tasks": [
        {{
            "title": "Specific Task Name",
            "description": "Exhaustive implementation guide",
            "estimated_hours": 8.0,
            "required_skills": ["React", "FastAPI"],
            "priority": "high",
            "deadline": "Day 2"
        }}
    ],
    "total_estimated_hours": 120.0,
    "recommended_team_size": 4
}}"""
        
        try:
            # Generate structured response
            result = await self.llm.generate_structured(
                prompt=prompt,
                response_schema=PlanResponse,
                temperature=0.5 # Lower temperature for better structural consistency
            )
            
            return result
            
        except Exception as e:
            raise RuntimeError(f"Planning failed: {str(e)}")

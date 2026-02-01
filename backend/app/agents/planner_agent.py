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
        experience_required: float
    ) -> Dict[str, Any]:
        """
        Generate a detailed project plan with tasks.
        
        Args:
            project_title: Title of the project
            project_description: Detailed project description
            required_skills: List of required skills
            experience_required: Years of experience required
        
        Returns:
            Dictionary containing tasks, estimates, and recommendations
        """
        
        # Construct the planning prompt
        prompt = f"""You are an expert project manager for a software development team.

Project Details:
- Title: {project_title}
- Description: {project_description}
- Required Skills: {', '.join(required_skills)}
- Experience Level: {experience_required} years

Your task is to break down this project into EXACTLY 10 specific, actionable technical tasks. Ensure a balanced distribution across these CATEGORIES:
1. **Frontend UI**: Design and implementation of core user interfaces.
2. **Authentication/Login**: Secure user access and session management.
3. **Backend Logic**: Server-side processing and business rules.
4. **Database Schema**: Data modeling and persistence layer.
5. **Infrastructure/DevOps**: Deployment, environment setup, or integration.

For each task, provide:
1. A unique, specific title (e.g., "Implement Main Dashboard UI" instead of "Frontend Work")
2. A detailed description of implementation details
3. Estimated hours to complete (realistic)
4. Required skills for that specific task
5. Priority level (high, medium, or low)

Return your response in the following JSON format:
{{
    "tasks": [
        {{
            "title": "Clear, Unique Task Title",
            "description": "Exhaustive implementation details for this specific task",
            "estimated_hours": 8.0,
            "required_skills": ["skill1", "skill2"],
            "priority": "high"
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
                temperature=0.7
            )
            
            return result
            
        except Exception as e:
            raise RuntimeError(f"Planning failed: {str(e)}")

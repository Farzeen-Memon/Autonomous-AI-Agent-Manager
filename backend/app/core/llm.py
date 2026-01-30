import os
import json
from typing import Dict, Any, Optional
import google.generativeai as genai
from groq import Groq
from pydantic import BaseModel
from app.core.config import settings

class LLMClient:
    """
    Unified LLM client supporting Google Gemini and Groq.
    Handles structured JSON responses for agent workflows.
    """
    
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.api_key = settings.LLM_API_KEY
        
        if not self.api_key:
            # Fallback for local dev
            self.api_key = os.getenv("GOOGLE_API_KEY")
        
        if not self.api_key:
            raise ValueError("LLM_API_KEY not found in environment variables")
        
        if self.provider == "gemini":
            genai.configure(api_key=self.api_key)
            self.model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
            self.model = genai.GenerativeModel(self.model_name)
        elif self.provider == "groq":
            self.client = Groq(api_key=self.api_key)
            # Use the latest supported Groq model
            self.model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    def _clean_json_text(self, text: str) -> str:
        """Remove markdown code blocks if present"""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    async def generate_structured(
        self, 
        prompt: str, 
        response_schema: Optional[type[BaseModel]] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate a structured JSON response from the LLM.
        """
        try:
            # Add JSON formatting instruction
            formatted_prompt = f"{prompt}\n\nRespond ONLY with valid JSON. No markdown, no explanations."
            
            if self.provider == "gemini":
                response = self.model.generate_content(
                    formatted_prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=temperature
                    )
                )
                text_response = response.text
                
            elif self.provider == "groq":
                chat_completion = self.client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a helpful assistant that outputs JSON."
                        },
                        {
                            "role": "user",
                            "content": formatted_prompt
                        }
                    ],
                    model=self.model_name,
                    temperature=temperature,
                    response_format={"type": "json_object"},
                )
                text_response = chat_completion.choices[0].message.content
                
            # Parse JSON response
            cleaned_text = self._clean_json_text(text_response)
            result = json.loads(cleaned_text)
            
            # Validate against schema if provided
            if response_schema:
                validated = response_schema(**result)
                return validated.model_dump()
            
            return result
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse LLM response as JSON: {e}")
        except Exception as e:
            print(f"DEBUG: LLM generation failed with error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"LLM generation failed: {e}")
    
    async def generate_text(self, prompt: str, temperature: float = 0.7) -> str:
        """
        Generate a plain text response from the LLM.
        """
        try:
            if self.provider == "gemini":
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(temperature=temperature)
                )
                return response.text
                
            elif self.provider == "groq":
                chat_completion = self.client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    model=self.model_name,
                    temperature=temperature,
                )
                return chat_completion.choices[0].message.content
                
        except Exception as e:
            raise RuntimeError(f"LLM generation failed: {e}")

import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from groq import Groq

load_dotenv()

async def test_llm():
    provider = os.getenv("LLM_PROVIDER", "gemini")
    api_key = os.getenv("LLM_API_KEY")
    
    print(f"Testing provider: {provider}")
    
    if provider == "gemini":
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content("Hello, are you there?")
            print(f"Gemini Response: {response.text}")
        except Exception as e:
            print(f"Gemini Error: {e}")
            
    elif provider == "groq":
        try:
            client = Groq(api_key=api_key)
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": "Hello"}],
                model="llama-3.3-70b-versatile",
            )
            print(f"Groq Response: {chat_completion.choices[0].message.content}")
        except Exception as e:
            print(f"Groq Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_llm())

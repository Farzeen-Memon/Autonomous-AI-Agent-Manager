import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

# Load env from backend/.env
env_path = os.path.join(os.getcwd(), "backend", ".env")
load_dotenv(env_path)

api_key = os.getenv("LLM_API_KEY")
genai.configure(api_key=api_key)

async def test_minimal():
    model = genai.GenerativeModel("gemini-1.5-flash-latest")
    prompt = "Return a JSON object with a 'test' key and 'success' value. Respond ONLY with JSON."
    
    print(f"Testing Gemini with key: {api_key[:5]}...")
    
    try:
        print("1. Testing without response_mime_type...")
        response = model.generate_content(prompt)
        print(f"Response: {response.text.strip()}")
        
        print("\n2. Testing WITH response_mime_type='application/json'...")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        print(f"Response: {response.text.strip()}")
        
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_minimal())

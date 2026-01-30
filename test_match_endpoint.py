"""
Test the match-preview endpoint to see what's being returned
"""
import requests
import json

# Test endpoint
url = "http://localhost:8001/projects/match-preview"

# Get token from user (you'll need to replace this)
print("=" * 60)
print("TESTING MATCH-PREVIEW ENDPOINT")
print("=" * 60)
print("\n1. First, get your auth token from browser:")
print("   - Open browser console (F12)")
print("   - Type: localStorage.getItem('token')")
print("   - Copy the token\n")

token = input("Paste your token here (or just press Enter to test without auth): ").strip()

# Test data - matching the skills from your screenshot
project_data = {
    "title": "ai resume analyser",
    "description": "AI-powered resume analysis tool",
    "required_skills": [
        {"skill_name": "react", "level": "mid"},
        {"skill_name": "ml", "level": "mid"}
    ],
    "experience_required": 2.0,
    "assigned_team": []
}

headers = {
    "Content-Type": "application/json",
}

if token:
    headers["Authorization"] = f"Bearer {token}"

print(f"\n📤 Sending request to: {url}")
print(f"📦 Project data: {json.dumps(project_data, indent=2)}\n")

try:
    response = requests.post(url, headers=headers, json=project_data, timeout=30)
    
    print(f"📡 Status Code: {response.status_code}")
    print(f"📋 Response Headers: {dict(response.headers)}\n")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ SUCCESS! Received {len(data)} employees")
        print(f"\n📊 Employee Data:\n")
        print(json.dumps(data, indent=2, default=str))
    else:
        print(f"❌ FAILED!")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"💥 ERROR: {str(e)}")

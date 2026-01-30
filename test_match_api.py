"""
Test the match-preview API endpoint to see what data is being returned
"""
import requests
import json

# First, login to get a token
login_response = requests.post(
    "http://127.0.0.1:8000/auth/login",
    json={
        "email": "farzeenmemonn@gmail.com",
        "password": "admin123"
    }
)

if login_response.status_code == 200:
    token = login_response.json()["access_token"]
    print(f"[OK] Logged in successfully")
    
    # Test match-preview endpoint
    project_data = {
        "title": "Test ML Project",
        "description": "A test project requiring ML skills",
        "required_skills": [
            {"skill_name": "ML", "level": "mid"},
            {"skill_name": "Python", "level": "senior"}
        ],
        "experience_required": 2.0,
        "assigned_team": []
    }
    
    print(f"\n[TEST] Testing match-preview with project: {project_data['title']}")
    print(f"Required skills: {[s['skill_name'] for s in project_data['required_skills']]}")
    
    match_response = requests.post(
        "http://127.0.0.1:8000/projects/match-preview",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json=project_data
    )
    
    if match_response.status_code == 200:
        matches = match_response.json()
        print(f"\n[OK] Match endpoint returned {len(matches)} results\n")
        
        for i, match in enumerate(matches[:3], 1):  # Show first 3
            print(f"Match #{i}:")
            print(f"  Employee: {match.get('profile', {}).get('full_name', 'Unknown')}")
            print(f"  Score: {match.get('score', 'N/A')}")
            print(f"  Matched Skills: {match.get('matched_skills', [])}")
            print(f"  Suggested Task: {match.get('suggested_task', 'N/A')}")
            print(f"  Reasoning: {match.get('reasoning', 'N/A')[:100]}...")
            print()
    else:
        print(f"[ERROR] Match endpoint failed: {match_response.status_code}")
        print(match_response.text)
else:
    print(f"[ERROR] Login failed: {login_response.status_code}")
    print(login_response.text)

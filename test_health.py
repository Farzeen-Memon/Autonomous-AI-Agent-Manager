"""
Test script to verify the health monitoring endpoint
"""
import requests
import json

API_BASE_URL = "http://127.0.0.1:8000"

def test_health_endpoint():
    # First, get the list of projects
    token = input("Enter your admin token (from localStorage): ")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Get projects
    response = requests.get(f"{API_BASE_URL}/projects/", headers=headers)
    if response.status_code != 200:
        print(f"Failed to get projects: {response.status_code}")
        print(response.text)
        return
    
    projects = response.json()
    print(f"\nFound {len(projects)} projects")
    
    if not projects:
        print("No projects found. Create a project first.")
        return
    
    # Test health for each project
    for project in projects:
        project_id = project.get('_id') or project.get('id')
        title = project.get('title', 'Unknown')
        
        print(f"\n{'='*60}")
        print(f"Project: {title}")
        print(f"ID: {project_id}")
        print(f"{'='*60}")
        
        # Get health
        health_response = requests.get(
            f"{API_BASE_URL}/projects/{project_id}/health",
            headers=headers
        )
        
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"\n🔍 HEALTH STATUS: {health_data['health'].upper()}")
            print(f"Risk Score: {health_data['metrics'].get('risk_score', 0)}")
            print(f"\nMetrics:")
            for key, value in health_data['metrics'].items():
                print(f"  {key}: {value}")
            
            if health_data['issues']:
                print(f"\n⚠️  Issues Detected:")
                for issue in health_data['issues']:
                    print(f"  - {issue}")
            else:
                print(f"\n✅ No issues detected")
        else:
            print(f"Failed to get health: {health_response.status_code}")
            print(health_response.text)

if __name__ == "__main__":
    test_health_endpoint()

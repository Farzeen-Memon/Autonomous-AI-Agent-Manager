import requests
import sys

def check_backend():
    base_url = "http://127.0.0.1:8000"
    try:
        # Check root or docs to see if server is up
        response = requests.get(f"{base_url}/docs", timeout=5)
        print(f"Backend status: {response.status_code}")
        
        # Check projects endpoint (might need auth, but let's see)
        response = requests.get(f"{base_url}/projects/", timeout=5)
        print(f"Projects endpoint status: {response.status_code}")
        if response.status_code == 401:
            print("Auth required (Expected)")
        else:
            print(f"Response: {response.text[:100]}...")
            
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    check_backend()

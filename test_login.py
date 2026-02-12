
import asyncio
import os
import sys
import requests
from dotenv import load_dotenv

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
load_dotenv('./backend/.env')

API_URL = "http://127.0.0.1:8000"

def test_login(email, password):
    url = f"{API_URL}/auth/login"
    data = {
        "email": email,
        "password": password
    }
    print(f"Testing login for {email}...")
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print(f"✅ Login successful: {response.json().get('role')}")
            return True
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception during login: {e}")
        return False

if __name__ == "__main__":
    test_login("rohan@gmail.com", "123456")

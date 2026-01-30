"""
Quick test to verify environment variables are loaded
"""
import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from app.core.config import settings

print(f"[INFO] Testing environment variable loading...")
print(f"[INFO] LLM_PROVIDER: {settings.LLM_PROVIDER}")
print(f"[INFO] LLM_API_KEY: {'SET' if settings.LLM_API_KEY else 'NOT SET'}")
print(f"[INFO] LLM_API_KEY length: {len(settings.LLM_API_KEY) if settings.LLM_API_KEY else 0}")
print(f"[INFO] DATABASE_NAME: {settings.DATABASE_NAME}")
print(f"[INFO] MONGODB_URL: {settings.MONGODB_URL}")

if settings.LLM_API_KEY:
    print(f"\n[SUCCESS] Environment variables loaded correctly!")
else:
    print(f"\n[ERROR] LLM_API_KEY not found!")

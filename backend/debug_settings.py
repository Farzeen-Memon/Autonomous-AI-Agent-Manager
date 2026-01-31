try:
    from app.core.config import settings
    print("Settings loaded successfully")
    print(settings.model_dump())
except Exception as e:
    print(f"Error loading settings: {e}")

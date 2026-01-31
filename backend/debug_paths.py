from pathlib import Path
config_file = Path("app/core/config.py").resolve()
print(f"Config path: {config_file}")
backend_dir = config_file.parent.parent
print(f"Calculated BACKEND_DIR (parent.parent): {backend_dir}")
env_file = backend_dir / ".env"
print(f"Looking for .env at: {env_file}")
print(f"Does it exist? {env_file.exists()}")

backend_dir_3 = config_file.parent.parent.parent
print(f"Calculated BACKEND_DIR (parent.parent.parent): {backend_dir_3}")
env_file_3 = backend_dir_3 / ".env"
print(f"Looking for .env at: {env_file_3}")
print(f"Does it exist? {env_file_3.exists()}")

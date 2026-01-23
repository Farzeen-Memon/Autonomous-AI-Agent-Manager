# Nexo Backend – MVP

Production-ready FastAPI backend for Nexo, an Autonomous AI Agent Manager.

## Tech Stack
- **FastAPI**: Modern Python web framework.
- **MongoDB**: NoSQL database for flexible AI metadata.
- **Beanie**: ODM for MongoDB based on Pydantic.
- **JWT**: Secure authentication with access and refresh tokens.
- **Bcrypt**: Industrial-strength password hashing.

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and update the values.
   ```bash
   cp .env.example .env
   ```

3. **Run the Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation
Once the server is running, visit:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure
```text
backend/
├── app/
│   ├── api/          # Route handlers
│   │   ├── auth.py   # Signup & Login
│   │   └── employees.py # Profile & Skills
│   ├── core/         # Security & Config
│   ├── db/           # Database init
│   ├── models/       # Beanie/Pydantic models
│   └── main.py       # FastAPI entry point
├── .env              # Environment secrets
└── requirements.txt  # Python dependencies
```

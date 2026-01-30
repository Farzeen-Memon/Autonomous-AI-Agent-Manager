from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, employees, projects
from app.db.database import init_db

app = FastAPI(
    title="Nexo – Autonomous AI Agent Manager API",
    description="Production-ready MVP backend for Nexo",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(employees.router, prefix="/employees", tags=["Employee"])
app.include_router(projects.router, prefix="/projects", tags=["Project"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Nexo API",
        "docs": "/docs",
        "status": "operational"
    }

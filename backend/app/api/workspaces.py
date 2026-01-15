# Workspaces API endpoints
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_workspaces():
    return {"message": "Get workspaces"}

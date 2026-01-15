# Employees API endpoints
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_employees():
    return {"message": "Get employees"}

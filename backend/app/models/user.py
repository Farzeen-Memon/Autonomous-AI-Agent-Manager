from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import EmailStr, Field
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    EMPLOYEE = "employee"

class User(Document):
    email: Indexed(EmailStr, unique=True)
    password_hash: str
    role: UserRole
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

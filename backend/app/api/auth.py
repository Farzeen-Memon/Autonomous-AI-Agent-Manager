from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role
    )
    await user.insert()
    
    # Auto-create profile for all users
    from app.models.employee import EmployeeProfile
    profile = EmployeeProfile(
        user_id=user.id,
        full_name=user.email.split('@')[0], # Default name from email
        specialization="System Administrator" if user.role == UserRole.ADMIN else "Unassigned",
        avatar_url=""
    )
    await profile.insert()

    # Generate tokens
    access_token = create_access_token(data={"user_id": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"user_id": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await User.find_one(User.email == user_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"user_id": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"user_id": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role
    }

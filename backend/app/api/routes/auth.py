from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter()

# Using hardcoded credentials since this is an admin panel as requested.
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password123"

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        # In a real scenario, this would generate a real JWT token.
        # For simplicity, returning a mock token.
        return {"access_token": "mock-jwt-token-for-admin", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid username or password")

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.PATIENT
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str
    wallet_address: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    wallet_address: Optional[str] = None

class UserInDBBase(UserBase):
    id: str = Field(..., alias="_id")
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    wallet_address: Optional[str] = None
    medical_history: Optional[List[str]] = []  # IDs of diagnoses
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class User(UserInDBBase):
    """User model returned to clients"""
    pass

class UserInDB(UserInDBBase):
    """User model stored in database"""
    hashed_password: str

class TokenPayload(BaseModel):
    sub: str
    exp: int

class Token(BaseModel):
    access_token: str
    token_type: str

class Web3Auth(BaseModel):
    wallet_address: str
    signature: str
    message: str

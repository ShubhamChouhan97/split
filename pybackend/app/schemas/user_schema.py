from pydantic import BaseModel, EmailStr, Field
from typing import List

class UserCreate(BaseModel):
    name: str = Field(..., example="John Doe")
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    groups: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    groups: list = []

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from ..models import UserRole, UserStatus


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    model_config = ConfigDict(json_schema_extra={"title": "Register"})


class UserLogin(BaseModel):
    username: str
    password: str

    model_config = ConfigDict(json_schema_extra={"title": "Login"})


class UserPublic(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, json_schema_extra={"title": "User"})


class AuthResponse(UserPublic):
    token: str

    model_config = ConfigDict(json_schema_extra={"title": "Auth Response"})

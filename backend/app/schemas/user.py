from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole, UserStatus
from app.schemas import validators


class UserBase(BaseModel):
    """Shared fields for user data used across create/read/update."""
    username: str = Field(..., description="3-50 chars; letters, numbers, _, ., - allowed.")
    email: EmailStr
    role: UserRole = UserRole.APPLICANT
    status: UserStatus = UserStatus.ACTIVE

    _validate_username = field_validator("username")(validators.validate_username)
    _validate_email = field_validator("email")(validators.validate_email)


class UserCreate(UserBase):
    """Payload for creating a new user (includes password)."""
    password: str = Field(..., description=validators.PASSWORD_DESCRIPTION)

    _validate_password = field_validator("password")(validators.validate_password)


class UserRead(BaseModel):
    """Response model returned to clients."""
    id: UUID
    username: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    created_at: datetime

    class Config:
        from_attributes = True

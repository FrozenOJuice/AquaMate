from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    """Shared fields for user data used across create/read/update."""
    username: str = Field(..., max_length=50)
    email: EmailStr
    role: UserRole = UserRole.APPLICANT
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    """Payload for creating a new user (includes password)."""
    password: str = Field(..., min_length=8, max_length=255)


class UserUpdate(BaseModel):
    """Partial update payload; all fields optional."""
    username: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=255)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


class UserRead(UserBase):
    """Response model returned to clients."""
    id: UUID
    created_at: str

    class Config:
        from_attributes = True

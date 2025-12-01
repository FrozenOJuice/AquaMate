from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole, UserStatus
from app.schemas.validators import PASSWORD_DESCRIPTION, PASSWORD_PATTERN, USERNAME_PATTERN


class UserBase(BaseModel):
    """Shared fields for user data used across create/read/update."""
    username: str = Field(..., min_length=3, max_length=50, regex=USERNAME_PATTERN)
    email: EmailStr
    role: UserRole = UserRole.APPLICANT
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    """Payload for creating a new user (includes password)."""
    password: str = Field(
        ...,
        min_length=12,
        max_length=255,
        regex=PASSWORD_PATTERN,
        description=PASSWORD_DESCRIPTION,
    )


class UserUpdate(BaseModel):
    """Partial update payload; all fields optional."""
    username: Optional[str] = Field(None, min_length=3, max_length=50, regex=USERNAME_PATTERN)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(
        None,
        min_length=12,
        max_length=255,
        regex=PASSWORD_PATTERN,
        description=PASSWORD_DESCRIPTION,
    )
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


class UserRead(UserBase):
    """Response model returned to clients."""
    id: UUID
    created_at: str

    class Config:
        from_attributes = True


# TODO: add password strength validation and role-based response variants if needed.

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole, UserStatus
from app.schemas.validators import PASSWORD_DESCRIPTION, USERNAME_PATTERN, validate_password_strength


class UserBase(BaseModel):
    """Shared fields for user data used across create/read/update."""
    username: str = Field(..., min_length=3, max_length=50, pattern=USERNAME_PATTERN)
    email: EmailStr
    role: UserRole = UserRole.APPLICANT
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    """Payload for creating a new user (includes password)."""
    password: str = Field(
        ...,
        min_length=12,
        max_length=255,
        description=PASSWORD_DESCRIPTION,
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)


class UserUpdate(BaseModel):
    """Partial update payload; all fields optional."""
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern=USERNAME_PATTERN)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(
        None,
        min_length=12,
        max_length=255,
        description=PASSWORD_DESCRIPTION,
    )
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return validate_password_strength(v)


class UserRead(UserBase):
    """Response model returned to clients."""
    id: UUID
    created_at: str

    class Config:
        from_attributes = True


# TODO: add role-based response variants if needed.

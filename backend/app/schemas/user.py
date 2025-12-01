from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    username: str = Field(..., max_length=50)
    email: EmailStr
    role: UserRole = UserRole.APPLICANT
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=255)


class UserUpdate(BaseModel):
    username: str | None = Field(None, max_length=50)
    email: EmailStr | None = None
    password: str | None = Field(None, min_length=8, max_length=255)
    role: UserRole | None = None
    status: UserStatus | None = None


class UserRead(UserBase):
    id: UUID
    created_at: str

    class Config:
        from_attributes = True

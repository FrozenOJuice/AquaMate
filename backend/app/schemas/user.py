from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from .validators import trim, validate_password, validate_username


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def username_is_simple_slug(cls, v: str) -> str:
        return validate_username(v)

    @field_validator("password")
    @classmethod
    def password_has_complexity(cls, v: str) -> str:
        return validate_password(v)


class UserLogin(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_trim(cls, v: str) -> str:
        return trim(v)


class UserPublic(BaseModel):
    username: str
    email: EmailStr
    created_at: datetime


class AuthResponse(UserPublic):
    token: str

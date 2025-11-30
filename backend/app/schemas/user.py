from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(..., description="Unique username (letters/numbers/underscore)", example="demo_user")
    email: EmailStr = Field(..., description="User email address", example="demo@example.com")
    password: str = Field(
        ...,
        description="Password (12+ chars, upper/lower/digit/special)",
        example="StrongPass123!",
    )

    model_config = ConfigDict(json_schema_extra={"title": "Register"})


class UserLogin(BaseModel):
    username: str = Field(..., description="Username", example="demo_user")
    password: str = Field(..., description="Password", example="StrongPass123!")

    model_config = ConfigDict(json_schema_extra={"title": "Login"})


class UserPublic(BaseModel):
    username: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, json_schema_extra={"title": "User"})


class AuthResponse(UserPublic):
    token: str = Field(..., description="Bearer token placeholder", example="eyJhbGciOi...")

    model_config = ConfigDict(json_schema_extra={"title": "Auth Response"})

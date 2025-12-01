from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Username or email")
    password: str


class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(..., description="Username or email")


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Username or email")
    password: str

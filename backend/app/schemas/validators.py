from typing import Optional

from pydantic import EmailStr

USERNAME_PATTERN = r"^[A-Za-z0-9_.-]+$"
PASSWORD_DESCRIPTION = "Min 12 chars, with upper, lower, digit, and symbol."


def validate_username(username: str) -> str:
    import re

    if len(username) < 3 or len(username) > 50:
        raise ValueError("Username must be between 3 and 50 characters")
    if not re.match(USERNAME_PATTERN, username):
        raise ValueError("Username may only contain letters, numbers, underscores, dots, and hyphens")
    return username


def validate_email(email: EmailStr) -> EmailStr:
    # EmailStr already validates format; keep here for consistency/extension.
    return email


def validate_password(password: Optional[str]) -> Optional[str]:
    if password is None:
        return None
    if len(password) < 12:
        raise ValueError("Password must be at least 12 characters")
    if not any(c.islower() for c in password):
        raise ValueError("Password must include a lowercase letter")
    if not any(c.isupper() for c in password):
        raise ValueError("Password must include an uppercase letter")
    if not any(c.isdigit() for c in password):
        raise ValueError("Password must include a digit")
    if not any(not c.isalnum() for c in password):
        raise ValueError("Password must include a symbol")
    return password

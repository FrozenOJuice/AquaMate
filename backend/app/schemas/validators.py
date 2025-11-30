import re

from email_validator import EmailNotValidError, validate_email as _validate_email
from fastapi import HTTPException, status


def validate_username(username: str) -> str:
    cleaned = username.strip()
    if not re.fullmatch(r"[A-Za-z0-9_]{3,30}", cleaned):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 3-30 chars and contain only letters, numbers, or underscore",
        )
    return cleaned


def validate_password(password: str) -> str:
    cleaned = password.strip()
    if len(cleaned) < 12:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 12 characters long")
    if (
        not re.search(r"[a-z]", cleaned)
        or not re.search(r"[A-Z]", cleaned)
        or not re.search(r"\d", cleaned)
        or not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?`~]", cleaned)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must include upper, lower, a digit, and a special character",
        )
    return cleaned


def validate_email(email: str) -> str:
    cleaned = email.strip()
    try:
        result = _validate_email(cleaned)
    except EmailNotValidError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return result.email


def trim(value: str) -> str:
    return value.strip()

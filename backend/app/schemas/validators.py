import re


def validate_username(username: str) -> str:
    cleaned = username.strip()
    if not re.fullmatch(r"[A-Za-z0-9_]{3,30}", cleaned):
        raise ValueError("Username must be 3-30 chars and contain only letters, numbers, or underscore")
    return cleaned


def validate_password(password: str) -> str:
    cleaned = password.strip()
    if len(cleaned) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[a-z]", cleaned) or not re.search(r"[A-Z]", cleaned) or not re.search(r"\d", cleaned):
        raise ValueError("Password must include upper, lower, and a digit")
    return cleaned


def trim(value: str) -> str:
    return value.strip()

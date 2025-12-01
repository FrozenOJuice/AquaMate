USERNAME_PATTERN = r"^[A-Za-z0-9_.-]+$"
PASSWORD_DESCRIPTION = "Min 12 chars, with upper, lower, digit, and symbol."


def validate_password_strength(password: str) -> str:
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

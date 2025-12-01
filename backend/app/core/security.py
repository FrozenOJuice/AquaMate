from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError


_pwd_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Return a salted Argon2 hash of the password."""
    # TODO: expose argon2 parameters via config and track for rehash needs.
    return _pwd_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Check a plaintext password against an Argon2 hash."""
    try:
        return _pwd_hasher.verify(hashed_password, password)
    except VerifyMismatchError:
        return False
    except VerificationError:
        return False

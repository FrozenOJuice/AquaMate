from dataclasses import dataclass
from datetime import datetime


@dataclass
class User:
    username: str
    email: str
    password_hash: str
    created_at: datetime

from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum as SAEnum, String, func
from sqlalchemy.dialects.postgresql import UUID

from ..core.database import Base


class UserRole(str, Enum):
    VOLUNTEER = "Volunteer"
    ATTENDANT = "Attendant"
    LIFEGUARD = "Lifeguard"
    HEAD_LIFEGUARD = "Head Lifeguard"
    AQUATIC_SUPERVISOR = "Aquatic Supervisor"


class UserStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="user_role"), nullable=False, default=UserRole.LIFEGUARD)
    status = Column(SAEnum(UserStatus, name="user_status"), nullable=False, default=UserStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

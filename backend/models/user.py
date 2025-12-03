"""User model."""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User model for authentication and case ownership."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=True)  # Nullable for backward compatibility
    email_verified = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime, nullable=True)
    role = Column(String(100), default="user")
    org_id = Column(String(100))
    api_key = Column(String(255), unique=True, index=True)

    # Relationships
    cases = relationship("Case", back_populates="user", cascade="all, delete-orphan")
    reviewed_outputs = relationship(
        "Output", foreign_keys="Output.reviewed_by", back_populates="reviewer"
    )
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    feedback = relationship("Feedback", back_populates="user")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, name={self.name}, role={self.role})>"

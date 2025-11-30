"""User model."""

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
import uuid

from models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User model for authentication and case ownership."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(100))
    org_id = Column(String(100))
    api_key = Column(String(255), unique=True, index=True)

    # Relationships
    cases = relationship("Case", back_populates="user", cascade="all, delete-orphan")
    reviewed_outputs = relationship(
        "Output", foreign_keys="Output.reviewed_by", back_populates="reviewer"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"

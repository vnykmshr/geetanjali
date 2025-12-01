"""Refresh token model for JWT authentication."""

from sqlalchemy import Column, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timedelta

from models.base import Base


class RefreshToken(Base):
    """Refresh token model for secure JWT token rotation."""

    __tablename__ = "refresh_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")

    def __repr__(self) -> str:
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, revoked={self.revoked})>"

    def is_valid(self) -> bool:
        """Check if token is still valid (not revoked and not expired)."""
        return not self.revoked and datetime.utcnow() < self.expires_at

    @staticmethod
    def default_expiry() -> datetime:
        """Get default expiry time (90 days from now)."""
        return datetime.utcnow() + timedelta(days=90)

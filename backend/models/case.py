"""Case model for ethical dilemmas."""

from sqlalchemy import Column, String, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import uuid
import enum

from models.base import Base, TimestampMixin


class CaseStatus(str, enum.Enum):
    """Status of case consultation processing."""
    DRAFT = "draft"           # Case created, not yet submitted for analysis
    PENDING = "pending"       # Submitted, waiting to be processed
    PROCESSING = "processing" # Currently being analyzed by LLM
    COMPLETED = "completed"   # Analysis complete, results available
    FAILED = "failed"         # Analysis failed, can retry


class Case(Base, TimestampMixin):
    """Case model for ethical dilemma submissions."""

    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    session_id = Column(String(255), index=True)  # For anonymous users
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    role = Column(String(100))
    stakeholders = Column(JSON)  # Array of strings
    constraints = Column(JSON)  # Array of strings
    horizon = Column(String(50))  # 'short', 'medium', 'long'
    sensitivity = Column(String(50), default="low")  # 'low', 'medium', 'high'
    attachments = Column(JSON)  # Optional URLs or text blobs
    locale = Column(String(10), default="en")
    # Async processing status
    status = Column(String(20), default=CaseStatus.DRAFT.value, index=True)

    # Relationships
    user = relationship("User", back_populates="cases")
    outputs = relationship("Output", back_populates="case", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="case", cascade="all, delete-orphan", order_by="Message.created_at")

    def __repr__(self) -> str:
        return f"<Case(id={self.id}, title={self.title}, sensitivity={self.sensitivity})>"

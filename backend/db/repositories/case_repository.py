"""Case repository for database operations."""

from typing import List
from sqlalchemy.orm import Session

from models.case import Case
from db.repositories.base import BaseRepository


class CaseRepository(BaseRepository[Case]):
    """Repository for case operations."""

    def __init__(self, db: Session):
        super().__init__(Case, db)

    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[Case]:
        """
        Get all cases for a user.

        Args:
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of cases
        """
        return (
            self.db.query(Case)
            .filter(Case.user_id == user_id)
            .order_by(Case.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_sensitivity(self, sensitivity: str, skip: int = 0, limit: int = 100) -> List[Case]:
        """
        Get cases by sensitivity level.

        Args:
            sensitivity: Sensitivity level (low/medium/high)
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of cases
        """
        return (
            self.db.query(Case)
            .filter(Case.sensitivity == sensitivity)
            .order_by(Case.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

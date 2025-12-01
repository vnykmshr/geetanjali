"""Case management endpoints."""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from db.repositories.case_repository import CaseRepository
from db.repositories.message_repository import MessageRepository
from api.schemas import CaseCreate, CaseResponse
from models.case import Case
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/cases")


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db),
    user_id: str = "dev-user-id"  # TODO: Replace with actual auth
):
    """
    Create a new ethical dilemma case.

    Args:
        case_data: Case details
        db: Database session
        user_id: User ID (from auth)

    Returns:
        Created case
    """
    logger.info(f"Creating case: {case_data.title}")

    case_dict = case_data.model_dump()
    case_dict["id"] = str(uuid.uuid4())
    case_dict["user_id"] = user_id

    repo = CaseRepository(db)
    case = repo.create(case_dict)

    # Create initial user message with the case description
    message_repo = MessageRepository(db)
    message_repo.create_user_message(
        case_id=case.id,
        content=case_data.description
    )

    logger.info(f"Case created: {case.id}")
    return case


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a case by ID.

    Args:
        case_id: Case ID
        db: Database session

    Returns:
        Case details

    Raises:
        HTTPException: If case not found
    """
    repo = CaseRepository(db)
    case = repo.get(case_id)

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found"
        )

    return case


@router.get("", response_model=List[CaseResponse])
async def list_cases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: str = "dev-user-id"  # TODO: Replace with actual auth
):
    """
    List cases for the authenticated user.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records
        db: Database session
        user_id: User ID (from auth)

    Returns:
        List of cases
    """
    repo = CaseRepository(db)
    cases = repo.get_by_user(user_id, skip=skip, limit=limit)

    return cases

"""Verse query endpoints."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from db import get_db
from db.repositories.verse_repository import VerseRepository
from api.schemas import VerseResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/verses")


@router.get("", response_model=List[VerseResponse])
async def search_verses(
    q: Optional[str] = Query(None, description="Search by canonical ID or principle"),
    chapter: Optional[int] = Query(None, ge=1, le=18, description="Filter by chapter"),
    principles: Optional[str] = Query(None, description="Comma-separated principle tags"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Search and filter verses.

    Args:
        q: Search query (canonical ID or principle)
        chapter: Filter by chapter number
        principles: Comma-separated consulting principles
        skip: Number of records to skip
        limit: Maximum number of records
        db: Database session

    Returns:
        List of matching verses
    """
    repo = VerseRepository(db)

    # Search by canonical ID if query looks like one
    if q and q.startswith("BG_"):
        verse = repo.get_by_canonical_id(q)
        return [verse] if verse else []

    # Filter by chapter
    if chapter:
        return repo.get_by_chapter(chapter)

    # Search by principles
    if principles:
        principle_list = [p.strip() for p in principles.split(",")]
        return repo.search_by_principles(principle_list)

    # Default: return all verses
    return repo.get_all(skip=skip, limit=limit)


@router.get("/{canonical_id}", response_model=VerseResponse)
async def get_verse(
    canonical_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a verse by canonical ID.

    Args:
        canonical_id: Canonical verse ID (e.g., BG_2_47)
        db: Database session

    Returns:
        Verse details

    Raises:
        HTTPException: If verse not found
    """
    repo = VerseRepository(db)
    verse = repo.get_by_canonical_id(canonical_id)

    if not verse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verse {canonical_id} not found"
        )

    return verse

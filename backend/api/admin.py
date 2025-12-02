"""Admin endpoints for data management."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from db.connection import get_db
from models import Verse
from services.ingestion.pipeline import IngestionPipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin")


class IngestionRequest(BaseModel):
    """Request model for data ingestion."""

    source_type: Optional[str] = None  # sanskrit, translations, commentaries, or None for all
    force_refresh: bool = False
    enrich: bool = False  # LLM enrichment is optional and slow


class IngestionStatus(BaseModel):
    """Response model for ingestion status."""

    status: str
    message: str
    verse_count: int
    ingestion_running: bool = False


# Global flag to prevent concurrent ingestion runs
_ingestion_running = False


@router.get("/status", response_model=IngestionStatus)
def get_status(db: Session = Depends(get_db)):
    """
    Get current data ingestion status.

    Returns:
        Current verse count and ingestion status
    """
    try:
        verse_count = db.query(Verse).count()

        if verse_count == 0:
            status = "empty"
            message = "No data ingested yet. Use POST /api/v1/admin/ingest to load data."
        elif verse_count < 100:
            status = "incomplete"
            message = f"Only {verse_count} verses found. Full Bhagavad Gita has 700 verses."
        else:
            status = "ready"
            message = f"Database contains {verse_count} verses."

        return IngestionStatus(
            status=status,
            message=message,
            verse_count=verse_count,
            ingestion_running=_ingestion_running
        )

    except Exception as e:
        logger.error(f"Failed to get status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve status")


@router.post("/ingest", response_model=IngestionStatus)
def trigger_ingestion(
    request: IngestionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Trigger data ingestion manually.

    This endpoint allows you to:
    - Load initial data if database is empty
    - Refresh data from sources (with force_refresh=true)
    - Enrich existing verses with LLM analysis (with enrich=true)
    - Load specific source types only

    Note: Ingestion runs in the background to avoid request timeouts.
    Check /api/v1/admin/status to monitor progress.

    Args:
        request: Ingestion configuration
        background_tasks: FastAPI background tasks handler
        db: Database session

    Returns:
        Current status after queuing ingestion
    """
    global _ingestion_running

    if _ingestion_running:
        raise HTTPException(
            status_code=409,
            detail="Ingestion is already running. Please wait for it to complete."
        )

    try:
        verse_count = db.query(Verse).count()

        # Queue ingestion in background
        background_tasks.add_task(
            run_ingestion_task,
            source_type=request.source_type,
            force_refresh=request.force_refresh,
            enrich=request.enrich
        )

        _ingestion_running = True

        return IngestionStatus(
            status="queued",
            message="Ingestion queued and running in background. Check /api/v1/admin/status for progress.",
            verse_count=verse_count,
            ingestion_running=True
        )

    except Exception as e:
        logger.error(f"Failed to queue ingestion: {e}")
        raise HTTPException(status_code=500, detail="Failed to queue ingestion")


def run_ingestion_task(
    source_type: Optional[str] = None,
    force_refresh: bool = False,
    enrich: bool = False
):
    """
    Background task to run data ingestion.

    Args:
        source_type: Type of sources to ingest (None for all)
        force_refresh: Whether to force refresh from sources
        enrich: Whether to run LLM enrichment
    """
    global _ingestion_running

    from database import SessionLocal

    db = SessionLocal()
    try:
        logger.info("=" * 80)
        logger.info("BACKGROUND INGESTION STARTED")
        logger.info(f"Source type: {source_type or 'all'}")
        logger.info(f"Force refresh: {force_refresh}")
        logger.info(f"Enrichment: {enrich}")
        logger.info("=" * 80)

        pipeline = IngestionPipeline(db)

        source_types = [source_type] if source_type else None

        stats = pipeline.ingest_all_sources(
            source_types=source_types,
            force_refresh=force_refresh,
            enrich=enrich,
            dry_run=False
        )

        # Log results
        total_created = sum(s.get("created", 0) for s in stats.values())
        total_updated = sum(s.get("updated", 0) for s in stats.values())
        total_errors = sum(s.get("errors", 0) for s in stats.values())

        logger.info("=" * 80)
        logger.info("BACKGROUND INGESTION COMPLETED")
        logger.info(f"Created: {total_created}")
        logger.info(f"Updated: {total_updated}")
        logger.info(f"Errors: {total_errors}")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"Background ingestion failed: {e}", exc_info=True)

    finally:
        db.close()
        _ingestion_running = False

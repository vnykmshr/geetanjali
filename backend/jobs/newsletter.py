"""
Newsletter worker jobs - Individual subscriber digest processing.

These jobs are picked up by the RQ worker and process one subscriber at a time.
This provides:
- Granular retry per subscriber (one failure doesn't affect others)
- Better observability (individual job status in RQ dashboard)
- Parallel processing when multiple workers are running
"""

import logging
from datetime import datetime
from typing import Optional

from config import settings
from db.connection import SessionLocal
from models import Subscriber, Verse
from jobs.daily_digest import (
    select_verse_for_subscriber,
    get_subscriber_name,
    get_goal_labels,
    update_30d_window,
    TIME_GREETINGS,
    MILESTONE_MESSAGES,
    get_reflection_prompt,
)
from services.email import send_newsletter_digest_email

logger = logging.getLogger(__name__)


def send_subscriber_digest(subscriber_id: str, send_time: str) -> dict:
    """
    Process and send daily digest email for a single subscriber.

    This is the worker job function - called by RQ worker for each subscriber.

    Args:
        subscriber_id: UUID of the subscriber
        send_time: Time slot (morning/afternoon/evening) for greeting

    Returns:
        Dict with result status and details

    Raises:
        Exception: Re-raises exceptions to trigger RQ retry mechanism
    """
    db = SessionLocal()
    result = {
        "subscriber_id": subscriber_id,
        "status": "pending",
        "verse_id": None,
        "error": None,
    }

    try:
        # Fetch subscriber
        subscriber = db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()

        if not subscriber:
            result["status"] = "skipped"
            result["error"] = "Subscriber not found"
            logger.warning(f"Subscriber {subscriber_id} not found, skipping")
            return result

        # Validate subscriber is still active
        if not subscriber.is_active:
            result["status"] = "skipped"
            result["error"] = "Subscriber not active"
            logger.info(f"Subscriber {subscriber.email} no longer active, skipping")
            return result

        # Select verse with fallback to featured
        exclude_ids = subscriber.verses_sent_30d or []
        verse = select_verse_for_subscriber(
            db, subscriber, exclude_ids, fallback_to_featured=True
        )

        if not verse:
            # Try resetting window
            logger.warning(
                f"No verse available for {subscriber.email}, resetting window"
            )
            subscriber.verses_sent_30d = []
            verse = select_verse_for_subscriber(
                db, subscriber, [], fallback_to_featured=True
            )

            if not verse:
                result["status"] = "failed"
                result["error"] = "No verse available after reset"
                logger.error(f"No verse available for {subscriber.email} after reset")
                db.rollback()
                return result

        result["verse_id"] = verse.canonical_id

        # Prepare email content
        name = get_subscriber_name(subscriber)
        greeting = TIME_GREETINGS.get(send_time, "Hello")
        goal_labels = get_goal_labels(subscriber.goal_ids or [])
        verses_count = subscriber.verses_sent_count + 1

        # Check for milestone
        milestone_message = MILESTONE_MESSAGES.get(verses_count)

        # Check for reflection prompt
        reflection_prompt = get_reflection_prompt(verses_count)

        # Generate URLs
        token = subscriber.verification_token
        unsubscribe_url = f"{settings.FRONTEND_URL}/n/unsubscribe/{token}"
        preferences_url = f"{settings.FRONTEND_URL}/n/preferences/{token}"
        verse_url = f"{settings.FRONTEND_URL}/verses/{verse.canonical_id}"

        # Send email
        success = send_newsletter_digest_email(
            email=subscriber.email,
            name=name,
            greeting=greeting,
            verse=verse,
            goal_labels=goal_labels,
            milestone_message=milestone_message,
            reflection_prompt=reflection_prompt,
            verse_url=verse_url,
            unsubscribe_url=unsubscribe_url,
            preferences_url=preferences_url,
        )

        if not success:
            result["status"] = "failed"
            result["error"] = "Email send failed"
            logger.error(f"Failed to send digest to {subscriber.email}")
            # Raise to trigger RQ retry
            raise Exception(f"Email send failed for {subscriber.email}")

        # Update subscriber tracking
        subscriber.last_verse_sent_at = datetime.utcnow()
        subscriber.verses_sent_30d = update_30d_window(
            subscriber.verses_sent_30d,
            verse.canonical_id,
        )
        subscriber.verses_sent_count = verses_count

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            logger.exception(f"Failed to update tracking for {subscriber.email}: {e}")
            # Email was sent, so don't retry - just log the tracking failure
            result["status"] = "sent_tracking_failed"
            result["error"] = str(e)
            return result

        result["status"] = "sent"
        logger.info(
            f"Sent digest to {subscriber.email}: verse={verse.canonical_id}, "
            f"count={verses_count}"
        )
        return result

    except Exception as e:
        result["status"] = "failed"
        result["error"] = str(e)
        logger.exception(f"Error processing digest for {subscriber_id}: {e}")
        # Re-raise to trigger RQ retry
        raise

    finally:
        db.close()

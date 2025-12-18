"""Add feedback uniqueness composite indices.

Revision ID: 008_feedback_uniqueness_indices
Revises: 007_add_raw_llm_response
Create Date: 2025-12-18

Performance fix for P1.3:
- Feedback uniqueness checks at api/outputs.py:458-464 do sequential scans
- Add partial composite indices to support:
  - (output_id, user_id) for authenticated users
  - (output_id, session_id) for anonymous sessions

IMPORTANT: Uses CREATE INDEX CONCURRENTLY - cannot run inside transaction.
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add composite indices for feedback uniqueness checks.

    Using CONCURRENTLY to avoid locking tables during index creation.
    Using partial indices (WHERE clause) for optimal storage and lookup.
    """
    # Execute outside transaction (required for CONCURRENTLY)
    op.execute("COMMIT")

    # P1.3a: Index for authenticated user feedback uniqueness
    # Query pattern: WHERE output_id = ? AND user_id = ?
    # Partial index: only rows where user_id is not null
    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_feedback_output_user
        ON feedback (output_id, user_id)
        WHERE user_id IS NOT NULL
    """
    )

    # P1.3b: Index for anonymous session feedback uniqueness
    # Query pattern: WHERE output_id = ? AND session_id = ? AND user_id IS NULL
    # Partial index: only anonymous feedback rows
    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_feedback_output_session
        ON feedback (output_id, session_id)
        WHERE user_id IS NULL AND session_id IS NOT NULL
    """
    )


def downgrade() -> None:
    """Remove feedback uniqueness indices."""
    op.execute("COMMIT")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_feedback_output_user")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_feedback_output_session")

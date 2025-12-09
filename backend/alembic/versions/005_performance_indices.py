"""Add performance composite and GIN indices.

Revision ID: 005_performance_indices
Revises: 004_add_shared_at_field
Create Date: 2025-12-09

Critical performance fix for:
- P0.1: cases table has only 8.2% index usage (3862 seq scans vs 345 index scans)
- Verse principle search doing full table scans
- Missing composite indices for common query patterns

IMPORTANT: This migration uses CREATE INDEX CONCURRENTLY which cannot run inside
a transaction. If Alembic is configured with transaction_per_migration=True,
run this migration with: alembic upgrade head --sql | psql
Or set transaction_per_migration=False in alembic.ini for this migration.
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "005_performance_indices"
down_revision = "004_add_shared_at_field"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add performance indices.

    Using CONCURRENTLY to avoid locking tables during index creation.
    Note: CONCURRENTLY requires running outside a transaction block.
    """
    # Execute each index creation outside transaction (required for CONCURRENTLY)
    op.execute("COMMIT")

    # P0.1a: Composite index for user case listing (most common query pattern)
    # Replaces ineffective single-column ix_cases_user_id
    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_cases_user_id_not_deleted
        ON cases (user_id, is_deleted, created_at DESC)
        WHERE is_deleted = FALSE
    """
    )

    # P0.1b: Composite index for message ordering in case view
    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_messages_case_id_created_at
        ON messages (case_id, created_at DESC)
    """
    )

    # P0.1c: GIN index for verse principle search (CRITICAL - full table scan before)
    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_verses_consulting_principles_gin
        ON verses USING GIN (consulting_principles)
    """
    )

    # P0.1d: GIN index for experiment analytics
    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_experiment_events_properties_gin
        ON experiment_events USING GIN (properties)
    """
    )

    # P0.1e: Composite for feedback queries
    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_feedback_output_id_created_at
        ON feedback (output_id, created_at DESC)
    """
    )

    # P2.7: Add missing FK indices for join performance
    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_outputs_reviewed_by
        ON outputs (reviewed_by)
    """
    )

    op.execute(
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_messages_output_id
        ON messages (output_id)
    """
    )


def downgrade() -> None:
    """Remove performance indices."""
    op.execute("COMMIT")

    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_cases_user_id_not_deleted")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_messages_case_id_created_at")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_verses_consulting_principles_gin")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_experiment_events_properties_gin")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_feedback_output_id_created_at")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_outputs_reviewed_by")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_messages_output_id")

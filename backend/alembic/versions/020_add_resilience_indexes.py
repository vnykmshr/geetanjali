"""Add resilience indexes for case and feedback queries.

Revision ID: 020
Revises: 019
Create Date: 2025-12-24

These indexes optimize common query patterns identified in performance audit:
1. Session-based case listing for anonymous users
2. Status-filtered case queries with user ownership
3. Session-based feedback lookups for anonymous users

Note: postgresql_ops specifies DESC ordering for PostgreSQL. Other databases
create standard indexes (the parameter is ignored).
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "020"
down_revision = "019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Session-based case lookup for anonymous users
    # Optimizes: case_repo.get_anonymous_cases_by_session()
    # Query pattern: WHERE session_id = ? AND user_id IS NULL AND is_deleted = false
    op.create_index(
        "ix_cases_session_anonymous",
        "cases",
        ["session_id", "is_deleted"],
        postgresql_where="user_id IS NULL",
    )

    # Status-filtered case queries with user ownership
    # Optimizes: case_repo.get_user_cases() with status filter and created_at sorting
    # Query pattern: WHERE user_id = ? AND status IN (...) AND is_deleted = false ORDER BY created_at DESC
    op.create_index(
        "ix_cases_user_status_created",
        "cases",
        ["user_id", "status", "created_at"],
        postgresql_ops={"created_at": "DESC"},
    )

    # Session-based feedback lookup for anonymous users
    # Optimizes: feedback queries for anonymous users
    # Query pattern: WHERE session_id = ? AND user_id IS NULL
    op.create_index(
        "ix_feedback_session_anonymous",
        "feedback",
        ["session_id"],
        postgresql_where="user_id IS NULL",
    )


def downgrade() -> None:
    op.drop_index("ix_feedback_session_anonymous", table_name="feedback")
    op.drop_index("ix_cases_user_status_created", table_name="cases")
    op.drop_index("ix_cases_session_anonymous", table_name="cases")

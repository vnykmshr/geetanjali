"""Add performance indexes for outputs and refresh tokens.

Revision ID: 013
Revises: 012
Create Date: 2025-12-20

These indexes optimize:
1. Output retrieval by case with timestamp ordering (case detail views)
2. Refresh token cleanup operations (logout-all, token expiry)

Note: postgresql_ops specifies DESC ordering for PostgreSQL. Other databases
create standard indexes (the parameter is ignored).
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "013"
down_revision = "012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Output case-timeline composite index
    # Optimizes: output_repo.get_by_case_id() with timestamp ordering
    op.create_index(
        "ix_outputs_case_id_created_at",
        "outputs",
        ["case_id", "created_at"],
        postgresql_ops={"created_at": "DESC"},
    )

    # Refresh token cleanup index
    # Optimizes: logout-all, token expiry cleanup, get_valid_tokens()
    op.create_index(
        "ix_refresh_tokens_user_revoked",
        "refresh_tokens",
        ["user_id", "revoked", "expires_at"],
        postgresql_ops={"expires_at": "DESC"},
    )


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_user_revoked", table_name="refresh_tokens")
    op.drop_index("ix_outputs_case_id_created_at", table_name="outputs")

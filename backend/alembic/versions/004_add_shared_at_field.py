"""Add shared_at field to cases for public link expiration

Revision ID: 004
Revises: 003
Create Date: 2025-12-09

Adds:
- shared_at: Timestamp when case was first made public (for expiration)
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make migration idempotent - check if column already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col["name"] for col in inspector.get_columns("cases")]

    if "shared_at" not in columns:
        op.add_column(
            "cases",
            sa.Column("shared_at", sa.DateTime(), nullable=True),
        )


def downgrade() -> None:
    op.drop_column("cases", "shared_at")

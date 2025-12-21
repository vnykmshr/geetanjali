"""Add soft delete fields to users table.

Revision ID: 017_add_user_soft_delete
Revises: 016_add_user_preferences
Create Date: 2024-01-15
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "017_add_user_soft_delete"
down_revision = "016_add_user_preferences"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_active column with default True
    op.add_column(
        "users",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    # Add deleted_at column
    op.add_column(
        "users",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "deleted_at")
    op.drop_column("users", "is_active")

"""Add email verification token fields to users table.

Revision ID: 019
Revises: 018
Create Date: 2024-12-23

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "019"
down_revision = "018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add email verification fields
    op.add_column(
        "users",
        sa.Column("email_verification_token", sa.String(64), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("email_verification_expires_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("email_verified_at", sa.DateTime(), nullable=True),
    )

    # Add index for fast token lookup
    op.create_index(
        "ix_users_email_verification_token",
        "users",
        ["email_verification_token"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_users_email_verification_token", table_name="users")
    op.drop_column("users", "email_verified_at")
    op.drop_column("users", "email_verification_expires_at")
    op.drop_column("users", "email_verification_token")

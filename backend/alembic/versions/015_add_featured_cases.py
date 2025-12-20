"""Add featured_cases table for homepage consultations

Revision ID: 015
Revises: 014
Create Date: 2025-12-20

Adds:
- featured_cases: Curated cases for homepage display
  - Links to Case records via foreign key
  - Category for tab grouping (career, relationships, ethics, leadership)
  - Display order for sorting within category
  - is_active flag for soft disable
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "015"
down_revision = "014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make migration idempotent - check if table already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    existing_tables = inspector.get_table_names()

    if "featured_cases" not in existing_tables:
        op.create_table(
            "featured_cases",
            # Primary key
            sa.Column("id", sa.String(36), primary_key=True),
            # Foreign key to cases
            sa.Column(
                "case_id",
                sa.String(36),
                sa.ForeignKey("cases.id", ondelete="CASCADE"),
                nullable=False,
                unique=True,
            ),
            # Category and ordering
            sa.Column("category", sa.String(20), nullable=False),
            sa.Column("display_order", sa.Integer(), nullable=False, default=0),
            sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
            # Timestamps
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )

        # Create indexes
        op.create_index(
            "ix_featured_cases_case_id", "featured_cases", ["case_id"]
        )
        op.create_index(
            "ix_featured_cases_category", "featured_cases", ["category"]
        )
        op.create_index(
            "ix_featured_cases_is_active", "featured_cases", ["is_active"]
        )
        op.create_index(
            "ix_featured_cases_active_category",
            "featured_cases",
            ["is_active", "category"],
        )


def downgrade() -> None:
    op.drop_index("ix_featured_cases_active_category", table_name="featured_cases")
    op.drop_index("ix_featured_cases_is_active", table_name="featured_cases")
    op.drop_index("ix_featured_cases_category", table_name="featured_cases")
    op.drop_index("ix_featured_cases_case_id", table_name="featured_cases")
    op.drop_table("featured_cases")

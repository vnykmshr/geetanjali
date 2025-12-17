"""Add raw_llm_response column to outputs table.

Stores raw LLM response for policy violations to help debug
and fine-tune refusal detection patterns.

Revision ID: 007
Revises: 006
Create Date: 2024-12-17
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add raw_llm_response column."""
    op.add_column(
        "outputs",
        sa.Column(
            "raw_llm_response",
            sa.Text(),
            nullable=True,
            comment="Raw LLM response text, only populated for policy violations",
        ),
    )


def downgrade() -> None:
    """Remove raw_llm_response column."""
    op.drop_column("outputs", "raw_llm_response")

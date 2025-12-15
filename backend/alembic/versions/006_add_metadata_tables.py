"""Add book and chapter metadata tables for Reading Mode

Revision ID: 006
Revises: 005
Create Date: 2025-12-15

Adds:
- book_metadata: Cover page content (title, intro text)
- chapter_metadata: Chapter intro content (name, summary, themes)
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import inspect

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make migration idempotent - check if tables already exist
    conn = op.get_bind()
    inspector = inspect(conn)
    existing_tables = inspector.get_table_names()

    # Create book_metadata table
    if "book_metadata" not in existing_tables:
        op.create_table(
            "book_metadata",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("book_key", sa.String(50), unique=True, nullable=False, index=True),
            sa.Column("sanskrit_title", sa.String(200), nullable=False),
            sa.Column("transliteration", sa.String(200), nullable=False),
            sa.Column("english_title", sa.String(200), nullable=False),
            sa.Column("tagline", sa.String(500), nullable=False),
            sa.Column("intro_text", sa.Text(), nullable=False),
            sa.Column("verse_count", sa.Integer(), nullable=False, default=700),
            sa.Column("chapter_count", sa.Integer(), nullable=False, default=18),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )

    # Create chapter_metadata table
    if "chapter_metadata" not in existing_tables:
        op.create_table(
            "chapter_metadata",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("chapter_number", sa.Integer(), unique=True, nullable=False, index=True),
            sa.Column("sanskrit_name", sa.String(200), nullable=False),
            sa.Column("transliteration", sa.String(200), nullable=False),
            sa.Column("english_title", sa.String(300), nullable=False),
            sa.Column("subtitle", sa.String(300), nullable=True),
            sa.Column("summary", sa.Text(), nullable=False),
            sa.Column("verse_count", sa.Integer(), nullable=False),
            sa.Column("key_themes", JSONB, nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.CheckConstraint(
                "chapter_number >= 1 AND chapter_number <= 18",
                name="check_chapter_number_range"
            ),
        )


def downgrade() -> None:
    op.drop_table("chapter_metadata")
    op.drop_table("book_metadata")

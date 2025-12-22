"""Add pg_trgm trigram indexes for ILIKE search optimization.

Revision ID: 018
Revises: 017
Create Date: 2025-12-22

These GIN trigram indexes optimize ILIKE searches across:
1. verses.translation_en - Primary English translation search
2. verses.paraphrase_en - Paraphrase search
3. translations.text - Additional translations search

Performance impact:
- Small dataset (~700 verses): CREATE INDEX completes in <1s
- ILIKE queries: ~10-50x faster with trigram indexes

Prerequisites:
- PostgreSQL 9.1+ with pg_trgm extension
- Extension is automatically enabled if available

Note: Using regular CREATE INDEX (not CONCURRENTLY) because:
- Alembic wraps migrations in transactions
- Small dataset size means brief lock is acceptable
"""

from alembic import op
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision = "018"
down_revision = "017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable pg_trgm extension (idempotent - safe to run if already exists)
    # This extension provides trigram-based text similarity functions
    op.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))

    # GIN trigram index on verses.translation_en
    # Optimizes: keyword search on primary English translations
    op.execute(
        text(
            "CREATE INDEX ix_verses_translation_en_trgm "
            "ON verses USING GIN (translation_en gin_trgm_ops)"
        )
    )

    # GIN trigram index on verses.paraphrase_en
    # Optimizes: keyword search on paraphrases
    op.execute(
        text(
            "CREATE INDEX ix_verses_paraphrase_en_trgm "
            "ON verses USING GIN (paraphrase_en gin_trgm_ops)"
        )
    )

    # GIN trigram index on translations.text
    # Optimizes: search across all translator editions
    op.execute(
        text(
            "CREATE INDEX ix_translations_text_trgm "
            "ON translations USING GIN (text gin_trgm_ops)"
        )
    )


def downgrade() -> None:
    # Drop indexes in reverse order
    op.execute(text("DROP INDEX IF EXISTS ix_translations_text_trgm"))
    op.execute(text("DROP INDEX IF EXISTS ix_verses_paraphrase_en_trgm"))
    op.execute(text("DROP INDEX IF EXISTS ix_verses_translation_en_trgm"))

    # Note: We don't drop the pg_trgm extension in downgrade
    # as other parts of the system may depend on it

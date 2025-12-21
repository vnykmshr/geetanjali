"""Convert learning_goal_id to learning_goal_ids (multi-select)

Revision ID: 018
Revises: 017
Create Date: 2025-12-21

Changes:
- Drop learning_goal_id (string) column
- Add learning_goal_ids (JSON list) column
- Migrate existing single goal to list format
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "018"
down_revision = "017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)

    if "user_preferences" not in inspector.get_table_names():
        return

    columns = [col["name"] for col in inspector.get_columns("user_preferences")]

    # Add new learning_goal_ids column if it doesn't exist
    if "learning_goal_ids" not in columns:
        op.add_column(
            "user_preferences",
            sa.Column("learning_goal_ids", sa.JSON(), nullable=False, server_default="[]"),
        )

    # Migrate data: convert single goal_id to list
    if "learning_goal_id" in columns:
        # Update existing rows: wrap single goal in list, or empty list if null
        conn.execute(
            sa.text("""
                UPDATE user_preferences
                SET learning_goal_ids = CASE
                    WHEN learning_goal_id IS NOT NULL AND learning_goal_id != ''
                    THEN json_build_array(learning_goal_id)
                    ELSE '[]'::json
                END
            """)
        )

        # Drop old column
        op.drop_column("user_preferences", "learning_goal_id")


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)

    if "user_preferences" not in inspector.get_table_names():
        return

    columns = [col["name"] for col in inspector.get_columns("user_preferences")]

    # Add back the old column
    if "learning_goal_id" not in columns:
        op.add_column(
            "user_preferences",
            sa.Column("learning_goal_id", sa.String(50), nullable=True),
        )

    # Migrate data: take first goal from list
    if "learning_goal_ids" in columns:
        conn.execute(
            sa.text("""
                UPDATE user_preferences
                SET learning_goal_id = learning_goal_ids->>0
                WHERE json_array_length(learning_goal_ids) > 0
            """)
        )

        # Drop new column
        op.drop_column("user_preferences", "learning_goal_ids")

"""Convert learning_goal_id to learning_goal_ids (multi-select)

Revision ID: 018
Revises: 017
Create Date: 2025-12-21

Changes:
- Drop learning_goal_id (string) column
- Add learning_goal_ids (JSON list) column
- Migrate existing single goal to list format

Note: Uses Python-based migration for SQLite/PostgreSQL compatibility.
"""

import json
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

    # Migrate data: convert single goal_id to list (Python-based for DB compatibility)
    if "learning_goal_id" in columns:
        # Fetch all rows with old column
        result = conn.execute(
            sa.text("SELECT id, learning_goal_id FROM user_preferences")
        )
        rows = result.fetchall()

        # Update each row with converted data
        for row in rows:
            row_id, goal_id = row[0], row[1]
            new_value = json.dumps([goal_id]) if goal_id else "[]"
            conn.execute(
                sa.text("UPDATE user_preferences SET learning_goal_ids = :val WHERE id = :id"),
                {"val": new_value, "id": row_id},
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

    # Migrate data: take first goal from list (Python-based for DB compatibility)
    if "learning_goal_ids" in columns:
        # Fetch all rows with new column
        result = conn.execute(
            sa.text("SELECT id, learning_goal_ids FROM user_preferences")
        )
        rows = result.fetchall()

        # Update each row with first goal from list
        for row in rows:
            row_id, goal_ids = row[0], row[1]
            # Handle both string (SQLite) and list (PostgreSQL) formats
            if isinstance(goal_ids, str):
                goal_ids = json.loads(goal_ids) if goal_ids else []
            first_goal = goal_ids[0] if goal_ids else None
            conn.execute(
                sa.text("UPDATE user_preferences SET learning_goal_id = :val WHERE id = :id"),
                {"val": first_goal, "id": row_id},
            )

        # Drop new column
        op.drop_column("user_preferences", "learning_goal_ids")

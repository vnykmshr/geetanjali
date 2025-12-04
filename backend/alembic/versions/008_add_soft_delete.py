"""Add soft delete field to cases table.

Revision ID: 008_add_soft_delete
Revises: 007_add_public_sharing
Create Date: 2025-12-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '008_add_soft_delete'
down_revision: Union[str, None] = '007_add_public_sharing'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_deleted column with default False
    op.add_column('cases', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))
    op.create_index('ix_cases_is_deleted', 'cases', ['is_deleted'])


def downgrade() -> None:
    op.drop_index('ix_cases_is_deleted', table_name='cases')
    op.drop_column('cases', 'is_deleted')

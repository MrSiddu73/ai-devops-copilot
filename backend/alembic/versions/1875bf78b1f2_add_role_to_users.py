"""add role to users

Revision ID: 1875bf78b1f2
Revises: 7b2ca9c17d24
Create Date: 2026-08-04 16:55:39.370086

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1875bf78b1f2'
down_revision: Union[str, Sequence[str], None] = '7b2ca9c17d24'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:

    user_role = sa.Enum(
        "ADMIN",
        "DEVOPS_ENGINEER",
        "VIEWER",
        name="userrole",
    )

    # Create the PostgreSQL ENUM type first
    user_role.create(op.get_bind(), checkfirst=True)

    # Then add the column
    op.add_column(
        "users",
        sa.Column(
            "role",
            user_role,
            nullable=False,
            server_default="VIEWER",
        ),
    )

    op.alter_column(
        "users",
        "role",
        server_default=None,
    )

def downgrade() -> None:

    op.drop_column("users", "role")

    user_role = sa.Enum(
        "ADMIN",
        "DEVOPS_ENGINEER",
        "VIEWER",
        name="userrole",
    )

    user_role.drop(op.get_bind(), checkfirst=True)
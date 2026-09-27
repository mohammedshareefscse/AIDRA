"""create sos requests table"""

from alembic import op
import sqlalchemy as sa

revision = "a2a968e67a6c"
down_revision = "67ff7cfb694c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sos_requests",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_index(
        "ix_sos_requests_id",
        "sos_requests",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_sos_requests_id",
        table_name="sos_requests",
    )
    op.drop_table("sos_requests")

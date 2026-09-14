from datetime import date

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Announcement(Base):
    __tablename__ = "announcements"

    announcement_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    announcement_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    audience: Mapped[str] = mapped_column(
        String(30),
        default="all_students",
        nullable=False,
    )

    announcement_status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        nullable=False,
    )
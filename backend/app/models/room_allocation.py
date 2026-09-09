from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class RoomAllocation(Base):
    __tablename__ = "room_allocations"

    allocation_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.student_id"),
        nullable=False,
    )

    room_id: Mapped[int] = mapped_column(
        ForeignKey("rooms.room_id"),
        nullable=False,
    )

    bed_number: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    allocation_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    expected_checkout_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    actual_checkout_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    allocation_status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        nullable=False,
    )

    student = relationship("Student")
    room = relationship("Room")
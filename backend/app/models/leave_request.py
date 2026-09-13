from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    leave_request_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.student_id"),
        nullable=False,
    )

    leave_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    request_status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
    )

    student = relationship("Student")
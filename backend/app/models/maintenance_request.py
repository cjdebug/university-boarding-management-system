from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    maintenance_request_id: Mapped[int] = mapped_column(
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

    issue_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    request_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    request_status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
    )

    student = relationship("Student")
    room = relationship("Room")
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Room(Base):
    __tablename__ = "rooms"

    room_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    room_number: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
    )

    floor_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    capacity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    occupied_beds: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    room_status: Mapped[str] = mapped_column(
        String(30),
        default="available",
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
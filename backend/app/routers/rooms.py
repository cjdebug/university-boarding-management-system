from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomResponse


router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"],
)


@router.post(
    "",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
):
    existing_room = db.query(Room).filter(
        Room.room_number == room_data.room_number
    ).first()

    if existing_room:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room number already exists",
        )

    new_room = Room(
        room_number=room_data.room_number,
        floor_number=room_data.floor_number,
        capacity=room_data.capacity,
        occupied_beds=0,
        room_status="available",
        description=room_data.description,
    )

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room
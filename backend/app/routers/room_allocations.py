from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.room_allocation import RoomAllocation
from app.models.room import Room
from app.models.student import Student
from app.schemas.room_allocation import (
    RoomAllocationCreate,
    RoomAllocationResponse,
)
from app.services.auth_service import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/room-allocations",
    tags=["Room Allocations"],
)


@router.get(
    "/my",
    response_model=RoomAllocationResponse,
)
def get_my_room_allocation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter(
        Student.user_id == current_user.user_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    allocation = db.query(RoomAllocation).filter(
        RoomAllocation.student_id == student.student_id,
        RoomAllocation.allocation_status == "active",
    ).first()

    if not allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active room allocation found",
        )

    return allocation


@router.post(
    "",
    response_model=RoomAllocationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_room_allocation(
    allocation_data: RoomAllocationCreate,
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(
        Student.student_id == allocation_data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    room = db.query(Room).filter(
        Room.room_id == allocation_data.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )

    existing_allocation = db.query(RoomAllocation).filter(
        RoomAllocation.student_id == allocation_data.student_id,
        RoomAllocation.allocation_status == "active",
    ).first()

    if existing_allocation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already has an active room allocation",
        )

    if room.occupied_beds >= room.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is full",
        )

    new_allocation = RoomAllocation(
        student_id=allocation_data.student_id,
        room_id=allocation_data.room_id,
        bed_number=allocation_data.bed_number,
        allocation_date=allocation_data.allocation_date,
        expected_checkout_date=allocation_data.expected_checkout_date,
        actual_checkout_date=None,
        allocation_status="active",
    )

    db.add(new_allocation)

    room.occupied_beds += 1

    if room.occupied_beds >= room.capacity:
        room.room_status = "full"

    db.commit()
    db.refresh(new_allocation)

    return new_allocation

@router.get(
    "",
    response_model=list[RoomAllocationResponse],
)
def get_room_allocations(
    db: Session = Depends(get_db),
):
    allocations = db.query(RoomAllocation).all()

    return allocations
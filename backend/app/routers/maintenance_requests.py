from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.maintenance_request import MaintenanceRequest
from app.models.room import Room
from app.models.student import Student
from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestResponse,
)


router = APIRouter(
    prefix="/maintenance-requests",
    tags=["Maintenance Requests"],
)


@router.post(
    "",
    response_model=MaintenanceRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_maintenance_request(
    request_data: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(
        Student.student_id == request_data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    room = db.query(Room).filter(
        Room.room_id == request_data.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )

    new_request = MaintenanceRequest(
        student_id=request_data.student_id,
        room_id=request_data.room_id,
        issue_type=request_data.issue_type,
        description=request_data.description,
        request_date=request_data.request_date,
        request_status="pending",
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request
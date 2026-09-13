from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.maintenance_request import MaintenanceRequest
from app.models.room_allocation import RoomAllocation
from app.models.student import Student
from app.models.user import User
from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestResponse,
)
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/maintenance-requests",
    tags=["Maintenance Requests"],
)


# STUDENT - create maintenance request
@router.post(
    "",
    response_model=MaintenanceRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_maintenance_request(
    request_data: MaintenanceRequestCreate,
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
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student does not have an active room allocation",
        )

    new_request = MaintenanceRequest(
        student_id=student.student_id,
        room_id=allocation.room_id,
        issue_type=request_data.issue_type,
        description=request_data.description,
        request_date=date.today(),
        request_status="pending",
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


# OWNER - read all maintenance requests
@router.get(
    "",
    response_model=list[MaintenanceRequestResponse],
)
def get_maintenance_requests(
    db: Session = Depends(get_db),
):
    requests = db.query(MaintenanceRequest).all()

    return requests


# STUDENT - read only own maintenance requests
@router.get(
    "/my",
    response_model=list[MaintenanceRequestResponse],
)
def get_my_maintenance_requests(
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

    requests = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.student_id == student.student_id
    ).all()

    return requests
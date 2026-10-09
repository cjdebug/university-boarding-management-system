from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.maintenance_request import MaintenanceRequest
from app.models.room_allocation import RoomAllocation
from app.models.student import Student
from app.models.user import User
from app.models.notification import Notification

from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
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

    owner = db.query(User).filter(
        User.role == "owner",
        User.account_status == "active",
    ).first()

    if owner:
        notification = Notification(
            user_id=owner.user_id,
            title="New Maintenance Request",
            message="A student has submitted a new maintenance request.",
            notification_type="maintenance_request",
            is_read=False,
        )

        db.add(notification)

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

# OWNER - update maintenance request
@router.put(
    "/{maintenance_request_id}",
    response_model=MaintenanceRequestResponse,
)
def update_maintenance_request(
    maintenance_request_id: int,
    request_data: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
):
    maintenance_request = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.maintenance_request_id == maintenance_request_id
    ).first()

    if not maintenance_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found",
        )
    
    allowed_statuses = ["pending", "in_progress", "completed"]

    if request_data.request_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid maintenance request status",
    )

    maintenance_request.issue_type = request_data.issue_type
    maintenance_request.description = request_data.description
    maintenance_request.request_status = request_data.request_status

    db.commit()
    db.refresh(maintenance_request)

    return maintenance_request

# OWNER - delete maintenance request
@router.delete(
    "/{maintenance_request_id}",
)
def delete_maintenance_request(
    maintenance_request_id: int,
    db: Session = Depends(get_db),
):
    maintenance_request = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.maintenance_request_id == maintenance_request_id
    ).first()

    if not maintenance_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found",
        )

    db.delete(maintenance_request)
    db.commit()

    return {
        "message": "Maintenance request deleted successfully",
    }

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
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.maintenance_request import MaintenanceRequest
from app.models.room_allocation import RoomAllocation
from app.models.room import Room
from app.models.student import Student
from app.models.user import User
from app.models.notification import Notification

from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceRequestStudentUpdate,
    MaintenanceRequestResponse,
)

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/maintenance-requests",
    tags=["Maintenance Requests"],
)

# Add student and room details to API responses
def add_display_details(requests, db):
    student_ids = {item.student_id for item in requests}
    room_ids = {item.room_id for item in requests}

    students = (
        db.query(Student)
        .filter(Student.student_id.in_(student_ids))
        .all()
        if student_ids else []
    )

    rooms = (
        db.query(Room)
        .filter(Room.room_id.in_(room_ids))
        .all()
        if room_ids else []
    )

    student_names = {
        student.student_id: student.full_name
        for student in students
    }

    room_numbers = {
        room.room_id: room.room_number
        for room in rooms
    }

    for item in requests:
        item.student_name = student_names.get(
            item.student_id, "Unknown Student"
        )
        item.room_number = room_numbers.get(
            item.room_id, "Unknown Room"
        )

    return requests

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

    add_display_details([new_request], db)

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

    return add_display_details(requests, db)

# STUDENT - read own maintenance requests
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

    return add_display_details(requests, db)

# STUDENT - update own pending maintenance request
@router.put(
    "/my/{maintenance_request_id}",
    response_model=MaintenanceRequestResponse,
)
def update_my_maintenance_request(
    maintenance_request_id: int,
    request_data: MaintenanceRequestStudentUpdate,
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

    maintenance_request = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.maintenance_request_id == maintenance_request_id,
        MaintenanceRequest.student_id == student.student_id,
    ).first()

    if not maintenance_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found",
        )

    if maintenance_request.request_status.lower() != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending maintenance requests can be updated.",
        )

    maintenance_request.issue_type = request_data.issue_type
    maintenance_request.description = request_data.description

    db.commit()
    db.refresh(maintenance_request)

    add_display_details([maintenance_request], db)

    return maintenance_request

# OWNER - update maintenance request status only
@router.put(
    "/{maintenance_request_id}",
    response_model=MaintenanceRequestResponse,
)
def update_maintenance_request(
    maintenance_request_id: int,
    request_data: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can update maintenance request status",
        )

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

    maintenance_request.request_status = request_data.request_status

    db.commit()
    db.refresh(maintenance_request)

    add_display_details([maintenance_request], db)

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

# OWNER - view maintenance history for a specific room
@router.get(
    "/room/{room_id}/history",
    response_model=list[MaintenanceRequestResponse],
)
def get_room_maintenance_history(
    room_id: int,
    db: Session = Depends(get_db),
):
    requests = (
        db.query(MaintenanceRequest)
        .filter(MaintenanceRequest.room_id == room_id)
        .order_by(MaintenanceRequest.request_date.desc())
        .all()
    )

    return add_display_details(requests, db)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.leave_request import LeaveRequest
from app.models.student import Student
from app.models.user import User
from app.models.notification import Notification
from app.schemas.leave_request import (
    LeaveRequestCreate,
    LeaveRequestUpdate,
    LeaveRequestResponse,
)
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/leave-requests",
    tags=["Leave Requests"],
)


# STUDENT - create leave request
@router.post(
    "",
    response_model=LeaveRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_leave_request(
    leave_data: LeaveRequestCreate,
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

    if leave_data.end_date < leave_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be before start date",
        )

    new_leave_request = LeaveRequest(
        student_id=student.student_id,
        leave_type=leave_data.leave_type,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason,
        request_status="pending",
    )

    db.add(new_leave_request)

    owner = db.query(User).filter(
        User.role == "owner",
        User.account_status == "active",
    ).first()

    if owner:
        notification = Notification(
            user_id=owner.user_id,
            title="New Leave Request",
            message="A student has submitted a new leave request.",
            notification_type="leave_request",
            is_read=False,
        )

        db.add(notification)

    db.commit()
    db.refresh(new_leave_request)

    return new_leave_request


# OWNER - read all leave requests
@router.get(
    "",
    response_model=list[LeaveRequestResponse],
)
def get_leave_requests(
    db: Session = Depends(get_db),
):
    leave_requests = db.query(LeaveRequest).all()

    return leave_requests


# STUDENT - read only own leave requests
@router.get(
    "/my",
    response_model=list[LeaveRequestResponse],
)
def get_my_leave_requests(
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

    leave_requests = db.query(LeaveRequest).filter(
        LeaveRequest.student_id == student.student_id
    ).all()

    return leave_requests

# OWNER - delete leave request
@router.delete(
    "/{leave_request_id}",
)
def delete_leave_request(
    leave_request_id: int,
    db: Session = Depends(get_db),
):
    leave_request = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.leave_request_id == leave_request_id
        )
        .first()
    )

    if not leave_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )

    db.delete(leave_request)
    db.commit()

    return {
        "message": "Leave request deleted successfully"
    }

# OWNER - update leave request
@router.put(
    "/{leave_request_id}",
    response_model=LeaveRequestResponse,
)
def update_leave_request(
    leave_request_id: int,
    leave_data: LeaveRequestUpdate,
    db: Session = Depends(get_db),
):
    leave_request = db.query(LeaveRequest).filter(
        LeaveRequest.leave_request_id == leave_request_id
    ).first()

    if not leave_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )

    if leave_data.end_date < leave_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be before start date",
        )

    if leave_data.request_status not in ["pending", "approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid leave request status",
        )

    leave_request.leave_type = leave_data.leave_type
    leave_request.start_date = leave_data.start_date
    leave_request.end_date = leave_data.end_date
    leave_request.reason = leave_data.reason
    leave_request.request_status = leave_data.request_status

    db.commit()
    db.refresh(leave_request)

    return leave_request
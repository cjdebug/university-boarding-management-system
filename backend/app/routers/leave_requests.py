from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.leave_request import LeaveRequest
from app.models.student import Student
from app.models.user import User
from app.schemas.leave_request import (
    LeaveRequestCreate,
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
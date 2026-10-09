from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.complaint import Complaint
from app.models.student import Student
from app.models.user import User
from app.models.notification import Notification
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
)
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"],
)


# STUDENT - create complaint
@router.post(
    "",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_complaint(
    complaint_data: ComplaintCreate,
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

    new_complaint = Complaint(
        student_id=student.student_id,
        complaint_type=complaint_data.complaint_type,
        description=complaint_data.description,
        complaint_date=date.today(),
        complaint_status="pending",
    )

    db.add(new_complaint)

    owner = db.query(User).filter(
        User.role == "owner",
        User.account_status == "active",
    ).first()

    if owner:
        notification = Notification(
            user_id=owner.user_id,
            title="New Complaint",
            message="A student has submitted a new complaint.",
            notification_type="complaint",
            is_read=False,
        )

        db.add(notification)

    db.commit()
    db.refresh(new_complaint)

    return new_complaint


# OWNER - read all complaints
@router.get(
    "",
    response_model=list[ComplaintResponse],
)
def get_complaints(
    db: Session = Depends(get_db),
):
    complaints = db.query(Complaint).all()

    return complaints


# STUDENT - read only own complaints
@router.get(
    "/my",
    response_model=list[ComplaintResponse],
)
def get_my_complaints(
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

    complaints = db.query(Complaint).filter(
        Complaint.student_id == student.student_id
    ).all()

    return complaints

# OWNER - update complaint
@router.put(
    "/{complaint_id}",
    response_model=ComplaintResponse,
)
def update_complaint(
    complaint_id: int,
    complaint_data: ComplaintUpdate,
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    if complaint_data.complaint_status not in [
        "pending",
        "in_progress",
        "resolved",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid complaint status",
        )

    complaint.complaint_type = complaint_data.complaint_type
    complaint.description = complaint_data.description
    complaint.complaint_status = complaint_data.complaint_status

    db.commit()
    db.refresh(complaint)

    return complaint


# OWNER - delete complaint
@router.delete(
    "/{complaint_id}",
)
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    db.delete(complaint)
    db.commit()

    return {
        "message": "Complaint deleted successfully",
    }
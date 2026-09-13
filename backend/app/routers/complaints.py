from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.complaint import Complaint
from app.models.student import Student
from app.models.user import User
from app.schemas.complaint import (
    ComplaintCreate,
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
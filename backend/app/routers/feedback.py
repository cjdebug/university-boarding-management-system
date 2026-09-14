from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.feedback import Feedback
from app.models.student import Student
from app.models.user import User
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackResponse,
)
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"],
)


# STUDENT - create feedback
@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_feedback(
    feedback_data: FeedbackCreate,
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

    new_feedback = Feedback(
        student_id=student.student_id,
        feedback_type=feedback_data.feedback_type,
        message=feedback_data.message,
        feedback_date=date.today(),
        feedback_status="submitted",
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return new_feedback


# OWNER - read all feedback
@router.get(
    "",
    response_model=list[FeedbackResponse],
)
def get_feedback(
    db: Session = Depends(get_db),
):
    feedback = db.query(Feedback).all()

    return feedback


# STUDENT - read only own feedback
@router.get(
    "/my",
    response_model=list[FeedbackResponse],
)
def get_my_feedback(
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

    feedback = db.query(Feedback).filter(
        Feedback.student_id == student.student_id
    ).all()

    return feedback
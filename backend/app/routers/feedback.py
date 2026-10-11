from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.feedback import Feedback
from app.models.student import Student
from app.models.user import User
from app.models.notification import Notification

from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackUpdate,
    FeedbackStudentUpdate,
    FeedbackResponse,
)

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"],
)

# Add student names to feedback responses
def add_student_names(feedback_records, db):
    if not feedback_records:
        return feedback_records

    student_ids = {
        feedback.student_id for feedback in feedback_records
    }

    students = db.query(Student).filter(
        Student.student_id.in_(student_ids)
    ).all()

    student_names = {
        student.student_id: student.full_name
        for student in students
    }

    for feedback in feedback_records:
        feedback.student_name = student_names.get(
            feedback.student_id,
            "Unknown Student"
        )

    return feedback_records

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
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit feedback",
        )

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

    owner = db.query(User).filter(
        User.role == "owner",
        User.account_status == "active",
    ).first()

    if owner:
        notification = Notification(
            user_id=owner.user_id,
            title="New Student Feedback",
            message="A student has submitted new feedback.",
            notification_type="feedback",
            is_read=False,
        )

        db.add(notification)

    db.commit()
    db.refresh(new_feedback)

    add_student_names([new_feedback], db)

    return new_feedback

# OWNER - read all feedback
@router.get(
    "",
    response_model=list[FeedbackResponse],
)
def get_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can view all feedback",
        )

    feedback_records = db.query(Feedback).all()

    return add_student_names(feedback_records, db)

# STUDENT - read only own feedback
@router.get(
    "/my",
    response_model=list[FeedbackResponse],
)
def get_my_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can view their feedback",
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.user_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    feedback_records = db.query(Feedback).filter(
        Feedback.student_id == student.student_id
    ).all()

    return add_student_names(feedback_records, db)

# STUDENT - update own feedback while still submitted
@router.put(
    "/my/{feedback_id}",
    response_model=FeedbackResponse,
)
def update_my_feedback(
    feedback_id: int,
    feedback_data: FeedbackStudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can update their feedback",
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.user_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    feedback = db.query(Feedback).filter(
        Feedback.feedback_id == feedback_id,
        Feedback.student_id == student.student_id,
    ).first()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    if feedback.feedback_status.lower() != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted feedback can be updated.",
        )

    feedback.feedback_type = feedback_data.feedback_type
    feedback.message = feedback_data.message

    db.commit()
    db.refresh(feedback)

    add_student_names([feedback], db)

    return feedback

# OWNER - update feedback status and response only
@router.put(
    "/{feedback_id}",
    response_model=FeedbackResponse,
)
def update_feedback(
    feedback_id: int,
    feedback_data: FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can update feedback",
        )

    feedback = db.query(Feedback).filter(
        Feedback.feedback_id == feedback_id
    ).first()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    allowed_statuses = [
        "submitted",
        "reviewed",
        "resolved",
    ]

    if feedback_data.feedback_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid feedback status",
        )

    feedback.feedback_status = feedback_data.feedback_status
    feedback.owner_response = feedback_data.owner_response

    db.commit()
    db.refresh(feedback)

    add_student_names([feedback], db)

    return feedback

# OWNER - delete feedback
@router.delete(
    "/{feedback_id}",
)
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can delete feedback",
        )

    feedback = db.query(Feedback).filter(
        Feedback.feedback_id == feedback_id
    ).first()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    db.delete(feedback)
    db.commit()

    return {
        "message": "Feedback deleted successfully",
    }
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.announcement import Announcement
from app.models.feedback import Feedback


router = APIRouter(
    prefix="/communication-turnover-reports",
    tags=["Communication & Turnover Reports"],
)


@router.get("")
def get_communication_turnover_report(
    db: Session = Depends(get_db),
):
    announcements = (
        db.query(Announcement)
        .order_by(Announcement.announcement_date.desc())
        .all()
    )

    feedback_list = (
        db.query(Feedback)
        .order_by(Feedback.feedback_date.desc())
        .all()
    )

    # -------------------------
    # Announcement summary
    # -------------------------

    total_announcements = len(announcements)

    active_announcements = sum(
        1
        for announcement in announcements
        if announcement.announcement_status.lower() == "active"
    )

    inactive_announcements = sum(
        1
        for announcement in announcements
        if announcement.announcement_status.lower() == "inactive"
    )

    all_students_count = sum(
        1
        for announcement in announcements
        if announcement.audience.strip().lower()
        in ["all students", "all_students"]
    )

    residents_count = sum(
        1
        for announcement in announcements
        if announcement.audience.strip().lower() == "residents"
    )

    # -------------------------
    # Feedback summary
    # -------------------------

    total_feedback = len(feedback_list)

    submitted_feedback = sum(
        1
        for feedback in feedback_list
        if feedback.feedback_status.lower() == "submitted"
    )

    # -------------------------
    # Report response
    # -------------------------

    return {
        "summary": {
            "total_announcements": total_announcements,
            "active_announcements": active_announcements,
            "inactive_announcements": inactive_announcements,
            "all_students_announcements": all_students_count,
            "residents_announcements": residents_count,
            "total_feedback": total_feedback,
            "submitted_feedback": submitted_feedback,
        },

        "announcements": [
            {
                "announcement_id": announcement.announcement_id,
                "title": announcement.title,
                "message": announcement.message,
                "announcement_date": announcement.announcement_date,
                "audience": announcement.audience,
                "announcement_status": announcement.announcement_status,
            }
            for announcement in announcements
        ],

        "feedback": [
            {
                "feedback_id": feedback.feedback_id,
                "student_id": feedback.student_id,
                "feedback_type": feedback.feedback_type,
                "message": feedback.message,
                "feedback_date": feedback.feedback_date,
                "feedback_status": feedback.feedback_status,
            }
            for feedback in feedback_list
        ],
    }
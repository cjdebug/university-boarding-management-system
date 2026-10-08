from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.announcement import Announcement
from app.models.notification import Notification
from app.models.student import Student
from app.models.user import User
from app.models.room_allocation import RoomAllocation
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementResponse,
)


router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
)


# OWNER - create announcement
@router.post(
    "",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
)

def create_announcement(
    announcement_data: AnnouncementCreate,
    db: Session = Depends(get_db),
):
    new_announcement = Announcement(
        title=announcement_data.title,
        message=announcement_data.message,
        announcement_date=announcement_data.announcement_date,
        audience=announcement_data.audience,
        announcement_status="active",
    )

    db.add(new_announcement)
    db.flush()

    audience = announcement_data.audience.strip().lower()

    if audience == "residents":

        users = (
            db.query(User)
            .join(Student, Student.user_id == User.user_id)
            .join(
                RoomAllocation,
                RoomAllocation.student_id == Student.student_id,
            )
            .filter(
                User.role == "student",
                User.account_status == "active",
                RoomAllocation.allocation_status == "active",
            )
            .distinct()
            .all()
        )

    else:

        users = (
            db.query(User)
            .join(Student, Student.user_id == User.user_id)
            .filter(
                User.role == "student",
                User.account_status == "active",
            )
            .all()
        )

    for user in users:

        notification = Notification(
            user_id=user.user_id,
            title=announcement_data.title,
            message=announcement_data.message,
            notification_type="announcement",
            is_read=False,
        )

        db.add(notification)

    db.commit()
    db.refresh(new_announcement)

    return new_announcement


# OWNER + STUDENT - read announcements
@router.get(
    "",
    response_model=list[AnnouncementResponse],
)
def get_announcements(
    db: Session = Depends(get_db),
):
    announcements = db.query(Announcement).all()

    return announcements
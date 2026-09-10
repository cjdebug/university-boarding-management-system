from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.announcement import Announcement
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementResponse,
)


router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
)


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
    db.commit()
    db.refresh(new_announcement)

    return new_announcement
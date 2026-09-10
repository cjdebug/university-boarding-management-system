from datetime import date

from pydantic import BaseModel


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    announcement_date: date
    audience: str = "all_students"


class AnnouncementResponse(BaseModel):
    announcement_id: int
    title: str
    message: str
    announcement_date: date
    audience: str
    announcement_status: str

    class Config:
        from_attributes = True
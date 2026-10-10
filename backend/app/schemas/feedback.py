from datetime import date

from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    feedback_type: str
    message: str


class FeedbackUpdate(BaseModel):
    feedback_type: str
    message: str
    feedback_status: str
    owner_response: str | None = None


class FeedbackResponse(BaseModel):
    feedback_id: int
    student_id: int
    feedback_type: str
    message: str
    feedback_date: date
    feedback_status: str
    owner_response: str | None = None

    class Config:
        from_attributes = True
from datetime import date

from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    feedback_type: str
    message: str


class FeedbackResponse(BaseModel):
    feedback_id: int
    student_id: int
    feedback_type: str
    message: str
    feedback_date: date
    feedback_status: str

    class Config:
        from_attributes = True
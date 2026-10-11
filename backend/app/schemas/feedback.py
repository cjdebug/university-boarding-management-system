from datetime import date

from pydantic import BaseModel, ConfigDict

class FeedbackCreate(BaseModel):
    feedback_type: str
    message: str

class FeedbackUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    feedback_status: str
    owner_response: str | None = None

class FeedbackStudentUpdate(BaseModel):
    feedback_type: str
    message: str

class FeedbackResponse(BaseModel):
    feedback_id: int
    student_id: int
    student_name: str | None = None
    feedback_type: str
    message: str
    feedback_date: date
    feedback_status: str
    owner_response: str | None = None

    model_config = ConfigDict(from_attributes=True)
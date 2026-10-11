from datetime import date

from pydantic import BaseModel, ConfigDict

class ComplaintCreate(BaseModel):
    complaint_type: str
    description: str

class ComplaintUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    complaint_status: str

class ComplaintStudentUpdate(BaseModel):
    complaint_type: str
    description: str

class ComplaintResponse(BaseModel):
    complaint_id: int
    student_id: int
    student_name: str | None = None
    room_number: str | None = None
    complaint_type: str
    description: str
    complaint_date: date
    complaint_status: str

    model_config = ConfigDict(from_attributes=True)
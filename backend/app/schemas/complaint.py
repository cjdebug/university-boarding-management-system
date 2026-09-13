from datetime import date

from pydantic import BaseModel


class ComplaintCreate(BaseModel):
    complaint_type: str
    description: str


class ComplaintResponse(BaseModel):
    complaint_id: int
    student_id: int
    complaint_type: str
    description: str
    complaint_date: date
    complaint_status: str

    class Config:
        from_attributes = True
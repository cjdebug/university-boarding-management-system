from datetime import date

from pydantic import BaseModel


class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str


class LeaveRequestResponse(BaseModel):
    leave_request_id: int
    student_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    request_status: str

    class Config:
        from_attributes = True
from datetime import date

from pydantic import BaseModel, ConfigDict

class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class LeaveRequestUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_status: str

class LeaveRequestStudentUpdate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class LeaveRequestResponse(BaseModel):
    leave_request_id: int
    student_id: int
    student_name: str | None = None
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    request_status: str

    model_config = ConfigDict(from_attributes=True)
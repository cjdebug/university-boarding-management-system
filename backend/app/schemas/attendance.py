from datetime import date

from pydantic import BaseModel


class AttendanceCreate(BaseModel):
    student_id: int
    attendance_date: date
    attendance_status: str
    note: str | None = None


class AttendanceResponse(BaseModel):
    attendance_id: int
    student_id: int
    attendance_date: date
    attendance_status: str
    note: str | None

    class Config:
        from_attributes = True
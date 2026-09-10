from datetime import date

from pydantic import BaseModel


class MaintenanceRequestCreate(BaseModel):
    student_id: int
    room_id: int
    issue_type: str
    description: str
    request_date: date


class MaintenanceRequestResponse(BaseModel):
    maintenance_request_id: int
    student_id: int
    room_id: int
    issue_type: str
    description: str
    request_date: date
    request_status: str

    class Config:
        from_attributes = True
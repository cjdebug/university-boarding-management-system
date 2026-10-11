from datetime import date

from pydantic import BaseModel, ConfigDict

class MaintenanceRequestCreate(BaseModel):
    issue_type: str
    description: str

class MaintenanceRequestUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_status: str

class MaintenanceRequestStudentUpdate(BaseModel):
    issue_type: str
    description: str

class MaintenanceRequestResponse(BaseModel):
    maintenance_request_id: int
    student_id: int
    room_id: int
    student_name: str | None = None
    room_number: str | None = None
    issue_type: str
    description: str
    request_date: date
    request_status: str

    model_config = ConfigDict(from_attributes=True)
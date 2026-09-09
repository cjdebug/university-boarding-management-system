from datetime import date

from pydantic import BaseModel


class RoomAllocationCreate(BaseModel):
    student_id: int
    room_id: int
    bed_number: str | None = None
    allocation_date: date
    expected_checkout_date: date | None = None


class RoomAllocationResponse(BaseModel):
    allocation_id: int
    student_id: int
    room_id: int
    bed_number: str | None
    allocation_date: date
    expected_checkout_date: date | None
    actual_checkout_date: date | None
    allocation_status: str

    class Config:
        from_attributes = True
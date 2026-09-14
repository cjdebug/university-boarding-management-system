from pydantic import BaseModel


class RoomCreate(BaseModel):
    room_number: str
    floor_number: int | None = None
    capacity: int
    description: str | None = None


class RoomResponse(BaseModel):
    room_id: int
    room_number: str
    floor_number: int | None
    capacity: int
    occupied_beds: int
    room_status: str
    description: str | None

    class Config:
        from_attributes = True
from datetime import date
from pydantic import BaseModel
from typing import Optional


class StudentCreate(BaseModel):
    username: str
    password: str

    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

    academic_institution: Optional[str] = None
    course_name: Optional[str] = None

    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class StudentResponse(BaseModel):
    student_id: int
    user_id: int
    registration_no: str
    full_name: str

    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

    academic_institution: Optional[str] = None
    course_name: Optional[str] = None

    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    student_status: str

    class Config:
        from_attributes = True
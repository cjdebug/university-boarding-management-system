from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


class StudentCreate(BaseModel):
    username: str
    password: str
    full_name: str

    date_of_birth: Optional[date] = None
    gender: Optional[str] = None

    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None

    address: Optional[str] = None
    academic_institution: Optional[str] = None
    course_name: Optional[str] = None

    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    @field_validator(
        "phone_number",
        "guardian_phone",
        "emergency_contact_phone"
    )
    @classmethod
    def validate_phone_number(cls, value):
        if value is None or value == "":
            return None

        cleaned = value.replace(" ", "").replace("-", "")

        if not cleaned.isdigit():
            raise ValueError("Phone number must contain only digits")

        if len(cleaned) != 10:
            raise ValueError("Phone number must contain exactly 10 digits")

        if not cleaned.startswith("0"):
            raise ValueError("Phone number must start with 0")

        return cleaned


class StudentResponse(BaseModel):
    student_id: int
    user_id: int
    registration_no: str

    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None

    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None

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
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
)


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_attendance(
    attendance_data: AttendanceCreate,
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(
        Student.student_id == attendance_data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    new_attendance = Attendance(
        student_id=attendance_data.student_id,
        attendance_date=attendance_data.attendance_date,
        attendance_status=attendance_data.attendance_status,
        note=attendance_data.note,
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return new_attendance
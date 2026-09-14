from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.models.user import User
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
)
from app.services.auth_service import get_current_user


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


# OWNER - view all attendance records
@router.get(
    "",
    response_model=list[AttendanceResponse],
)
def get_attendance_records(
    db: Session = Depends(get_db),
):
    attendance_records = db.query(Attendance).all()

    return attendance_records


# STUDENT - view only their own attendance
@router.get(
    "/my",
    response_model=list[AttendanceResponse],
)
def get_my_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter(
        Student.user_id == current_user.user_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    attendance_records = db.query(Attendance).filter(
        Attendance.student_id == student.student_id
    ).all()

    return attendance_records
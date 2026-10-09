from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.models.user import User
from app.schemas.attendance import (
    AttendanceCreate,
    BulkAttendanceCreate,
    AttendanceResponse,
)
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


# OWNER - create attendance record
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

# OWNER - mark attendance for multiple students
@router.post(
    "/bulk",
    response_model=list[AttendanceResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_bulk_attendance(
    bulk_data: BulkAttendanceCreate,
    db: Session = Depends(get_db),
):
    created_records = []

    for record in bulk_data.records:
        student = db.query(Student).filter(
            Student.student_id == record.student_id
        ).first()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student {record.student_id} not found",
            )

        new_attendance = Attendance(
            student_id=record.student_id,
            attendance_date=bulk_data.attendance_date,
            attendance_status=record.attendance_status,
            note=record.note,
        )

        db.add(new_attendance)
        created_records.append(new_attendance)

    db.commit()

    for record in created_records:
        db.refresh(record)

    return created_records

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


# OWNER - update attendance record
@router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse,
)
def update_attendance(
    attendance_id: int,
    attendance_data: AttendanceCreate,
    db: Session = Depends(get_db),
):
    attendance = db.query(Attendance).filter(
        Attendance.attendance_id == attendance_id
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )

    student = db.query(Student).filter(
        Student.student_id == attendance_data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    attendance.student_id = attendance_data.student_id
    attendance.attendance_date = attendance_data.attendance_date
    attendance.attendance_status = attendance_data.attendance_status
    attendance.note = attendance_data.note

    db.commit()
    db.refresh(attendance)

    return attendance

# OWNER - delete attendance record
@router.delete(
    "/{attendance_id}",
)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
):
    attendance = db.query(Attendance).filter(
        Attendance.attendance_id == attendance_id
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )

    db.delete(attendance)
    db.commit()

    return {
        "message": "Attendance record deleted successfully",
    }


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

# STUDENT - view own attendance percentage
@router.get(
    "/my/percentage",
)
def get_my_attendance_percentage(
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

    total_attendance = len(attendance_records)

    if total_attendance == 0:
        return {
            "total_attendance": 0,
            "present": 0,
            "absent": 0,
            "late": 0,
            "attendance_percentage": 0,
        }

    present = sum(
        1
        for record in attendance_records
        if record.attendance_status.lower() == "present"
    )

    absent = sum(
        1
        for record in attendance_records
        if record.attendance_status.lower() == "absent"
    )

    late = sum(
        1
        for record in attendance_records
        if record.attendance_status.lower() == "late"
    )

    attendance_percentage = round(
        (present / total_attendance) * 100,
        2,
    )

    return {
        "total_attendance": total_attendance,
        "present": present,
        "absent": absent,
        "late": late,
        "attendance_percentage": attendance_percentage,
    }
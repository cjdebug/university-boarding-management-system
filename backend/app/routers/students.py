from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.session import get_db
from app.models.student import Student
from app.models.user import User
from app.schemas.student import (
    StudentCreate,
    StudentResponse,
    StudentUpdate,
)
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
):
    existing_username = db.query(User).filter(
        User.username == student_data.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    new_user = User(
        username=student_data.username,
        password_hash=hash_password(student_data.password),
        role="student",
        account_status="active",
    )

    db.add(new_user)
    db.flush()

    new_student = Student(
        user_id=new_user.user_id,
        registration_no="TEMP",
        full_name=student_data.full_name,
        date_of_birth=student_data.date_of_birth,
        gender=student_data.gender,
        phone_number=student_data.phone_number,
        email=student_data.email,
        address=student_data.address,
        academic_institution=student_data.academic_institution,
        course_name=student_data.course_name,
        guardian_name=student_data.guardian_name,
        guardian_phone=student_data.guardian_phone,
        emergency_contact_name=student_data.emergency_contact_name,
        emergency_contact_phone=student_data.emergency_contact_phone,
        student_status="active",
    )

    db.add(new_student)
    db.flush()

    new_student.registration_no = (
        f"STU-{new_student.student_id:04d}"
    )

    db.commit()
    db.refresh(new_student)

    return new_student


@router.get(
    "",
    response_model=list[StudentResponse],
)
def get_students(
    db: Session = Depends(get_db),
):
    students = db.query(Student).all()

    return students

@router.get(
    "/me",
    response_model=StudentResponse,
)
def get_my_profile(
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

    return student

@router.put(
    "/me",
    response_model=StudentResponse,
)
def update_my_profile(
    student_data: StudentUpdate,
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

    if student_data.full_name is not None:
        student.full_name = student_data.full_name

    if student_data.phone_number is not None:
        student.phone_number = student_data.phone_number

    if student_data.email is not None:
        student.email = student_data.email

    if student_data.address is not None:
        student.address = student_data.address

    if student_data.guardian_name is not None:
        student.guardian_name = student_data.guardian_name

    if student_data.guardian_phone is not None:
        student.guardian_phone = student_data.guardian_phone

    if student_data.emergency_contact_name is not None:
        student.emergency_contact_name = (
            student_data.emergency_contact_name
        )

    if student_data.emergency_contact_phone is not None:
        student.emergency_contact_phone = (
            student_data.emergency_contact_phone
        )

    db.commit()
    db.refresh(student)

    return student
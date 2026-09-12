from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fee_record import FeeRecord
from app.models.student import Student
from app.models.user import User
from app.schemas.fee_record import FeeRecordCreate, FeeRecordResponse
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/fee-records",
    tags=["Fee Records"],
)


@router.post(
    "",
    response_model=FeeRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_fee_record(
    fee_data: FeeRecordCreate,
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(
        Student.student_id == fee_data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    new_fee_record = FeeRecord(
        student_id=fee_data.student_id,
        fee_type=fee_data.fee_type,
        amount=fee_data.amount,
        due_date=fee_data.due_date,
        fee_status="pending",
        description=fee_data.description,
    )

    db.add(new_fee_record)
    db.commit()
    db.refresh(new_fee_record)

    return new_fee_record


# OWNER - view all fee records
@router.get(
    "",
    response_model=list[FeeRecordResponse],
)
def get_fee_records(
    db: Session = Depends(get_db),
):
    fee_records = db.query(FeeRecord).all()

    return fee_records


# STUDENT - view only their own fee records
@router.get(
    "/my",
    response_model=list[FeeRecordResponse],
)
def get_my_fee_records(
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

    fee_records = db.query(FeeRecord).filter(
        FeeRecord.student_id == student.student_id
    ).all()

    return fee_records
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fee_record import FeeRecord
from app.models.student import Student
from app.schemas.fee_record import (
    FeeRecordCreate,
    FeeRecordResponse,
)


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

    new_fee = FeeRecord(
        student_id=fee_data.student_id,
        fee_type=fee_data.fee_type,
        amount=fee_data.amount,
        due_date=fee_data.due_date,
        fee_status="pending",
        description=fee_data.description,
    )

    db.add(new_fee)
    db.commit()
    db.refresh(new_fee)

    return new_fee
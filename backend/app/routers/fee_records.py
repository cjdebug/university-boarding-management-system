from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.fee_record import FeeRecord
from app.models.payment import Payment
from app.models.notification import Notification
from app.models.student import Student
from app.models.user import User

from app.schemas.fee_record import FeeRecordCreate, FeeRecordResponse

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/fee-records",
    tags=["Fee Records"],
)


# OWNER - create fee record
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

    student_user = db.query(User).filter(
        User.user_id == student.user_id,
        User.role == "student",
        User.account_status == "active",
    ).first()

    if student_user:
        notification = Notification(
            user_id=student_user.user_id,
            title="New Fee Record",
            message="A new boarding fee record has been added to your account.",
            notification_type="fee_record",
            is_read=False,
        )

        db.add(notification)

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


# OWNER - view overdue fee records
@router.get(
    "/overdue",
    response_model=list[FeeRecordResponse],
)
def get_overdue_fee_records(
    db: Session = Depends(get_db),
):
    overdue_records = db.query(FeeRecord).filter(
        FeeRecord.due_date < date.today(),
        FeeRecord.fee_status != "paid",
    ).all()

    return overdue_records


# OWNER - update fee record
@router.put(
    "/{fee_record_id}",
    response_model=FeeRecordResponse,
)
def update_fee_record(
    fee_record_id: int,
    fee_data: FeeRecordCreate,
    db: Session = Depends(get_db),
):
    fee_record = db.query(FeeRecord).filter(
        FeeRecord.fee_record_id == fee_record_id
    ).first()

    if not fee_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee record not found",
        )

    student = db.query(Student).filter(
        Student.student_id == fee_data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    fee_record.student_id = fee_data.student_id
    fee_record.fee_type = fee_data.fee_type
    fee_record.amount = fee_data.amount
    fee_record.due_date = fee_data.due_date
    fee_record.description = fee_data.description

    db.commit()
    db.refresh(fee_record)

    return fee_record


# OWNER - delete fee record
@router.delete(
    "/{fee_record_id}",
)
def delete_fee_record(
    fee_record_id: int,
    db: Session = Depends(get_db),
):
    fee_record = db.query(FeeRecord).filter(
        FeeRecord.fee_record_id == fee_record_id
    ).first()

    if not fee_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee record not found",
        )

    existing_payment = db.query(Payment).filter(
        Payment.fee_record_id == fee_record_id
    ).first()

    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a fee record that has payments.",
        )

    db.delete(fee_record)
    db.commit()

    return {
        "message": "Fee record deleted successfully",
    }


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
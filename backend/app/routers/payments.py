from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fee_record import FeeRecord
from app.models.payment import Payment
from app.models.student import Student
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


# CREATE PAYMENT
@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
):
    fee_record = db.query(FeeRecord).filter(
        FeeRecord.fee_record_id == payment_data.fee_record_id
    ).first()

    if not fee_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee record not found",
        )

    if payment_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be greater than zero",
        )

    current_paid = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(
        Payment.fee_record_id == payment_data.fee_record_id
    ).scalar()

    current_paid = Decimal(current_paid)

    remaining_balance = fee_record.amount - current_paid

    if payment_data.amount > remaining_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount cannot exceed outstanding balance",
        )

    new_payment = Payment(
        fee_record_id=payment_data.fee_record_id,
        amount=payment_data.amount,
        payment_date=payment_data.payment_date,
        payment_method=payment_data.payment_method,
        reference_no=payment_data.reference_no,
        note=payment_data.note,
    )

    db.add(new_payment)
    db.flush()

    new_total_paid = current_paid + payment_data.amount

    if new_total_paid >= fee_record.amount:
        fee_record.fee_status = "paid"
    elif new_total_paid > 0:
        fee_record.fee_status = "partially_paid"
    else:
        fee_record.fee_status = "pending"

    db.commit()
    db.refresh(new_payment)

    return new_payment


# READ ALL PAYMENTS
@router.get(
    "",
    response_model=list[PaymentResponse],
)
def get_payments(
    db: Session = Depends(get_db),
):
    payments = db.query(Payment).all()

    return payments


# UPDATE PAYMENT
@router.put(
    "/{payment_id}",
    response_model=PaymentResponse,
)
def update_payment(
    payment_id: int,
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).filter(
        Payment.payment_id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    new_fee_record = db.query(FeeRecord).filter(
        FeeRecord.fee_record_id == payment_data.fee_record_id
    ).first()

    if not new_fee_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee record not found",
        )

    if payment_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be greater than zero",
        )

    old_fee_record_id = payment.fee_record_id

    # Calculate amount already paid excluding the payment being updated
    current_paid = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(
        Payment.fee_record_id == payment_data.fee_record_id,
        Payment.payment_id != payment_id,
    ).scalar()

    current_paid = Decimal(current_paid)

    remaining_balance = new_fee_record.amount - current_paid

    if payment_data.amount > remaining_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount cannot exceed outstanding balance",
        )

    payment.fee_record_id = payment_data.fee_record_id
    payment.amount = payment_data.amount
    payment.payment_date = payment_data.payment_date
    payment.payment_method = payment_data.payment_method
    payment.reference_no = payment_data.reference_no
    payment.note = payment_data.note

    # Update status of the new fee record
    new_total_paid = current_paid + payment_data.amount

    if new_total_paid >= new_fee_record.amount:
        new_fee_record.fee_status = "paid"
    elif new_total_paid > 0:
        new_fee_record.fee_status = "partially_paid"
    else:
        new_fee_record.fee_status = "pending"

    # If the payment was moved from another fee record,
    # recalculate the old fee record status.
    if old_fee_record_id != payment_data.fee_record_id:
        old_fee_record = db.query(FeeRecord).filter(
            FeeRecord.fee_record_id == old_fee_record_id
        ).first()

        if old_fee_record:
            old_total_paid = db.query(
                func.coalesce(func.sum(Payment.amount), 0)
            ).filter(
                Payment.fee_record_id == old_fee_record_id,
                Payment.payment_id != payment_id,
            ).scalar()

            old_total_paid = Decimal(old_total_paid)

            if old_total_paid >= old_fee_record.amount:
                old_fee_record.fee_status = "paid"
            elif old_total_paid > 0:
                old_fee_record.fee_status = "partially_paid"
            else:
                old_fee_record.fee_status = "pending"

    db.commit()
    db.refresh(payment)

    return payment


# DELETE PAYMENT
@router.delete(
    "/{payment_id}",
)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).filter(
        Payment.payment_id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    fee_record_id = payment.fee_record_id

    db.delete(payment)
    db.flush()

    fee_record = db.query(FeeRecord).filter(
        FeeRecord.fee_record_id == fee_record_id
    ).first()

    if fee_record:
        remaining_paid = db.query(
            func.coalesce(func.sum(Payment.amount), 0)
        ).filter(
            Payment.fee_record_id == fee_record_id
        ).scalar()

        remaining_paid = Decimal(remaining_paid)

        if remaining_paid >= fee_record.amount:
            fee_record.fee_status = "paid"
        elif remaining_paid > 0:
            fee_record.fee_status = "partially_paid"
        else:
            fee_record.fee_status = "pending"

    db.commit()

    return {
        "message": "Payment deleted successfully",
    }


# STUDENT - view only their own payments
@router.get(
    "/my",
    response_model=list[PaymentResponse],
)
def get_my_payments(
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

    payments = (
        db.query(Payment)
        .join(
            FeeRecord,
            Payment.fee_record_id == FeeRecord.fee_record_id,
        )
        .filter(
            FeeRecord.student_id == student.student_id
        )
        .all()
    )

    return payments
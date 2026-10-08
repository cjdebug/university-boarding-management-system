from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fee_record import FeeRecord
from app.models.payment import Payment


router = APIRouter(
    prefix="/reports/fee-payments",
    tags=["Fee & Payment Reports"],
)


@router.get("")
def get_fee_payment_report(
    db: Session = Depends(get_db),
):
    fee_records = db.query(FeeRecord).all()

    report = []

    total_fees = 0
    total_amount = Decimal("0.00")
    total_paid = Decimal("0.00")
    total_outstanding = Decimal("0.00")

    for fee_record in fee_records:

        paid_amount = db.query(
            func.coalesce(func.sum(Payment.amount), 0)
        ).filter(
            Payment.fee_record_id == fee_record.fee_record_id
        ).scalar()

        paid_amount = Decimal(paid_amount)

        outstanding_amount = fee_record.amount - paid_amount

        if outstanding_amount < 0:
            outstanding_amount = Decimal("0.00")

        payment_count = db.query(
            func.count(Payment.payment_id)
        ).filter(
            Payment.fee_record_id == fee_record.fee_record_id
        ).scalar()

        report.append({
            "fee_record_id": fee_record.fee_record_id,
            "student_id": fee_record.student_id,
            "fee_type": fee_record.fee_type,
            "amount": fee_record.amount,
            "due_date": fee_record.due_date,
            "fee_status": fee_record.fee_status,
            "total_paid": paid_amount,
            "outstanding_balance": outstanding_amount,
            "payment_count": payment_count,
        })

        total_fees += 1
        total_amount += fee_record.amount
        total_paid += paid_amount
        total_outstanding += outstanding_amount

    return {
        "summary": {
            "total_fee_records": total_fees,
            "total_amount": total_amount,
            "total_paid": total_paid,
            "total_outstanding": total_outstanding,
        },
        "records": report,
    }
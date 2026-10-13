
from collections import defaultdict
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fee_record import FeeRecord
from app.models.payment import Payment


router = APIRouter(
    prefix="/reports/fee-payments",
    tags=["Fee & Payment Reports"],
)


ZERO = Decimal("0.00")


def money(value):
    """Convert database values into Decimal amounts."""
    if value is None:
        return ZERO

    return Decimal(str(value))


def calculate_fee_status(fee_record, paid_amount, outstanding):
    """
    Calculate the current reporting status based on
    payment balances and fee due dates.
    """

    if outstanding <= ZERO:
        return "paid"

    if fee_record.due_date < date.today():
        return "overdue"

    if paid_amount > ZERO:
        return "partially_paid"

    return "pending"

# descriptive analysis
def generate_analysis(
    total_records,
    total_billed,
    total_paid,
    total_outstanding,
    collection_rate,
    overdue_amount,
    status_counts,
    fee_type_data,
):
    """Generate descriptive financial analysis."""

    insights = []

    if total_records == 0:
        return [
            "No fee records match the selected report filters."
        ]

    insights.append(
        f"The selected report contains {total_records} "
        f"fee record(s), with a total billed amount of "
        f"Rs. {total_billed:,.2f}."
    )

    if total_billed > ZERO:
        outstanding_rate = (
            total_outstanding / total_billed
        ) * Decimal("100")

        insights.append(
            f"The collection rate is {collection_rate:.2f}%. "
            f"Approximately {outstanding_rate:.2f}% "
            f"of the billed amount remains outstanding."
        )

        if collection_rate >= Decimal("90"):
            insights.append(
                "Fee collection performance is strong, "
                "with at least 90% of billed fees collected."
            )

        elif collection_rate >= Decimal("60"):
            insights.append(
                "Most billed fees have been collected, "
                "but outstanding balances still require attention."
            )

        else:
            insights.append(
                "A substantial portion of billed fees "
                "remains outstanding. Reviewing unpaid "
                "accounts may help improve collections."
            )

    if overdue_amount > ZERO:
        insights.append(
            f"Overdue fees account for "
            f"Rs. {overdue_amount:,.2f} "
            f"of the outstanding balance. "
            f"These records should be prioritized "
            f"for payment follow-up."
        )

    else:
        insights.append(
            "There are no overdue outstanding balances "
            "among the selected fee records."
        )

    if status_counts.get("overdue", 0) > 0:
        insights.append(
            f"{status_counts['overdue']} fee record(s) "
            f"are currently overdue."
        )

    if fee_type_data:
        highest_type = max(
            fee_type_data,
            key=lambda item: item["outstanding"]
        )

        if highest_type["outstanding"] > ZERO:
            insights.append(
                f"The fee category with the highest "
                f"outstanding balance is "
                f"{highest_type['fee_type']}, "
                f"with Rs. "
                f"{highest_type['outstanding']:,.2f} "
                f"remaining unpaid."
            )

    return insights


@router.get("")
def get_fee_payment_report(
    from_date: date | None = Query(
        default=None,
        description="Include fees due on or after this date",
    ),
    to_date: date | None = Query(
        default=None,
        description="Include fees due on or before this date",
    ),
    fee_status: str | None = Query(
        default=None,
        description="Filter by calculated fee status",
    ),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------
    # 1. Validate report filters
    # --------------------------------------------------

    if (
        from_date is not None
        and to_date is not None
        and from_date > to_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="From Date cannot be after To Date",
        )

    allowed_statuses = {
        "paid",
        "partially_paid",
        "pending",
        "overdue",
    }

    if fee_status is not None:
        fee_status = fee_status.strip().lower()

        if not fee_status:
            fee_status = None

        elif fee_status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid fee status filter",
            )

    # --------------------------------------------------
    # 2. Filter fee records by due date
    # --------------------------------------------------

    query = db.query(FeeRecord)

    if from_date is not None:
        query = query.filter(
            FeeRecord.due_date >= from_date
        )

    if to_date is not None:
        query = query.filter(
            FeeRecord.due_date <= to_date
        )

    fee_records = query.order_by(
        FeeRecord.due_date.asc(),
        FeeRecord.fee_record_id.asc(),
    ).all()

    fee_ids = [
        fee.fee_record_id
        for fee in fee_records
    ]

    # --------------------------------------------------
    # 3. Aggregate payments efficiently
    # --------------------------------------------------

    payment_totals = {}

    if fee_ids:
        payment_rows = (
            db.query(
                Payment.fee_record_id,
                func.sum(Payment.amount).label("total_paid"),
                func.count(Payment.payment_id).label(
                    "payment_count"
                ),
            )
            .filter(
                Payment.fee_record_id.in_(fee_ids)
            )
            .group_by(Payment.fee_record_id)
            .all()
        )

        for row in payment_rows:
            payment_totals[row.fee_record_id] = {
                "total_paid": money(row.total_paid),
                "payment_count": row.payment_count,
            }

    # --------------------------------------------------
    # 4. Prepare summary variables
    # --------------------------------------------------

    records = []

    total_billed = ZERO
    total_paid = ZERO
    total_outstanding = ZERO
    overdue_amount = ZERO

    status_counts = {
        "paid": 0,
        "partially_paid": 0,
        "pending": 0,
        "overdue": 0,
    }

    status_amounts = {
        "paid": ZERO,
        "partially_paid": ZERO,
        "pending": ZERO,
        "overdue": ZERO,
    }

    fee_type_totals = defaultdict(
        lambda: {
            "count": 0,
            "billed": ZERO,
            "paid": ZERO,
            "outstanding": ZERO,
        }
    )

    # --------------------------------------------------
    # 5. Process fee records
    # --------------------------------------------------

    for fee in fee_records:
        payment_info = payment_totals.get(
            fee.fee_record_id,
            {
                "total_paid": ZERO,
                "payment_count": 0,
            },
        )

        billed = money(fee.amount)
        paid = payment_info["total_paid"]

        outstanding = max(
            billed - paid,
            ZERO,
        )

        reporting_status = calculate_fee_status(
            fee,
            paid,
            outstanding,
        )

        # Apply fee status filter
        if (
            fee_status is not None
            and reporting_status != fee_status
        ):
            continue

        records.append({
            "fee_record_id": fee.fee_record_id,
            "student_id": fee.student_id,
            "fee_type": fee.fee_type,
            "amount": billed,
            "due_date": fee.due_date,
            "fee_status": reporting_status,
            "stored_fee_status": fee.fee_status,
            "total_paid": paid,
            "outstanding_balance": outstanding,
            "payment_count": payment_info["payment_count"],
        })

        total_billed += billed
        total_paid += paid
        total_outstanding += outstanding

        status_counts[reporting_status] += 1
        status_amounts[reporting_status] += billed

        if reporting_status == "overdue":
            overdue_amount += outstanding

        category = fee_type_totals[fee.fee_type]

        category["count"] += 1
        category["billed"] += billed
        category["paid"] += paid
        category["outstanding"] += outstanding

    # --------------------------------------------------
    # 6. Calculate collection performance
    # --------------------------------------------------

    total_records = len(records)

    if total_billed > ZERO:
        collection_rate = round(
            (total_paid / total_billed) * 100,
            2,
        )
    else:
        collection_rate = Decimal("0.00")

    # --------------------------------------------------
    # 7. Prepare fee status distribution
    # --------------------------------------------------

    fee_status_distribution = [
        {
            "status": status_name,
            "count": status_counts[status_name],
            "amount": status_amounts[status_name],
        }
        for status_name in [
            "paid",
            "partially_paid",
            "pending",
            "overdue",
        ]
    ]

    # --------------------------------------------------
    # 8. Prepare outstanding by fee type
    # --------------------------------------------------

    outstanding_by_fee_type = []

    for category_name, values in fee_type_totals.items():
        outstanding_by_fee_type.append({
            "fee_type": category_name,
            "count": values["count"],
            "billed": values["billed"],
            "paid": values["paid"],
            "outstanding": values["outstanding"],
        })

    outstanding_by_fee_type.sort(
        key=lambda item: item["outstanding"],
        reverse=True,
    )

    # --------------------------------------------------
    # 9. Prepare payment trend
    # --------------------------------------------------

    selected_fee_ids = [
        record["fee_record_id"]
        for record in records
    ]

    payment_trend = []

    if selected_fee_ids:
        payments = db.query(Payment).filter(
            Payment.fee_record_id.in_(
                selected_fee_ids
            )
        ).all()

        monthly_payments = defaultdict(
            lambda: ZERO
        )

        for payment in payments:
            month = payment.payment_date.strftime(
                "%Y-%m"
            )

            monthly_payments[month] += money(
                payment.amount
            )

        payment_trend = [
            {
                "month": month,
                "amount": monthly_payments[month],
            }
            for month in sorted(monthly_payments)
        ]

    # --------------------------------------------------
    # 10. Generate descriptive analysis
    # --------------------------------------------------

    analysis = generate_analysis(
        total_records=total_records,
        total_billed=total_billed,
        total_paid=total_paid,
        total_outstanding=total_outstanding,
        collection_rate=collection_rate,
        overdue_amount=overdue_amount,
        status_counts=status_counts,
        fee_type_data=outstanding_by_fee_type,
    )

    # --------------------------------------------------
    # 11. Return the analytical report
    # --------------------------------------------------

    return {
        "report_title": "Fee & Payment Analytical Report",
        "generated_on": date.today(),

        "filters": {
            "from_date": from_date,
            "to_date": to_date,
            "fee_status": fee_status,
            "date_basis": "fee_due_date",
        },

        "available_filters": {
            "fee_statuses": [
                "paid",
                "partially_paid",
                "pending",
                "overdue",
            ],
        },

        "summary": {
            "total_fee_records": total_records,
            "total_amount": total_billed,
            "total_paid": total_paid,
            "total_outstanding": total_outstanding,
            "collection_rate": collection_rate,
            "overdue_amount": overdue_amount,
            "paid_count": status_counts["paid"],
            "partially_paid_count": status_counts["partially_paid"],
            "pending_count": status_counts["pending"],
            "overdue_count": status_counts["overdue"],
        },

        "charts": {
            "collection_performance": [
                {
                    "name": "Collected",
                    "value": total_paid,
                },
                {
                    "name": "Outstanding",
                    "value": total_outstanding,
                },
            ],
            "fee_status_distribution": fee_status_distribution,
            "outstanding_by_fee_type": outstanding_by_fee_type,
            "payment_trend": payment_trend,
        },

        "analysis": analysis,

        "records": records,
    }

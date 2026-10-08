from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.notification import Notification
from app.models.fee_record import FeeRecord
from app.models.student import Student
from app.models.user import User

from app.schemas.notification import NotificationResponse

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# OWNER - send payment reminders for overdue fee records
@router.post(
    "/payment-reminders",
)
def send_payment_reminders(
    db: Session = Depends(get_db),
):
    overdue_records = (
        db.query(FeeRecord)
        .filter(
            FeeRecord.due_date < date.today(),
            FeeRecord.fee_status != "paid",
        )
        .all()
    )

    reminders_created = 0

    for fee_record in overdue_records:

        student = (
            db.query(Student)
            .filter(
                Student.student_id == fee_record.student_id
            )
            .first()
        )

        if not student:
            continue

        student_user = (
            db.query(User)
            .filter(
                User.user_id == student.user_id,
                User.role == "student",
                User.account_status == "active",
            )
            .first()
        )

        if not student_user:
            continue

        existing_reminder = (
            db.query(Notification)
            .filter(
                Notification.user_id == student_user.user_id,
                Notification.notification_type == "payment_reminder",
                Notification.is_read == False,
                Notification.message.contains(
                    f"Fee #{fee_record.fee_record_id}"
                ),
            )
            .first()
        )

        if existing_reminder:
            continue

        notification = Notification(
            user_id=student_user.user_id,
            title="Payment Reminder",
            message=(
                f"Your boarding fee (Fee #{fee_record.fee_record_id}) "
                f"is overdue. Please make the outstanding payment as soon as possible."
            ),
            notification_type="payment_reminder",
            is_read=False,
        )

        db.add(notification)
        reminders_created += 1

    db.commit()

    return {
        "message": "Payment reminders processed successfully.",
        "reminders_created": reminders_created,
        "overdue_records": len(overdue_records),
    }


# CURRENT USER - view notifications
@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return notifications


# CURRENT USER - get unread notification count
@router.get(
    "/unread-count",
)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.user_id,
            Notification.is_read == False,
        )
        .count()
    )

    return {
        "unread_count": count,
    }


# CURRENT USER - mark notification as read
@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.notification_id == notification_id,
            Notification.user_id == current_user.user_id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification
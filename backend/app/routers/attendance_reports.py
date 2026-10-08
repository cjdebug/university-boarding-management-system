from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest


router = APIRouter(
    prefix="/attendance-reports",
    tags=["Attendance Reports"],
)


@router.get("")
def get_attendance_report(
    db: Session = Depends(get_db),
):
    # Get all attendance records
    attendance_records = (
        db.query(Attendance)
        .order_by(Attendance.attendance_date.desc())
        .all()
    )

    # Get all leave requests
    leave_requests = (
        db.query(LeaveRequest)
        .order_by(LeaveRequest.start_date.desc())
        .all()
    )

    # Attendance summary
    total_attendance = len(attendance_records)
    present_count = 0
    absent_count = 0
    leave_count = 0

    for record in attendance_records:
        status_value = record.attendance_status.lower()

        if status_value == "present":
            present_count += 1

        elif status_value == "absent":
            absent_count += 1

        elif status_value == "leave":
            leave_count += 1

    # Leave request summary
    total_leave_requests = len(leave_requests)
    approved_leave = 0
    pending_leave = 0
    rejected_leave = 0

    for request in leave_requests:
        status_value = request.request_status.lower()

        if status_value == "approved":
            approved_leave += 1

        elif status_value == "pending":
            pending_leave += 1

        elif status_value == "rejected":
            rejected_leave += 1

    return {
        "summary": {
            "total_attendance": total_attendance,
            "present": present_count,
            "absent": absent_count,
            "leave": leave_count,
            "total_leave_requests": total_leave_requests,
            "approved_leave": approved_leave,
            "pending_leave": pending_leave,
            "rejected_leave": rejected_leave,
        },
        "attendance_records": attendance_records,
        "leave_requests": leave_requests,
    }
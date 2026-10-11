
from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.student import Student


router = APIRouter(
    prefix="/attendance-reports",
    tags=["Attendance Reports"],
)


def calculate_percentage(numerator, denominator):
    if denominator == 0:
        return 0.0

    return round((numerator / denominator) * 100, 2)


def generate_analysis(
    total_attendance,
    present_count,
    absent_count,
    late_count,
    leave_count,
    attendance_rate,
    total_leave_requests,
    approved_leave,
    pending_leave,
    rejected_leave,
    student_comparison,
):
    insights = []

    if total_attendance == 0:
        insights.append(
            "No attendance records match the selected filters."
        )
    else:
        insights.append(
            f"The selected report contains {total_attendance} "
            f"attendance record(s): {present_count} Present, "
            f"{absent_count} Absent, {late_count} Late, "
            f"and {leave_count} Leave."
        )

        insights.append(
            f"The recorded attendance rate is "
            f"{attendance_rate:.2f}%, counting Present "
            f"and Late records as attendance."
        )

        absence_rate = calculate_percentage(
            absent_count,
            total_attendance
        )

        insights.append(
            f"Absent records represent {absence_rate:.2f}% "
            f"of the selected attendance records."
        )

        if absent_count > 0:
            insights.append(
                "Recorded absences should be reviewed "
                "to identify students who may require follow-up."
            )

        if late_count > 0:
            insights.append(
                f"There are {late_count} Late attendance "
                f"record(s), which may require attention "
                f"if lateness occurs repeatedly."
            )

        if student_comparison:
            lowest = min(
                student_comparison,
                key=lambda item: (
                    item["attendance_rate"],
                    -item["total_records"]
                )
            )

            if lowest["attendance_rate"] < 75:
                insights.append(
                    f"{lowest['student_name']} has a recorded "
                    f"attendance rate of "
                    f"{lowest['attendance_rate']:.2f}% "
                    f"across {lowest['total_records']} "
                    f"selected record(s). This may warrant "
                    f"review if sufficient attendance data "
                    f"has been recorded."
                )

    if total_leave_requests > 0:
        approval_rate = calculate_percentage(
            approved_leave,
            total_leave_requests
        )

        insights.append(
            f"There are {total_leave_requests} leave "
            f"request(s) overlapping the selected reporting "
            f"period, including {approved_leave} Approved, "
            f"{pending_leave} Pending, and "
            f"{rejected_leave} Rejected."
        )

        insights.append(
            f"The leave request approval rate is "
            f"{approval_rate:.2f}%."
        )

        if pending_leave > 0:
            insights.append(
                f"{pending_leave} leave request(s) are "
                f"still pending review."
            )
    else:
        insights.append(
            "No leave requests match the selected "
            "reporting period."
        )

    return insights


@router.get("")
def get_attendance_report(
    from_date: date | None = Query(
        default=None,
        description="Attendance records on or after this date"
    ),
    to_date: date | None = Query(
        default=None,
        description="Attendance records on or before this date"
    ),
    attendance_status: str | None = Query(
        default=None,
        description="Filter by attendance status"
    ),
    db: Session = Depends(get_db),
):
    # -----------------------------------------------
    # 1. Validate filters
    # -----------------------------------------------

    if (
        from_date is not None
        and to_date is not None
        and from_date > to_date
    ):
        raise HTTPException(
            status_code=400,
            detail="From Date cannot be after To Date"
        )

    allowed_statuses = {
        "present",
        "absent",
        "late",
        "leave",
    }

    if attendance_status is not None:
        attendance_status = (
            attendance_status.strip().lower()
        )

        if not attendance_status:
            attendance_status = None

        elif attendance_status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid attendance status filter"
            )

    # -----------------------------------------------
    # 2. Get attendance records
    # -----------------------------------------------

    attendance_query = db.query(Attendance)

    if from_date is not None:
        attendance_query = attendance_query.filter(
            Attendance.attendance_date >= from_date
        )

    if to_date is not None:
        attendance_query = attendance_query.filter(
            Attendance.attendance_date <= to_date
        )

    attendance_records = (
        attendance_query
        .order_by(Attendance.attendance_date.desc())
        .all()
    )

    # Apply attendance status filter
    if attendance_status is not None:
        attendance_records = [
            record
            for record in attendance_records
            if (record.attendance_status or "")
            .strip()
            .lower() == attendance_status
        ]

    # -----------------------------------------------
    # 3. Get leave requests
    # -----------------------------------------------

    leave_query = db.query(LeaveRequest)

    # Include leave periods overlapping the date range
    if from_date is not None:
        leave_query = leave_query.filter(
            LeaveRequest.end_date >= from_date
        )

    if to_date is not None:
        leave_query = leave_query.filter(
            LeaveRequest.start_date <= to_date
        )

    leave_requests = (
        leave_query
        .order_by(LeaveRequest.start_date.desc())
        .all()
    )

    # -----------------------------------------------
    # 4. Load student names
    # -----------------------------------------------

    student_ids = {
        record.student_id
        for record in attendance_records
    }

    student_ids.update(
        request.student_id
        for request in leave_requests
    )

    students = []

    if student_ids:
        students = (
            db.query(Student)
            .filter(Student.student_id.in_(student_ids))
            .all()
        )

    student_names = {
        student.student_id: student.full_name
        for student in students
    }

    # -----------------------------------------------
    # 5. Initialize attendance summary
    # -----------------------------------------------

    counts = {
        "present": 0,
        "absent": 0,
        "late": 0,
        "leave": 0,
    }

    daily_totals = defaultdict(
        lambda: {
            "present": 0,
            "absent": 0,
            "late": 0,
            "leave": 0,
        }
    )

    student_totals = defaultdict(
        lambda: {
            "present": 0,
            "absent": 0,
            "late": 0,
            "leave": 0,
            "total_records": 0,
        }
    )

    attendance_output = []

    # -----------------------------------------------
    # 6. Process attendance records
    # -----------------------------------------------

    for record in attendance_records:
        status_value = (
            record.attendance_status or ""
        ).strip().lower()

        attendance_output.append({
            "attendance_id": record.attendance_id,
            "student_id": record.student_id,
            "student_name": student_names.get(
                record.student_id,
                "Unknown Student"
            ),
            "attendance_date": record.attendance_date,
            "attendance_status": record.attendance_status,
            "note": record.note,
        })

        if status_value not in counts:
            continue

        counts[status_value] += 1

        day = record.attendance_date.isoformat()

        daily_totals[day][status_value] += 1

        student_totals[
            record.student_id
        ][status_value] += 1

        student_totals[
            record.student_id
        ]["total_records"] += 1

    total_attendance = len(attendance_records)

    present_count = counts["present"]
    absent_count = counts["absent"]
    late_count = counts["late"]
    leave_count = counts["leave"]

    attended_count = present_count + late_count

    attendance_rate = calculate_percentage(
        attended_count,
        total_attendance
    )

    # -----------------------------------------------
    # 7. Attendance distribution chart
    # -----------------------------------------------

    attendance_distribution = [
        {
            "status": "Present",
            "count": present_count,
        },
        {
            "status": "Absent",
            "count": absent_count,
        },
        {
            "status": "Late",
            "count": late_count,
        },
        {
            "status": "Leave",
            "count": leave_count,
        },
    ]

    # -----------------------------------------------
    # 8. Daily attendance trend chart
    # -----------------------------------------------

    daily_attendance_trend = []

    for day in sorted(daily_totals):
        values = daily_totals[day]

        daily_attendance_trend.append({
            "date": day,
            "present": values["present"],
            "absent": values["absent"],
            "late": values["late"],
            "leave": values["leave"],
            "total": sum(values.values()),
        })

    # -----------------------------------------------
    # 9. Student attendance comparison chart
    # -----------------------------------------------

    student_comparison = []

    for student_id, values in student_totals.items():
        total = values["total_records"]

        attended = (
            values["present"] + values["late"]
        )

        student_comparison.append({
            "student_id": student_id,
            "student_name": student_names.get(
                student_id,
                "Unknown Student"
            ),
            "total_records": total,
            "present": values["present"],
            "absent": values["absent"],
            "late": values["late"],
            "leave": values["leave"],
            "attendance_rate": calculate_percentage(
                attended,
                total
            ),
        })

    student_comparison.sort(
        key=lambda item: (
            item["attendance_rate"],
            -item["total_records"],
            item["student_name"],
        )
    )

    # -----------------------------------------------
    # 10. Process leave requests
    # -----------------------------------------------

    leave_status_counts = {
        "approved": 0,
        "pending": 0,
        "rejected": 0,
    }

    leave_output = []

    for request in leave_requests:
        status_value = (
            request.request_status or ""
        ).strip().lower()

        if status_value in leave_status_counts:
            leave_status_counts[status_value] += 1

        leave_output.append({
            "leave_request_id": request.leave_request_id,
            "student_id": request.student_id,
            "student_name": student_names.get(
                request.student_id,
                "Unknown Student"
            ),
            "leave_type": request.leave_type,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "reason": request.reason,
            "request_status": request.request_status,
        })

    total_leave_requests = len(leave_requests)

    approved_leave = leave_status_counts["approved"]
    pending_leave = leave_status_counts["pending"]
    rejected_leave = leave_status_counts["rejected"]

    leave_status_distribution = [
        {
            "status": "Approved",
            "count": approved_leave,
        },
        {
            "status": "Pending",
            "count": pending_leave,
        },
        {
            "status": "Rejected",
            "count": rejected_leave,
        },
    ]

    # -----------------------------------------------
    # 11. Generate descriptive analysis
    # -----------------------------------------------

    analysis = generate_analysis(
        total_attendance=total_attendance,
        present_count=present_count,
        absent_count=absent_count,
        late_count=late_count,
        leave_count=leave_count,
        attendance_rate=attendance_rate,
        total_leave_requests=total_leave_requests,
        approved_leave=approved_leave,
        pending_leave=pending_leave,
        rejected_leave=rejected_leave,
        student_comparison=student_comparison,
    )

    # -----------------------------------------------
    # 12. Return analytical report
    # -----------------------------------------------

    return {
        "report_title": "Attendance Analytical Report",
        "generated_on": date.today(),

        "filters": {
            "from_date": from_date,
            "to_date": to_date,
            "attendance_status": attendance_status,
            "date_basis": "attendance_date",
            "leave_date_basis": "overlapping_leave_period",
        },

        "available_filters": {
            "attendance_statuses": [
                "present",
                "absent",
                "late",
                "leave",
            ],
        },

        "summary": {
            "total_attendance": total_attendance,
            "present": present_count,
            "absent": absent_count,
            "late": late_count,
            "leave": leave_count,
            "attended_count": attended_count,
            "attendance_rate": attendance_rate,
            "total_leave_requests": total_leave_requests,
            "approved_leave": approved_leave,
            "pending_leave": pending_leave,
            "rejected_leave": rejected_leave,
        },

        "charts": {
            "attendance_distribution": (
                attendance_distribution
            ),
            "daily_attendance_trend": (
                daily_attendance_trend
            ),
            "student_comparison": student_comparison,
            "leave_status_distribution": (
                leave_status_distribution
            ),
        },

        "analysis": analysis,

        # Preserve detailed records for compatibility
        "attendance_records": attendance_output,
        "leave_requests": leave_output,
    }

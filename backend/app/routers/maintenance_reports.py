
from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.maintenance_request import MaintenanceRequest
from app.models.student import Student
from app.models.room import Room


router = APIRouter(
    prefix="/maintenance-reports",
    tags=["Maintenance Reports"],
)


def calculate_percentage(value, total):
    if total == 0:
        return 0.0

    return round((value / total) * 100, 2)


def normalize_status(value):
    return (value or "").strip().lower()


def generate_analysis(
    total_requests,
    pending_count,
    in_progress_count,
    completed_count,
    completion_rate,
    issue_type_data,
    room_data,
):
    insights = []

    if total_requests == 0:
        return [
            "No maintenance requests match the selected report filters."
        ]

    insights.append(
        f"The selected report contains {total_requests} "
        f"maintenance request(s), including {pending_count} Pending, "
        f"{in_progress_count} In Progress, and "
        f"{completed_count} Completed."
    )

    insights.append(
        f"The maintenance completion rate is "
        f"{completion_rate:.2f}%."
    )

    unresolved = pending_count + in_progress_count

    if unresolved > 0:
        insights.append(
            f"There are {unresolved} unresolved maintenance "
            f"request(s) in the selected records."
        )
    else:
        insights.append(
            "All selected maintenance requests have been completed."
        )

    if pending_count > 0:
        insights.append(
            f"{pending_count} request(s) are currently pending. "
            f"These may require review or assignment."
        )

    if issue_type_data:
        most_common = issue_type_data[0]

        insights.append(
            f"The most frequently reported issue category is "
            f"{most_common['issue_type']}, with "
            f"{most_common['count']} request(s)."
        )

    if room_data:
        highest_room = room_data[0]

        insights.append(
            f"Room {highest_room['room_number']} has the "
            f"highest number of maintenance requests "
            f"among the selected records, with "
            f"{highest_room['count']} request(s)."
        )

    if completion_rate >= 80:
        insights.append(
            "At least 80% of the selected maintenance "
            "requests have been completed."
        )
    elif completion_rate >= 50:
        insights.append(
            "At least half of the selected maintenance "
            "requests have been completed, while the "
            "remaining requests still require attention."
        )
    else:
        insights.append(
            "Fewer than half of the selected maintenance "
            "requests have been completed. Reviewing the "
            "outstanding workload may help prioritize repairs."
        )

    return insights


@router.get("")
def get_maintenance_report(
    from_date: date | None = Query(
        default=None,
        description="Include requests on or after this date",
    ),
    to_date: date | None = Query(
        default=None,
        description="Include requests on or before this date",
    ),
    request_status: str | None = Query(
        default=None,
        description="Filter by maintenance request status",
    ),
    db: Session = Depends(get_db),
):
    # ---------------------------------------------
    # 1. Validate report filters
    # ---------------------------------------------

    if (
        from_date is not None
        and to_date is not None
        and from_date > to_date
    ):
        raise HTTPException(
            status_code=400,
            detail="From Date cannot be after To Date",
        )

    allowed_statuses = {
        "pending",
        "in_progress",
        "completed",
    }

    if request_status is not None:
        request_status = normalize_status(request_status)

        if not request_status:
            request_status = None

        elif request_status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid maintenance request status",
            )

    # ---------------------------------------------
    # 2. Retrieve filtered maintenance requests
    # ---------------------------------------------

    query = db.query(MaintenanceRequest)

    if from_date is not None:
        query = query.filter(
            MaintenanceRequest.request_date >= from_date
        )

    if to_date is not None:
        query = query.filter(
            MaintenanceRequest.request_date <= to_date
        )

    maintenance_requests = (
        query
        .order_by(
            MaintenanceRequest.request_date.desc(),
            MaintenanceRequest.maintenance_request_id.desc(),
        )
        .all()
    )

    # Apply status filter
    if request_status is not None:
        maintenance_requests = [
            request
            for request in maintenance_requests
            if normalize_status(request.request_status)
            == request_status
        ]

    # ---------------------------------------------
    # 3. Retrieve student names and room numbers
    # ---------------------------------------------

    student_ids = {
        request.student_id
        for request in maintenance_requests
    }

    room_ids = {
        request.room_id
        for request in maintenance_requests
    }

    students = []
    rooms = []

    if student_ids:
        students = (
            db.query(Student)
            .filter(Student.student_id.in_(student_ids))
            .all()
        )

    if room_ids:
        rooms = (
            db.query(Room)
            .filter(Room.room_id.in_(room_ids))
            .all()
        )

    student_names = {
        student.student_id: student.full_name
        for student in students
    }

    room_numbers = {
        room.room_id: str(room.room_number)
        for room in rooms
    }

    # ---------------------------------------------
    # 4. Initialize summary and chart counters
    # ---------------------------------------------

    status_counts = {
        "pending": 0,
        "in_progress": 0,
        "completed": 0,
    }

    issue_type_counts = defaultdict(int)
    room_counts = defaultdict(int)
    monthly_counts = defaultdict(int)

    report_records = []

    # ---------------------------------------------
    # 5. Process maintenance records
    # ---------------------------------------------

    for request in maintenance_requests:
        current_status = normalize_status(
            request.request_status
        )

        issue_type = (
            request.issue_type or "Other"
        ).strip().title()

        room_number = room_numbers.get(
            request.room_id,
            "Unknown"
        )

        student_name = student_names.get(
            request.student_id,
            "Unknown Student"
        )

        report_records.append({
            "maintenance_request_id":
                request.maintenance_request_id,
            "student_id": request.student_id,
            "student_name": student_name,
            "room_id": request.room_id,
            "room_number": room_number,
            "issue_type": request.issue_type,
            "description": request.description,
            "request_date": request.request_date,
            "request_status": request.request_status,
        })

        if current_status in status_counts:
            status_counts[current_status] += 1

        issue_type_counts[issue_type] += 1

        room_counts[room_number] += 1

        month = request.request_date.strftime("%Y-%m")
        monthly_counts[month] += 1

    # ---------------------------------------------
    # 6. Calculate maintenance performance
    # ---------------------------------------------

    total_requests = len(maintenance_requests)

    pending_count = status_counts["pending"]
    in_progress_count = status_counts["in_progress"]
    completed_count = status_counts["completed"]

    unresolved_count = (
        pending_count + in_progress_count
    )

    completion_rate = calculate_percentage(
        completed_count,
        total_requests,
    )

    # ---------------------------------------------
    # 7. Status distribution chart
    # ---------------------------------------------

    status_distribution = [
        {
            "status": "Pending",
            "count": pending_count,
        },
        {
            "status": "In Progress",
            "count": in_progress_count,
        },
        {
            "status": "Completed",
            "count": completed_count,
        },
    ]

    # ---------------------------------------------
    # 8. Issue type distribution chart
    # ---------------------------------------------

    issue_type_distribution = [
        {
            "issue_type": issue_type,
            "count": count,
        }
        for issue_type, count in issue_type_counts.items()
    ]

    issue_type_distribution.sort(
        key=lambda item: (
            -item["count"],
            item["issue_type"],
        )
    )

    # ---------------------------------------------
    # 9. Room maintenance comparison chart
    # ---------------------------------------------

    requests_by_room = [
        {
            "room_number": room_number,
            "count": count,
        }
        for room_number, count in room_counts.items()
    ]

    requests_by_room.sort(
        key=lambda item: (
            -item["count"],
            item["room_number"],
        )
    )

    # ---------------------------------------------
    # 10. Monthly maintenance request trend
    # ---------------------------------------------

    monthly_request_trend = [
        {
            "month": month,
            "count": monthly_counts[month],
        }
        for month in sorted(monthly_counts)
    ]

    # ---------------------------------------------
    # 11. Generate descriptive analysis
    # ---------------------------------------------

    analysis = generate_analysis(
        total_requests=total_requests,
        pending_count=pending_count,
        in_progress_count=in_progress_count,
        completed_count=completed_count,
        completion_rate=completion_rate,
        issue_type_data=issue_type_distribution,
        room_data=requests_by_room,
    )

    # ---------------------------------------------
    # 12. Return analytical report
    # ---------------------------------------------

    return {
        "report_title": "Maintenance Analytical Report",
        "generated_on": date.today(),

        "filters": {
            "from_date": from_date,
            "to_date": to_date,
            "request_status": request_status,
            "date_basis": "request_date",
        },

        "available_filters": {
            "request_statuses": [
                "pending",
                "in_progress",
                "completed",
            ],
        },

        "summary": {
            "total_requests": total_requests,
            "pending": pending_count,
            "in_progress": in_progress_count,
            "completed": completed_count,
            "unresolved": unresolved_count,
            "completion_rate": completion_rate,
        },

        "charts": {
            "status_distribution": status_distribution,
            "issue_type_distribution":
                issue_type_distribution,
            "requests_by_room": requests_by_room,
            "monthly_request_trend":
                monthly_request_trend,
        },

        "analysis": analysis,

        # Preserve records for frontend compatibility
        "maintenance_requests": report_records,
    }

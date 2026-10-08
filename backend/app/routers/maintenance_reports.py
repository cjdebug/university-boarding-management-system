from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.maintenance_request import MaintenanceRequest


router = APIRouter(
    prefix="/maintenance-reports",
    tags=["Maintenance Reports"],
)


@router.get("")
def get_maintenance_report(
    db: Session = Depends(get_db),
):
    # Get all maintenance requests
    maintenance_requests = (
        db.query(MaintenanceRequest)
        .order_by(MaintenanceRequest.request_date.desc())
        .all()
    )

    # Maintenance summary
    total_requests = len(maintenance_requests)

    pending_count = 0
    in_progress_count = 0
    completed_count = 0

    for request in maintenance_requests:
        status_value = request.request_status.lower()

        if status_value == "pending":
            pending_count += 1

        elif status_value == "in_progress":
            in_progress_count += 1

        elif status_value == "completed":
            completed_count += 1

    return {
        "summary": {
            "total_requests": total_requests,
            "pending": pending_count,
            "in_progress": in_progress_count,
            "completed": completed_count,
        },
        "maintenance_requests": maintenance_requests,
    }

from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.announcement import Announcement
from app.models.feedback import Feedback


router = APIRouter(
    prefix="/communication-turnover-reports",
    tags=["Communication & Turnover Reports"],
)


def normalize(value):
    """Normalize database values for comparisons."""
    return str(value or "").strip().lower()


def percentage(value, total):
    if total == 0:
        return 0.0
    return round((value / total) * 100, 2)


def audience_label(value):
    """Group equivalent audience values together."""
    normalized = normalize(value).replace("_", " ")

    if normalized == "all students":
        return "All Students"

    if normalized == "residents":
        return "Residents"

    if not normalized:
        return "Unspecified"

    return str(value).strip().title()


def category_label(value):
    """Standardize feedback categories for chart analysis."""
    value = str(value or "").strip()

    return value.title() if value else "Unspecified"


def generate_analysis(
    announcement_summary,
    feedback_summary,
    audience_data,
    category_data,
):
    insights = []

    total_announcements = announcement_summary["total"]
    active = announcement_summary["active"]
    inactive = announcement_summary["inactive"]
    pinned = announcement_summary["pinned"]

    total_feedback = feedback_summary["total"]
    submitted = feedback_summary["submitted"]
    reviewed = feedback_summary["reviewed"]
    resolved = feedback_summary["resolved"]
    responded = feedback_summary["responded"]

    if total_announcements > 0:
        active_rate = percentage(
            active, total_announcements
        )

        insights.append(
            f"The selected report contains "
            f"{total_announcements} announcement(s), "
            f"including {active} Active and "
            f"{inactive} Inactive announcements."
        )

        insights.append(
            f"The active announcement rate is "
            f"{active_rate:.2f}%. "
            f"There are {pinned} pinned announcement(s)."
        )

        if audience_data:
            largest_audience = audience_data[0]

            insights.append(
                f"The most frequently targeted audience "
                f"is {largest_audience['audience']}, "
                f"with {largest_audience['count']} "
                f"announcement(s)."
            )
    else:
        insights.append(
            "No announcements match the selected "
            "announcement filters."
        )

    if total_feedback > 0:
        insights.append(
            f"The selected report contains "
            f"{total_feedback} feedback record(s): "
            f"{submitted} Submitted, "
            f"{reviewed} Reviewed, and "
            f"{resolved} Resolved."
        )

        resolved_rate = percentage(
            resolved, total_feedback
        )

        response_rate = percentage(
            responded, total_feedback
        )

        insights.append(
            f"The feedback resolution rate is "
            f"{resolved_rate:.2f}%, while the "
            f"owner response rate is "
            f"{response_rate:.2f}%."
        )

        if submitted > 0:
            insights.append(
                f"{submitted} feedback record(s) "
                f"remain in Submitted status. "
                f"These may require owner review."
            )

        if category_data:
            largest_category = category_data[0]

            insights.append(
                f"The most common feedback category "
                f"is {largest_category['feedback_type']}, "
                f"with {largest_category['count']} "
                f"submission(s)."
            )
    else:
        insights.append(
            "No student feedback records match "
            "the selected feedback filters."
        )

    return insights


@router.get("")
def get_communication_turnover_report(
    from_date: date | None = Query(
        default=None,
        description="Start date of the reporting period",
    ),
    to_date: date | None = Query(
        default=None,
        description="End date of the reporting period",
    ),
    announcement_status: str | None = Query(
        default=None,
        description="Filter by announcement status",
    ),
    feedback_status: str | None = Query(
        default=None,
        description="Filter by feedback status",
    ),
    db: Session = Depends(get_db),
):
    # ------------------------------------------
    # 1. Validate filters
    # ------------------------------------------

    if (
        from_date is not None
        and to_date is not None
        and from_date > to_date
    ):
        raise HTTPException(
            status_code=400,
            detail="From Date cannot be after To Date",
        )

    allowed_announcement_statuses = {
        "active",
        "inactive",
    }

    allowed_feedback_statuses = {
        "submitted",
        "reviewed",
        "resolved",
    }

    if announcement_status is not None:
        announcement_status = normalize(
            announcement_status
        ) or None

        if (
            announcement_status is not None
            and announcement_status
            not in allowed_announcement_statuses
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid announcement status filter",
            )

    if feedback_status is not None:
        feedback_status = normalize(
            feedback_status
        ) or None

        if (
            feedback_status is not None
            and feedback_status
            not in allowed_feedback_statuses
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid feedback status filter",
            )

    # ------------------------------------------
    # 2. Retrieve announcements
    # ------------------------------------------

    announcement_query = db.query(Announcement)

    if from_date is not None:
        announcement_query = announcement_query.filter(
            Announcement.announcement_date >= from_date
        )

    if to_date is not None:
        announcement_query = announcement_query.filter(
            Announcement.announcement_date <= to_date
        )

    announcements = (
        announcement_query
        .order_by(
            Announcement.announcement_date.desc(),
            Announcement.announcement_id.desc(),
        )
        .all()
    )

    if announcement_status is not None:
        announcements = [
            item
            for item in announcements
            if normalize(item.announcement_status)
            == announcement_status
        ]

    # ------------------------------------------
    # 3. Retrieve feedback
    # ------------------------------------------

    feedback_query = db.query(Feedback)

    if from_date is not None:
        feedback_query = feedback_query.filter(
            Feedback.feedback_date >= from_date
        )

    if to_date is not None:
        feedback_query = feedback_query.filter(
            Feedback.feedback_date <= to_date
        )

    feedback_list = (
        feedback_query
        .order_by(
            Feedback.feedback_date.desc(),
            Feedback.feedback_id.desc(),
        )
        .all()
    )

    if feedback_status is not None:
        feedback_list = [
            item
            for item in feedback_list
            if normalize(item.feedback_status)
            == feedback_status
        ]

    # ------------------------------------------
    # 4. Initialize announcement counters
    # ------------------------------------------

    announcement_counts = {
        "active": 0,
        "inactive": 0,
    }

    audience_counts = defaultdict(int)
    monthly_announcement_counts = defaultdict(int)

    pinned_count = 0
    announcement_output = []

    # ------------------------------------------
    # 5. Process announcements
    # ------------------------------------------

    for announcement in announcements:
        current_status = normalize(
            announcement.announcement_status
        )

        audience = audience_label(
            announcement.audience
        )

        is_pinned = bool(
            getattr(announcement, "is_pinned", False)
        )

        if current_status in announcement_counts:
            announcement_counts[current_status] += 1

        if is_pinned:
            pinned_count += 1

        audience_counts[audience] += 1

        month = announcement.announcement_date.strftime(
            "%Y-%m"
        )

        monthly_announcement_counts[month] += 1

        announcement_output.append({
            "announcement_id":
                announcement.announcement_id,
            "title": announcement.title,
            "message": announcement.message,
            "announcement_date":
                announcement.announcement_date,
            "audience": announcement.audience,
            "announcement_status":
                announcement.announcement_status,
            "is_pinned": is_pinned,
        })

    total_announcements = len(announcements)

    active_announcements = announcement_counts["active"]
    inactive_announcements = announcement_counts["inactive"]

    # ------------------------------------------
    # 6. Initialize feedback counters
    # ------------------------------------------

    feedback_counts = {
        "submitted": 0,
        "reviewed": 0,
        "resolved": 0,
    }

    feedback_category_counts = defaultdict(int)
    monthly_feedback_counts = defaultdict(int)

    responded_count = 0
    feedback_output = []

    # ------------------------------------------
    # 7. Process feedback
    # ------------------------------------------

    for feedback in feedback_list:
        current_status = normalize(
            feedback.feedback_status
        )

        category = category_label(
            feedback.feedback_type
        )

        if current_status in feedback_counts:
            feedback_counts[current_status] += 1

        feedback_category_counts[category] += 1

        month = feedback.feedback_date.strftime(
            "%Y-%m"
        )

        monthly_feedback_counts[month] += 1

        owner_response = getattr(
            feedback, "owner_response", None
        )

        if (
            owner_response is not None
            and str(owner_response).strip()
        ):
            responded_count += 1

        feedback_output.append({
            "feedback_id": feedback.feedback_id,
            "student_id": feedback.student_id,
            "feedback_type": feedback.feedback_type,
            "message": feedback.message,
            "feedback_date": feedback.feedback_date,
            "feedback_status": feedback.feedback_status,
            "owner_response": owner_response,
        })

    total_feedback = len(feedback_list)

    submitted_feedback = feedback_counts["submitted"]
    reviewed_feedback = feedback_counts["reviewed"]
    resolved_feedback = feedback_counts["resolved"]

    # ------------------------------------------
    # 8. Calculate additional performance metrics
    # ------------------------------------------

    announcement_active_rate = percentage(
        active_announcements,
        total_announcements,
    )

    feedback_resolution_rate = percentage(
        resolved_feedback,
        total_feedback,
    )

    feedback_response_rate = percentage(
        responded_count,
        total_feedback,
    )

    # ------------------------------------------
    # 9. Announcement status chart
    # ------------------------------------------

    announcement_status_distribution = [
        {
            "status": "Active",
            "count": active_announcements,
        },
        {
            "status": "Inactive",
            "count": inactive_announcements,
        },
    ]

    # ------------------------------------------
    # 10. Announcement audience chart
    # ------------------------------------------

    announcements_by_audience = [
        {
            "audience": audience,
            "count": count,
        }
        for audience, count in audience_counts.items()
    ]

    announcements_by_audience.sort(
        key=lambda item: (
            -item["count"],
            item["audience"],
        )
    )

    # ------------------------------------------
    # 11. Feedback category chart
    # ------------------------------------------

    feedback_by_category = [
        {
            "feedback_type": category,
            "count": count,
        }
        for category, count in feedback_category_counts.items()
    ]

    feedback_by_category.sort(
        key=lambda item: (
            -item["count"],
            item["feedback_type"],
        )
    )

    # ------------------------------------------
    # 12. Feedback status chart
    # ------------------------------------------

    feedback_status_distribution = [
        {
            "status": "Submitted",
            "count": submitted_feedback,
        },
        {
            "status": "Reviewed",
            "count": reviewed_feedback,
        },
        {
            "status": "Resolved",
            "count": resolved_feedback,
        },
    ]

    # ------------------------------------------
    # 13. Optional monthly communication trend
    # ------------------------------------------

    all_months = sorted(
        set(monthly_announcement_counts)
        | set(monthly_feedback_counts)
    )

    monthly_communication_trend = [
        {
            "month": month,
            "announcements":
                monthly_announcement_counts[month],
            "feedback": monthly_feedback_counts[month],
        }
        for month in all_months
    ]

    # ------------------------------------------
    # 14. Generate descriptive analysis
    # ------------------------------------------

    analysis = generate_analysis(
        announcement_summary={
            "total": total_announcements,
            "active": active_announcements,
            "inactive": inactive_announcements,
            "pinned": pinned_count,
        },
        feedback_summary={
            "total": total_feedback,
            "submitted": submitted_feedback,
            "reviewed": reviewed_feedback,
            "resolved": resolved_feedback,
            "responded": responded_count,
        },
        audience_data=announcements_by_audience,
        category_data=feedback_by_category,
    )

    # ------------------------------------------
    # 15. Return analytical report
    # ------------------------------------------

    all_students_count = audience_counts.get(
        "All Students", 0
    )

    residents_count = audience_counts.get(
        "Residents", 0
    )

    return {
        "report_title":
            "Communication & Turnover Analytical Report",
        "generated_on": date.today(),

        "filters": {
            "from_date": from_date,
            "to_date": to_date,
            "announcement_status": announcement_status,
            "feedback_status": feedback_status,
        },

        "available_filters": {
            "announcement_statuses": [
                "active",
                "inactive",
            ],
            "feedback_statuses": [
                "submitted",
                "reviewed",
                "resolved",
            ],
        },

        "summary": {
            "total_announcements": total_announcements,
            "active_announcements": active_announcements,
            "inactive_announcements": inactive_announcements,
            "all_students_announcements":
                all_students_count,
            "residents_announcements": residents_count,
            "pinned_announcements": pinned_count,
            "announcement_active_rate":
                announcement_active_rate,

            "total_feedback": total_feedback,
            "submitted_feedback": submitted_feedback,
            "reviewed_feedback": reviewed_feedback,
            "resolved_feedback": resolved_feedback,
            "responded_feedback": responded_count,
            "feedback_resolution_rate":
                feedback_resolution_rate,
            "feedback_response_rate":
                feedback_response_rate,
        },

        "charts": {
            "announcement_status_distribution":
                announcement_status_distribution,
            "announcements_by_audience":
                announcements_by_audience,
            "feedback_by_category":
                feedback_by_category,
            "feedback_status_distribution":
                feedback_status_distribution,
            "monthly_communication_trend":
                monthly_communication_trend,
        },

        "analysis": analysis,

        # Preserve existing response fields
        "announcements": announcement_output,
        "feedback": feedback_output,
    }
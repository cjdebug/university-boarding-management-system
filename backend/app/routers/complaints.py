from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.complaint import Complaint
from app.models.student import Student
from app.models.room import Room
from app.models.room_allocation import RoomAllocation
from app.models.user import User
from app.models.notification import Notification

from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintStudentUpdate,
    ComplaintResponse,
)

from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"],
)

# Attach student name and current room number
def add_display_details(complaints, db):
    if not complaints:
        return complaints

    student_ids = {
        complaint.student_id for complaint in complaints
    }

    students = db.query(Student).filter(
        Student.student_id.in_(student_ids)
    ).all()

    allocations = db.query(RoomAllocation).filter(
        RoomAllocation.student_id.in_(student_ids),
        RoomAllocation.allocation_status == "active",
    ).all()

    room_ids = {
        allocation.room_id for allocation in allocations
    }

    rooms = (
        db.query(Room).filter(
            Room.room_id.in_(room_ids)
        ).all()
        if room_ids else []
    )

    student_names = {
        student.student_id: student.full_name
        for student in students
    }

    room_numbers = {
        room.room_id: room.room_number
        for room in rooms
    }

    student_rooms = {}

    for allocation in allocations:
        student_rooms[allocation.student_id] = (
            room_numbers.get(
                allocation.room_id,
                "Not Assigned"
            )
        )

    for complaint in complaints:
        complaint.student_name = student_names.get(
            complaint.student_id,
            "Unknown Student"
        )

        complaint.room_number = student_rooms.get(
            complaint.student_id,
            "Not Assigned"
        )

    return complaints

# OWNER - read all complaints
@router.get(
    "",
    response_model=list[ComplaintResponse],
)
def get_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can view all complaints",
        )

    complaints = db.query(Complaint).all()

    return add_display_details(complaints, db)

# STUDENT - create complaint
@router.post(
    "",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_complaint(
    complaint_data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit complaints",
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.user_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    new_complaint = Complaint(
        student_id=student.student_id,
        complaint_type=complaint_data.complaint_type,
        description=complaint_data.description,
        complaint_date=date.today(),
        complaint_status="pending",
    )

    db.add(new_complaint)

    owner = db.query(User).filter(
        User.role == "owner",
        User.account_status == "active",
    ).first()

    if owner:
        notification = Notification(
            user_id=owner.user_id,
            title="New Complaint",
            message="A student has submitted a new complaint.",
            notification_type="complaint",
            is_read=False,
        )

        db.add(notification)

    db.commit()
    db.refresh(new_complaint)

    return new_complaint

# STUDENT - read only own complaints
@router.get(
    "/my",
    response_model=list[ComplaintResponse],
)
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can view their complaints",
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.user_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    complaints = db.query(Complaint).filter(
        Complaint.student_id == student.student_id
    ).all()

    return complaints

# STUDENT - update own pending complaint
@router.put(
    "/my/{complaint_id}",
    response_model=ComplaintResponse,
)
def update_my_complaint(
    complaint_id: int,
    complaint_data: ComplaintStudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can update their complaints",
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.user_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id,
        Complaint.student_id == student.student_id,
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    if complaint.complaint_status.lower() != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending complaints can be updated.",
        )

    complaint.complaint_type = complaint_data.complaint_type
    complaint.description = complaint_data.description

    db.commit()
    db.refresh(complaint)

    return complaint

# OWNER - view complaint category statistics
@router.get(
    "/statistics",
)
def get_complaint_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can view complaint statistics",
        )

    complaints = db.query(Complaint).all()

    total_complaints = len(complaints)
    category_counts = {}

    for complaint in complaints:
        category = complaint.complaint_type.strip().title()

        if category in category_counts:
            category_counts[category] += 1
        else:
            category_counts[category] = 1

    return {
        "total_complaints": total_complaints,
        "categories": category_counts,
    }

# OWNER - update complaint status only
@router.put(
    "/{complaint_id}",
    response_model=ComplaintResponse,
)
def update_complaint(
    complaint_id: int,
    complaint_data: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can update complaint status",
        )

    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    allowed_statuses = [
        "pending",
        "in_progress",
        "resolved",
    ]

    if complaint_data.complaint_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid complaint status",
        )

    complaint.complaint_status = complaint_data.complaint_status

    db.commit()
    db.refresh(complaint)

    add_display_details([complaint], db)

    return complaint

# OWNER - delete complaint
@router.delete(
    "/{complaint_id}",
)
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can delete complaints",
        )

    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    db.delete(complaint)
    db.commit()

    return {
        "message": "Complaint deleted successfully",
    }
from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class FeeRecordCreate(BaseModel):
    student_id: int
    fee_type: str
    amount: Decimal
    due_date: date
    description: str | None = None


class FeeRecordResponse(BaseModel):
    fee_record_id: int
    student_id: int
    fee_type: str
    amount: Decimal
    due_date: date
    fee_status: str
    description: str | None

    class Config:
        from_attributes = True
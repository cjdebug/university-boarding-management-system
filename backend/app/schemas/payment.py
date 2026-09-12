from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class PaymentCreate(BaseModel):
    fee_record_id: int
    amount: Decimal
    payment_date: date
    payment_method: str
    reference_no: Optional[str] = None
    note: Optional[str] = None


class PaymentResponse(BaseModel):
    payment_id: int
    fee_record_id: int
    amount: Decimal
    payment_date: date
    payment_method: str
    reference_no: Optional[str] = None
    note: Optional[str] = None

    class Config:
        from_attributes = True
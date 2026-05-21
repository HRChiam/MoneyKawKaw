"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ===== USER MODELS =====
class UserProfileResponse(BaseModel):
    """User profile information returned from API"""
    user_id: str
    username: str
    email: Optional[str]
    savings_mode: str
    monthly_income: float
    payday: int
    main_balance: float
    current_streak: int
    reward_points: int
    created_at: Optional[str]
    
    class Config:
        from_attributes = True


# ===== TRANSACTION MODELS =====
class TransactionResponse(BaseModel):
    """Transaction information"""
    transaction_id: str
    amount: float
    counterparty_name: str
    transaction_type: str
    tax_relief_detected: bool
    tax_category: Optional[str]
    reference: Optional[str] = None
    status: Optional[str] = None
    is_warning_triggered: bool = False
    signed_amount: Optional[float] = None
    transaction_time: Optional[str] = None
    created_at: Optional[str]


class TransactionListResponse(BaseModel):
    """List of transactions"""
    transactions: List[TransactionResponse]
    count: int


# ===== POCKET MODELS =====
class PocketResponse(BaseModel):
    """Pocket information"""
    pocket_id: str
    pocket_name: str
    pocket_type: str
    monthly_limit: float
    current_balance: float


class PocketListResponse(BaseModel):
    """List of pockets"""
    pockets: List[PocketResponse]
    count: int


# ===== REQUEST MODELS =====
class TransactionRequest(BaseModel):
    """Create transaction request"""
    user_id: str
    pocket_id: str
    amount: float
    transaction_type: str
    counterparty_name: str
    tax_detected: bool = False
    tax_category: Optional[str] = None
    warning_triggered: bool = False

class SalaryUpdateRequest(BaseModel):
    """Update user salary request"""
    monthly_income: float

class NotificationResponse(BaseModel):
    notification_id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: str 

    class Config:
        from_attributes = True
        
class ClaimResponse(BaseModel):
    claim_id: str
    user_id: str
    transaction_id: str
    receipt_image_url: Optional[str] = None
    receipt_date: str
    amount: float
    tax_relief_category: str
    tax_category: Optional[str] = None

    class Config:
        from_attributes = True
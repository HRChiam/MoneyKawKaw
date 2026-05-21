"""
Database module - handles all DB connections and queries
"""

from .db import (
    get_db,
    get_user_profile,
    get_user_transactions,
    get_user_notifications,
    get_user_pockets,
    save_transaction,
    create_user_pocket,
    update_user_pocket,
    delete_user_pocket,
    execute_pocket_transfer,
    update_user_salary,
    update_user_onboarding_data,
    initialize_user_pockets
)

from .models import (
    UserProfileResponse,
    TransactionResponse,
    TransactionListResponse,
    PocketResponse,
    PocketListResponse,
    TransactionRequest,
    NotificationResponse,
    SalaryUpdateRequest
)

__all__ = [
    'get_db',
    'get_user_profile',
    'get_user_transactions',
    'get_user_notifications',
    'get_user_pockets',
    'save_transaction',
    'create_user_pocket',
    'update_user_pocket',
    'delete_user_pocket',
    'execute_pocket_transfer',
    'update_user_salary',
    'update_user_onboarding_data',
    'initialize_user_pockets',
    'UserProfileResponse',
    'TransactionResponse',
    'TransactionListResponse',
    'PocketResponse',
    'PocketListResponse',
    'TransactionRequest',
    'NotificationResponse',
    'SalaryUpdateRequest'
]
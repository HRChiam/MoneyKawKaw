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
    execute_pocket_transfer
)

from .models import (
    UserProfileResponse,
    TransactionResponse,
    TransactionListResponse,
    PocketResponse,
    PocketListResponse,
    TransactionRequest,
    NotificationResponse
)

__all__ = [
    'get_db',
    'get_user_profile',
    'get_user_transactions',
    'get_user_notifications',
    'get_user_pockets',
    'save_transaction',
    'UserProfileResponse',
    'TransactionResponse',
    'TransactionListResponse',
    'PocketResponse',
    'PocketListResponse',
    'TransactionRequest',
    'NotificationResponse'
]

"""Database connection and query functions."""

from datetime import datetime
import os
import uuid as uuid_lib

from supabase import create_client, Client

# ===== SUPABASE SETUP =====
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
_SUPABASE_CLIENT: Client | None = None


def _get_supabase_client() -> Client:
    global _SUPABASE_CLIENT
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")
    if _SUPABASE_CLIENT is None:
        _SUPABASE_CLIENT = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _SUPABASE_CLIENT


def get_db():
    """FastAPI dependency to get Supabase client."""
    yield _get_supabase_client()


# ===== QUERY FUNCTIONS =====
def get_user_profile(user_id: str, db=None):
    """
    Fetch user profile information
    Args:
        user_id: User ID to fetch
        db: Optional database session. If None, creates new session.
    Returns: User profile data as dict
    """
    try:
        supabase = db or _get_supabase_client()
        response = (
            supabase.table("users")
            .select(
                "user_id, username, email, savings_mode, monthly_income, payday, "
                "main_balance, current_streak, reward_points, created_at"
            )
            .eq("user_id", str(user_id))
            .single()
            .execute()
        )

        user = response.data
        if not user:
            return None

        return {
            "user_id": user.get("user_id"),
            "username": user.get("username"),
            "email": user.get("email"),
            "savings_mode": user.get("savings_mode"),
            "monthly_income": user.get("monthly_income"),
            "payday": user.get("payday"),
            "main_balance": user.get("main_balance"),
            "current_streak": user.get("current_streak"),
            "reward_points": user.get("reward_points"),
            "created_at": user.get("created_at"),
        }

    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None


def get_user_transactions(user_id: str, limit: int = 30, db=None):
    """
    Fetch user transactions
    Args:
        user_id: User ID to fetch transactions for
        limit: Maximum number of transactions to fetch
        db: Optional database session. If None, creates new session.
    """
    try:
        supabase = db or _get_supabase_client()
        response = (
            supabase.table("transactions")
            .select(
                "transaction_id, amount, counterparty_name, transaction_type, "
                "is_tax_relief_detected, tax_relief_category, created_at"
            )
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        transactions = response.data or []
        return [
            {
                "transaction_id": tx.get("transaction_id"),
                "amount": tx.get("amount"),
                "counterparty_name": tx.get("counterparty_name"),
                "transaction_type": tx.get("transaction_type"),
                "tax_relief_detected": tx.get("is_tax_relief_detected"),
                "tax_category": tx.get("tax_relief_category"),
                "created_at": tx.get("created_at"),
            }
            for tx in transactions
        ]

    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return []


def get_user_pockets(user_id: str, db=None):
    """
    Fetch all user pockets
    Args:
        user_id: User ID to fetch pockets for
        db: Optional database session. If None, creates new session.
    """
    try:
        supabase = db or _get_supabase_client()
        response = (
            supabase.table("pockets")
            .select(
                "pocket_id, pocket_name, pocket_type, monthly_limit, current_pocket_balance"
            )
            .eq("user_id", str(user_id))
            .execute()
        )

        pockets = response.data or []
        return [
            {
                "pocket_id": p.get("pocket_id"),
                "pocket_name": p.get("pocket_name"),
                "pocket_type": p.get("pocket_type"),
                "monthly_limit": p.get("monthly_limit"),
                "current_balance": p.get("current_pocket_balance"),
            }
            for p in pockets
        ]

    except Exception as e:
        print(f"Error fetching pockets: {e}")
        return []


def save_transaction(user_id: str, pocket_id: str, amount: float,
                     transaction_type: str, counterparty_name: str,
                     tax_detected: bool = False, tax_category: str = None,
                     warning_triggered: bool = False, db=None):
    """
    Save a new transaction to DB
    Args:
        user_id: User ID
        pocket_id: Pocket ID
        amount: Transaction amount
        transaction_type: Type of transaction
        counterparty_name: Merchant/counterparty name
        tax_detected: Whether tax relief applies
        tax_category: Tax category if applicable
        warning_triggered: Whether warning was triggered
        db: Optional database session. If None, creates new session.
    Returns: Transaction ID if successful, None otherwise
    """
    try:
        supabase = db or _get_supabase_client()
        transaction_id = str(uuid_lib.uuid4())

        payload = {
            "transaction_id": transaction_id,
            "user_id": str(user_id),
            "pocket_id": str(pocket_id),
            "amount": amount,
            "transaction_type": transaction_type,
            "counterparty_name": counterparty_name,
            "status": "completed",
            "is_tax_relief_detected": tax_detected,
            "tax_relief_category": tax_category,
            "triggers_warning": warning_triggered,
            "transaction_time": datetime.utcnow().isoformat(),
        }

        response = supabase.table("transactions").insert(payload).execute()
        if response.data:
            return transaction_id
        return None

    except Exception as e:
        print(f"Error saving transaction: {e}")
        return None

def get_user_notifications(user_id: str, db=None):
    try:
        supabase = db if db is not None else _get_supabase_client()
        
        response = (
            supabase.table("notifications")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []
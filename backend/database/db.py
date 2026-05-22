"""Database connection and query functions."""

from datetime import date, datetime, timedelta, timezone
import os
import uuid as uuid_lib

from supabase import create_client, Client

# ===== SUPABASE SETUP =====
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
_SUPABASE_CLIENT: Client | None = None
_MYT = timezone(timedelta(hours=8))


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


def _is_inflow_transaction(transaction_type: str | None) -> bool:
    """Best-effort direction detection for signed amounts."""
    if not transaction_type:
        return False

    normalized = transaction_type.strip().lower()
    inflow_markers = (
        "income",
        "credit",
        "deposit",
        "refund",
        "salary",
        "bonus",
        "topup",
        "top_up",
        "received",
        "receive",
    )
    return any(marker in normalized for marker in inflow_markers)


def _myt_now() -> datetime:
    """Current Kuala Lumpur time (UTC+08:00)."""
    return datetime.now(_MYT)


def sync_daily_total_spend(
    user_id: str,
    *,
    spend_date: date | None = None,
    daily_limit: float | None = None,
    db=None,
) -> dict | None:
    """
    Rebuild a user's daily spending aggregate from transactions and persist it
    into daily_total_spends for a given date.
    """
    try:
        supabase = db or _get_supabase_client()
        target_date = spend_date or _myt_now().date()

        day_start = datetime.combine(target_date, datetime.min.time(), tzinfo=_MYT)
        next_day_start = day_start + timedelta(days=1)

        tx_res = (
            supabase.table("transactions")
            .select("amount, transaction_type")
            .eq("user_id", str(user_id))
            .gte("transaction_time", day_start.isoformat())
            .lt("transaction_time", next_day_start.isoformat())
            .execute()
        )

        transactions = tx_res.data or []
        total_spent = sum(
            float(tx.get("amount") or 0)
            for tx in transactions
            if not _is_inflow_transaction(tx.get("transaction_type"))
        )

        existing_res = (
            supabase.table("daily_total_spends")
            .select("spend_id, today_daily_limit")
            .eq("user_id", str(user_id))
            .eq("date", target_date.isoformat())
            .limit(1)
            .execute()
        )

        existing_row = existing_res.data[0] if existing_res.data else None
        persisted_daily_limit = (
            float(daily_limit)
            if daily_limit is not None
            else float((existing_row or {}).get("today_daily_limit") or 0)
        )

        payload = {
            "today_total_spend": round(total_spent, 2),
            "today_daily_limit": round(persisted_daily_limit, 2),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        if existing_row:
            response = (
                supabase.table("daily_total_spends")
                .update(payload)
                .eq("spend_id", existing_row["spend_id"])
                .execute()
            )
            row = response.data[0] if response.data else None
        else:
            response = (
                supabase.table("daily_total_spends")
                .insert(
                    {
                        "user_id": str(user_id),
                        "date": target_date.isoformat(),
                        **payload,
                    }
                )
                .execute()
            )
            row = response.data[0] if response.data else None

        if row:
            return {
                "date": row.get("date", target_date.isoformat()),
                "today_total_spend": float(row.get("today_total_spend") or 0),
                "today_daily_limit": float(row.get("today_daily_limit") or 0),
            }

        return {
            "date": target_date.isoformat(),
            "today_total_spend": round(total_spent, 2),
            "today_daily_limit": round(persisted_daily_limit, 2),
        }
    except Exception as e:
        print(f"Error syncing daily total spend: {e}")
        return None


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
                "reference, status, is_tax_relief_detected, tax_relief_category, "
                "triggers_warning, transaction_time, created_at"
            )
            .eq("user_id", str(user_id))
            .order("transaction_time", desc=True)
            .limit(limit)
            .execute()
        )

        transactions = response.data or []
        return [
            {
                "transaction_id": tx.get("transaction_id"),
                "amount": float(tx.get("amount") or 0),
                "counterparty_name": tx.get("counterparty_name"),
                "transaction_type": tx.get("transaction_type"),
                "tax_relief_detected": tx.get("is_tax_relief_detected"),
                "tax_category": tx.get("tax_relief_category"),
                "reference": tx.get("reference"),
                "status": tx.get("status"),
                "is_warning_triggered": tx.get("triggers_warning", False),
                "signed_amount": float(tx.get("amount") or 0) if _is_inflow_transaction(tx.get("transaction_type")) else -float(tx.get("amount") or 0),
                "transaction_time": tx.get("transaction_time"),
                "created_at": tx.get("created_at") or tx.get("transaction_time"),
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
                "pocket_id, pocket_name, pocket_type, current_pocket_balance, monthly_limit"
            )
            .eq("user_id", str(user_id).strip())
            .execute()
        )

        pockets = response.data or []
        return [
            {
                "pocket_id": p.get("pocket_id"),
                "pocket_name": p.get("pocket_name"),
                "pocket_type": p.get("pocket_type"),
                "monthly_limit": float(p.get("monthly_limit") or 0.0),
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
    Returns: Transaction ID if successful
    """
    supabase = db or _get_supabase_client()
    transaction_id = str(uuid_lib.uuid4())

    payload = {
            "transaction_id": transaction_id,
            "user_id": str(user_id),
            "pocket_id": str(pocket_id),
            "amount": amount,
            "transaction_type": transaction_type.upper(),
            "counterparty_name": counterparty_name,
            "is_tax_relief_detected": tax_detected,
            "tax_relief_category": tax_category,
            "triggers_warning": warning_triggered,
            "transaction_time": _myt_now().isoformat(),
            "status": "SUCCESS",
    }

    response = supabase.table("transactions").insert(payload).execute()
    if response.data:
        return transaction_id
    
    # If no data but no exception, it might be a silent failure or empty result
    raise Exception(f"Supabase insert failed: {response}")

def deduct_from_pocket(pocket_id: str, amount: float, db=None) -> bool:
    """
    Deducts an amount from a pocket's balance safely.
    Returns True if successful, False if pocket not found or insufficient funds.
    """
    try:
        supabase = db or _get_supabase_client()
        
        # 1. Fetch current balance
        res = supabase.table("pockets").select("current_pocket_balance").eq("pocket_id", str(pocket_id)).execute()
        if not res.data:
            print(f"Deduct failed: Pocket {pocket_id} not found")
            return False
            
        current_bal = float(res.data[0].get("current_pocket_balance") or 0.0)
        
        # 2. Check for sufficient funds
        if current_bal < amount:
            print(f"Deduct failed: Insufficient funds in pocket {pocket_id}. Available: {current_bal}, Required: {amount}")
            return False
        
        # 3. Update balance
        new_bal = current_bal - amount
        
        upd_res = supabase.table("pockets").update({"current_pocket_balance": new_bal}).eq("pocket_id", str(pocket_id)).execute()
        return len(upd_res.data) > 0
    except Exception as e:
        print(f"Error deducting from pocket: {e}")
        return False

def add_to_pocket(pocket_id: str, amount: float, db=None) -> bool:
    """
    Adds an amount to a pocket's balance safely.
    """
    try:
        supabase = db or _get_supabase_client()
        
        # 1. Fetch current balance
        res = supabase.table("pockets").select("current_pocket_balance").eq("pocket_id", str(pocket_id)).execute()
        if not res.data:
            return False
            
        current_bal = float(res.data[0].get("current_pocket_balance") or 0.0)
        
        # 2. Update balance
        new_bal = current_bal + amount
        
        upd_res = supabase.table("pockets").update({"current_pocket_balance": new_bal}).eq("pocket_id", str(pocket_id)).execute()
        return len(upd_res.data) > 0
    except Exception as e:
        print(f"Error adding to pocket: {e}")
        return False

def update_user_salary(user_id: str, monthly_income: float, db=None) -> bool:
    """
    Updates the monthly_income for a user in the database.
    """
    try:
        supabase = db or _get_supabase_client()
        response = (
            supabase.table("users")
            .update({"monthly_income": monthly_income})
            .eq("user_id", str(user_id))
            .select("user_id, monthly_income")
            .execute()
        )
        return len(response.data) > 0
    except Exception as e:
        print(f"Error updating user salary: {e}")
        return False


def update_user_onboarding_data(user_id: str, monthly_income: float, savings_mode: str, db=None) -> bool:
    """
    Updates the monthly_income, savings_mode, and resets created_at for a user during onboarding.
    """
    try:
        supabase = db or _get_supabase_client()
        # Ensure savings_mode is full UPPERCASE for DB matching
        formatted_mode = savings_mode.upper() if savings_mode else "BALANCED"
        
        # Reset created_at to NOW so onboarding acts as Day 1 of the month
        now_iso = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")
        
        print(f"DEBUG: STARTING FULL UPDATE for user {user_id}")
        print(f"DEBUG: Values -> income: {monthly_income}, mode: {formatted_mode}, date: {now_iso}")
        
        update_payload = {
            "monthly_income": monthly_income,
            "savings_mode": formatted_mode,
            "created_at": now_iso,
            "updated_at": now_iso
        }
        
        response = (
            supabase.table("users")
            .update(update_payload)
            .eq("user_id", str(user_id))
            .select()
            .execute()
        )
        
        if response.data:
            print(f"DEBUG: Full update successful! Verified DB state: {response.data[0]}")
            return True
        else:
            print(f"DEBUG: Full update failed - no matching user found for ID {user_id}")
            return False
            
    except Exception as e:
        print(f"DEBUG: Full update CRASHED with error: {str(e)}")
        # Try a simpler fallback to at least save the income
        try:
            print("DEBUG: Executing fallback update (income only)...")
            response = (
                supabase.table("users")
                .update({"monthly_income": monthly_income})
                .eq("user_id", str(user_id))
                .select()
                .execute()
            )
            return len(response.data) > 0
        except Exception as e2:
            print(f"DEBUG: Fallback also failed: {str(e2)}")
            return False


def initialize_user_pockets(user_id: str, fixed_pockets: dict, variable_pockets: dict, db=None) -> bool:
    """
    Initializes user pockets in the database during onboarding.
    Deletes existing pockets for the user to ensure a clean start.
    """
    try:
        supabase = db or _get_supabase_client()
        
        # 1. Clean up existing pockets for this user
        supabase.table("pockets").delete().eq("user_id", str(user_id)).execute()
        
        pocket_payloads = []
        
        # 2. Prepare Fixed Pockets
        for name, amount in fixed_pockets.items():
            pocket_payloads.append({
                "user_id": str(user_id),
                "pocket_name": name,
                "pocket_type": "FIXED",
                "current_pocket_balance": float(amount),
                "monthly_limit": float(amount)
            })
            
        # 3. Prepare Variable Pockets
        for name, amount in variable_pockets.items():
            # If name is 'Savings', force it to be a FIXED pocket as requested
            is_savings = name.lower() == "savings"
            
            pocket_payloads.append({
                "user_id": str(user_id),
                "pocket_name": name,
                "pocket_type": "FIXED" if is_savings else "VARIABLE",
                "current_pocket_balance": float(amount),
                "monthly_limit": float(amount)
            })
            
        # 4. Batch insert all pockets
        if pocket_payloads:
            response = supabase.table("pockets").insert(pocket_payloads).execute()
            return len(response.data) > 0
        
        return True
    except Exception as e:
        print(f"Error initializing user pockets: {e}")
        return False


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


def create_notification(user_id: str, title: str, message: str, notification_type: str, db=None) -> str | None:
    """
    Create a new notification for a user
    
    Args:
        user_id: User ID to create notification for
        title: Notification title
        message: Notification message/content
        notification_type: Type of notification (e.g., "anomaly_warning", "tax_relief_available")
        db: Optional database session. If None, creates new session.
    
    Returns: Notification ID if successful, None otherwise
    """
    try:
        supabase = db if db is not None else _get_supabase_client()
        notification_id = str(uuid_lib.uuid4())
        
        payload = {
            "notification_id": notification_id,
            "user_id": str(user_id),
            "title": title,
            "message": message,
            "notification_type": notification_type,
            "is_read": False,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        response = supabase.table("notifications").insert(payload).execute()
        if response.data:
            return notification_id
        return None
        
    except Exception as e:
        print(f"Error creating notification: {e}")
        return None

def get_user_claims(user_id: str, db=None):
    results = []
    try:
        supabase = db or _get_supabase_client()
        response = (
            supabase.table("lhdn_claims")
            .select("*, transactions(amount, tax_relief_category)")
            .eq("user_id", str(user_id))
            .order("receipt_date", desc=True)
            .execute()
        )
        claims = response.data or []
        
        print(f"DEBUG: Found {len(claims)} raw claim records in DB")

        for c in claims:
            tx = c.get("transactions")
            
            if tx is None:
                print(f"DEBUG: Claim {c.get('claim_id')} has NO joined transaction data (null)")
            else:
                print(f"DEBUG: Claim {c.get('claim_id')} join found: {tx}")

            amount = 0.0
            category = "Unknown"
            
            if isinstance(tx, dict):
                amount = float(tx.get("amount", 0) or 0)
                category = tx.get("tax_relief_category") or "Unknown"
            elif isinstance(tx, list) and len(tx) > 0:
                # Handle cases where Supabase might return a list for a 1-to-1 join
                tx_obj = tx[0]
                amount = float(tx_obj.get("amount", 0) or 0)
                category = tx_obj.get("tax_relief_category") or "Unknown"
                print(f"DEBUG: Joined data was a list, using first element.")

            results.append({
                "claim_id": c.get("claim_id"),
                "user_id": c.get("user_id"),
                "transaction_id": c.get("transaction_id"),
                "receipt_image_url": c.get("receipt_image_url"),
                "receipt_date": c.get("receipt_date"),
                "amount": amount,
                "tax_relief_category": category,
                "tax_category": category,
            })

    except Exception as e:
        print(f"Error fetching claims: {e}")
    
    return results
    

def create_user_pocket(user_id: str, pocket_name: str, pocket_type: str, monthly_limit: float = 0.0, db=None) -> dict | None:
    """Creates a new financial pocket bucket in the database."""
    try:
        supabase = db or _get_supabase_client()
        payload = {
            "user_id": str(user_id),
            "pocket_name": pocket_name,
            "pocket_type": pocket_type, # 'fixed' or 'variable'
            "current_pocket_balance": 0.0,
        }
        # Assuming table properties include monthly_limit if you wish to store it, 
        # or it safely defaults via schema constraints.
        response = supabase.table("pockets").insert(payload).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error creating pocket: {e}")
        return None


def update_user_pocket(pocket_id: str, pocket_name: str = None, monthly_limit: float = None, db=None) -> dict | None:
    """Updates fields inside an isolated pocket bucket."""
    try:
        supabase = db or _get_supabase_client()
        payload = {}
        if pocket_name is not None:
            payload["pocket_name"] = pocket_name
        if monthly_limit is not None:
            payload["monthly_limit"] = monthly_limit

        if not payload:
            return None

        response = supabase.table("pockets").update(payload).eq("pocket_id", str(pocket_id)).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error updating pocket: {e}")
        return None


def delete_user_pocket(pocket_id: str, db=None) -> bool:
    """Removes a pocket structure from the database."""
    try:
        supabase = db or _get_supabase_client()
        response = supabase.table("pockets").delete().eq("pocket_id", str(pocket_id)).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Error deleting pocket: {e}")
        return False


def execute_pocket_transfer(user_id: str, source_id: str, dest_id: str, amount: float, db=None) -> str | None:
    """
    Executes a balance transfer between two separate financial buckets safely.
    """
    try:
        supabase = db or _get_supabase_client()
        
        # 1. Fetch current metrics using normal execution (returns a list)
        src_res = supabase.table("pockets").select("current_pocket_balance").eq("pocket_id", str(source_id)).execute()
        dest_res = supabase.table("pockets").select("current_pocket_balance").eq("pocket_id", str(dest_id)).execute()
        
        # Verify that data arrays actually populated matching record rows
        if not src_res.data or not dest_res.data:
            print("Transfer Failed: Source or Destination pocket ID could not be found.")
            return None
            
        # Safely extract dictionary entries from the data lists
        src_pocket = src_res.data[0]
        box_pocket = dest_res.data[0]
        
        # Convert balance metrics into float types safely
        src_bal = float(src_pocket.get("current_pocket_balance") or 0.0)
        dest_bal = float(box_pocket.get("current_pocket_balance") or 0.0)
        
        if src_bal < amount:
            print(f"Transfer Rejected: Insufficient balance. Available: {src_bal}, Required: {amount}")
            return None # Insufficient funds
            
        # 2. Mutate pocket table state records
        supabase.table("pockets").update({"current_pocket_balance": src_bal - amount}).eq("pocket_id", str(source_id)).execute()
        supabase.table("pockets").update({"current_pocket_balance": dest_bal + amount}).eq("pocket_id", str(dest_id)).execute()
        
        # 3. Insert transaction log audit with safe logging fallbacks
        try:
            transfer_payload = {
                "user_id": str(user_id),
                "source_pocket_id": str(source_id),
                "destination_pocket_id": str(dest_id),
                "amount": amount,
                "status": "SUCCESS"
            }
            log_res = supabase.table("pocket_transfers").insert(transfer_payload).execute()
            
            if log_res.data and "transfer_id" in log_res.data[0]:
                return str(log_res.data[0]["transfer_id"])
        except Exception as table_err:
            # If the audit table doesn't exist yet, don't let it crash your app logic!
            print(f"Audit Log Bypass Notice (Table may be missing or locked): {table_err}")
            
        # Return a fallback string identifier so the endpoint endpoint passes successfully
        return "transfer-completed-successfully"

    except Exception as e:
        print(f"Error handling pocket transfer operation: {e}")
        return None
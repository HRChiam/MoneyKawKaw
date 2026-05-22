# main.py
# API routes to fetch and read data from db and call AI/ML service
from fastapi import FastAPI, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Import Database module
from database import (
    get_db,
    get_user_profile,
    get_user_transactions,
    get_user_notifications,
    get_user_claims,
    UserProfileResponse,
    TransactionResponse,
    TransactionListResponse,
    TransactionResponse,
    TransactionRequest,
    NotificationResponse, 
    ClaimResponse, 
    get_user_pockets,
    save_transaction,
    deduct_from_pocket,
    create_user_pocket,
    update_user_pocket,
    delete_user_pocket,
    execute_pocket_transfer,
    save_transaction,
    create_notification,
    update_user_salary,
    SalaryUpdateRequest,
    update_user_onboarding_data,
    initialize_user_pockets,
    add_to_pocket,
    sync_daily_total_spend,
)
from typing import Dict, List, Optional
from service_module.onboarding_math import calculate_cold_start_budget
from AI.onboarding_AI import reality_check_budget
from service_module.daily_limit_calculation import calculate_daily_limit
from service_module.spending_forecast import allocate_monthly_budget
from service_module.lifestyle_limit_update import process_lifestyle_limit_update
from AI.onboarding_AI import reality_check_budget
from AI.salary_router_AI import explain_monthly_allocation, refine_forecast_with_ai
from service_module.burn_rate_math import predict_deficit_risk
from service_module.check_for_anomaly import check_for_anomaly
from service_module.daily_limit_calculation import calculate_daily_limit
from AI.salary_router_AI import explain_monthly_allocation
from AI.risk_predictor_AI import generate_momentum_warning
from AI.anomaly_detection_AI import generate_anomaly_interception
from AI.debt_routing_AI import generate_debt_advice
from AI.tax_exemption_AI import get_tax_category
from datetime import date, datetime, timedelta, timezone
import pandas as pd

app = FastAPI(title="MoneyKawKaw API", version="1.0.0")
MYT = timezone(timedelta(hours=8))

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OnboardingRequest(BaseModel):
    user_id: str
    monthly_income: float
    fixed_expenses: Dict[str, float]
    savings_mode: str

class SalaryRouterRequest(BaseModel):
    monthly_income: float
    savings_mode: str
    target_month: int
    fixed_expenses_total: float
    user_pockets_data: List[Dict]
    past_spending_summary: Dict # Summary for AI explanation

class RiskPredictorRequest(BaseModel):
    monthly_income: float
    variable_balance: float
    days_left: int
    daily_spend_avg: float

class AnomalyCheckRequest(BaseModel):
    amount: float
    merchant: str
    monthly_income: float
    avg_category_spend: float

class DebtRoutingRequest(BaseModel):
    surplus: float
    liabilities: List[Dict]

class RebalancingRequest(BaseModel):
    overspent_category: str
    amount_needed: float
    source_category: str
    source_balance: float

class Transaction(BaseModel):
    merchant: str
    amount: float
    reference: str | None = None

class TaxExemptionRequest(BaseModel):
    transactions: List[Transaction]

class RecordTransactionRequest(BaseModel):
    """Request model for recording a new transaction"""
    user_id: str
    pocket_id: str
    amount: float
    transaction_type: str  # e.g., "expense", "income", "transfer"
    counterparty_name: str  # merchant/vendor name
    reference: str | None = None
    confirm_anomaly: bool = False

class CreatePocketRequest(BaseModel):
    pocket_name: str
    pocket_type: str # "fixed" | "variable"
    monthly_limit: Optional[float] = 0.0

class UpdatePocketRequest(BaseModel):
    pocket_name: Optional[str] = None
    monthly_limit: Optional[float] = None

class TransferFundsRequest(BaseModel):
    user_id: str
    source_pocket_id: str
    destination_pocket_id: str
    amount: float
    
@app.get("/api/user/{user_id}", response_model=UserProfileResponse)
async def get_user(user_id: str, db = Depends(get_db)):
    """
    Fetch user profile information from database
    
    Example flow:
    1. Frontend sends: GET /api/user/123e4567-e89b-12d3-a456-426614174000
    2. FastAPI provides db session via Depends(get_db)
    3. get_user_profile() queries users table using the session
    4. Returns user data to frontend
    """
    try:
        # Reuse FastAPI's db session
        user_profile = get_user_profile(user_id, db=db)
        
        if not user_profile:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user_profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}/transactions", response_model=TransactionListResponse)
async def get_transaction_history(user_id: str, limit: int = Query(30, ge=1, le=100), db = Depends(get_db)):
    """Fetch recent transaction history for a user."""
    try:
        user_profile = get_user_profile(user_id, db=db)
        if not user_profile:
            raise HTTPException(status_code=404, detail="User not found")

        transactions = get_user_transactions(user_id, limit=limit, db=db)
        return {
            "transactions": transactions,
            "count": len(transactions),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/onboarding")
def process_onboarding(req: OnboardingRequest, db = Depends(get_db)):
    print(f"DEBUG: ONBOARDING DATA RECEIVED -> income: {req.monthly_income}, mode: {req.savings_mode}, expenses: {req.fixed_expenses}")
    # 0. Update User Profile in Database
    db_update_success = update_user_onboarding_data(
        req.user_id,
        req.monthly_income,
        req.savings_mode,
        db=db
    )
    print(f"DEBUG: Database update success: {db_update_success}")

    # 1. LAYER 1: The Math Engine Baseline
    math_plan = calculate_cold_start_budget(
        req.monthly_income, 
        req.fixed_expenses, 
        req.savings_mode
    )
    
    if "error" in math_plan:
        return {"status": "failed", "message": math_plan["error"]}
        
    # 2. LAYER 3: The AI Reality Check
    ai_adjusted_pockets = reality_check_budget(
        income=req.monthly_income,
        fixed_total=math_plan["total_fixed_expenses"],
        disposable=math_plan["disposable_income"],
        mode=req.savings_mode,
        math_baseline=math_plan["variable_pockets"]
    )
    
    # 3. LAYER 1: The Absolute Math Enforcement (Never trust LLM math blindly!)
    # We force the AI's numbers to scale exactly to the disposable income.
    ai_total = sum(ai_adjusted_pockets.values())
    final_pockets = {}
    
    # Use categories from math_baseline to ensure we have all required keys
    expected_categories = math_plan["variable_pockets"].keys()
    
    for category in expected_categories:
        # If AI missed a category, fall back to 0 for scaling
        amount = ai_adjusted_pockets.get(category, 0)
        proportion = amount / ai_total if ai_total > 0 else 0
        final_pockets[category] = round(math_plan["disposable_income"] * proportion, 2)
    
    # Handle rounding cents to ensure perfect zero-sum
    final_total = sum(final_pockets.values())
    diff = round(math_plan["disposable_income"] - final_total, 2)
    if diff != 0:
        # Default to 0 if Savings is somehow missing, though it should be in expected_categories
        final_pockets["Savings"] = round(final_pockets.get("Savings", 0) + diff, 2)

    # 4. Calculate Initial Daily Limit (Spendable balance = All variable pockets except Savings)
    spendable_balance = sum(v for k, v in final_pockets.items() if k != "Savings")
    today = datetime.now()
    initial_daily_limit = calculate_daily_limit(spendable_balance, mock_today=today, onboarding_date=today)

    # 5. Initialize Pockets in Database
    pocket_init_success = initialize_user_pockets(
        req.user_id,
        req.fixed_expenses,
        final_pockets,
        db=db
    )
    print(f"DEBUG: Pockets initialization success: {pocket_init_success}")

    # 6. TRIGGER LIFESTYLE LIMIT UPDATE (AI Forecast & Notification)
    # This runs after pockets are initialized so it has current data to work with.
    try:
        process_lifestyle_limit_update(req.user_id, db=db)
    except Exception as e:
        print(f"Warning: Lifestyle limit update failed: {e}")

    return {
        "status": "success",
        "daily_limit": initial_daily_limit,
        "database_payload": {
            "fixed_pockets": req.fixed_expenses,
            "variable_pockets": final_pockets
        }
    }

@app.post("/api/salary-router")
def route_salary(req: SalaryRouterRequest):
    # 1. LAYER 1: The Math Engine (ML + Normalization)
    math_allocations = allocate_monthly_budget(
        req.monthly_income,
        req.savings_mode,
        req.target_month,
        req.fixed_expenses_total,
        req.user_pockets_data
    )

    if isinstance(math_allocations, str):
        return {"status": "failed", "message": math_allocations}

    # 2. LAYER 3: The AI Explanation
    ai_explanation = explain_monthly_allocation(
        req.monthly_income,
        req.past_spending_summary,
        math_allocations["pocket_allocations"]
    )

    return {
        "status": "success",
        "ai_explanation": ai_explanation,
        "allocations": math_allocations
    }

@app.post("/api/predict-risk")
def check_risk(req: RiskPredictorRequest):
    # 1. LAYER 1: The Math Engine (Classification + Shortfall Calculation)
    is_at_risk, shortfall, probability = predict_deficit_risk(
        req.monthly_income,
        req.variable_balance,
        req.days_left,
        req.daily_spend_avg
    )

    # 2. LAYER 3: The AI Momentum Warning (Only if at risk)
    ai_warning = None
    if is_at_risk:
        ai_warning = generate_momentum_warning(
            req.category,
            days_over=3, # Mocked for now, would come from DB
            predicted_shortfall=shortfall
        )

    return {
        "status": "success",
        "is_at_risk": is_at_risk,
        "shortfall": shortfall,
        "risk_probability": probability,
        "ai_warning": ai_warning
    }

# @app.post("/api/check-anomaly")
# def check_transaction_anomaly(req: AnomalyCheckRequest):
#     # 1. LAYER 1: The Math Engine (Outlier Detection)
#     is_anomaly = check_for_anomaly(
#         req.amount,
#         req.monthly_income,
#         req.avg_category_spend
#     )

#     # 2. LAYER 3: The AI Interception Message (Only if anomaly)
#     ai_interception = None
#     if is_anomaly:
#         ai_interception = generate_anomaly_interception(
#             req.amount,
#             req.merchant
#         )

#     return {
#         "status": "success",
#         "is_anomaly": is_anomaly,
#         "ai_interception": ai_interception
#     }

@app.post("/api/transaction")
def create_transaction(req: RecordTransactionRequest, background_tasks: BackgroundTasks, db = Depends(get_db)):
    """
    Record a transaction (Requires AI feature: Anomaly detection & Tax relief detection)
    
    Flow:
    1. SAVE TRANSACTION IMMEDIATELY (blocking) - app gets instant confirmation
    2. RETURN RESPONSE (non-blocking) - user continues with app
    3. RUN AI + CREATE NOTIFICATIONS IN BACKGROUND - only creates notifications
    
    This ensures transaction is recorded in DB first, then AI analysis
    runs asynchronously without blocking app operations.
    """
    try:
        # 1. Validate user exists
        user_profile = get_user_profile(req.user_id, db=db)
        if not user_profile:
            raise HTTPException(status_code=404, detail="User not found")

        # 2. Check for anomalies before any write unless the user has already confirmed.
        if not req.confirm_anomaly:
            avg_category_spend = 50.0  # TODO: Calculate from user's transaction history
            is_anomaly = check_for_anomaly(
                req.amount,
                user_profile["monthly_income"],
                avg_category_spend,
            )

            if is_anomaly:
                message = (
                    f"We paused this transaction because we know your account balance. "
                    "You so broke, you sure you wanna proceed ah?"
                )
                raise HTTPException(status_code=409, detail=message)

        # 3. Deduct or Add to pocket balance FIRST (Validation)
        balance_updated = False
        if req.transaction_type.upper() == 'EXPENSE':
            balance_updated = deduct_from_pocket(
                pocket_id=req.pocket_id,
                amount=req.amount,
                db=db
            )
            if not balance_updated:
                raise HTTPException(status_code=400, detail="Insufficient funds in pocket or pocket not found")
        elif req.transaction_type.upper() == 'INCOME':
            balance_updated = add_to_pocket(
                pocket_id=req.pocket_id,
                amount=req.amount,
                db=db
            )
        
        # 4. IMMEDIATE: Save transaction to database (blocking, returns to app)
        transaction_id = save_transaction(
            user_id=req.user_id,
            pocket_id=req.pocket_id,
            amount=req.amount,
            transaction_type=req.transaction_type.upper(),
            counterparty_name=req.counterparty_name,
            tax_detected=False,  # Will be updated by background task
            tax_category=None,   # Will be updated by background task
            warning_triggered=False,  # Will be updated by background task
            db=db
        )
        
        if not transaction_id:
            raise HTTPException(status_code=500, detail="Failed to save transaction to database")

        # Keep the daily aggregate table in sync with today's transaction rows.
        sync_daily_total_spend(
            user_id=req.user_id,
            spend_date=datetime.now(MYT).date(),
            db=db,
        )
        
        # 5. Return immediate response to app (transaction recorded)
        response = {
            "transaction_id": transaction_id,
            "amount": req.amount,
            "counterparty_name": req.counterparty_name,
            "transaction_type": req.transaction_type,
            "tax_relief_detected": False,  # Default until AI runs
            "tax_category": None,  # Default until AI runs
            "reference": req.reference,
            "status": "completed",
            "is_warning_triggered": False,  # Default until AI runs
            "signed_amount": req.amount if "income" in req.transaction_type.lower() else -req.amount,
            "transaction_time": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow().isoformat(),
        }
        
        print(f"DEBUG: Transaction recorded - ID: {transaction_id}")
        
        # 6. BACKGROUND (fire-and-forget): Run tax relief detection asynchronously
        background_tasks.add_task(
            run_tax_relief_detection,
            transaction_id=transaction_id,
            user_id=req.user_id,
            counterparty_name=req.counterparty_name,
            amount=req.amount,
            reference=req.reference
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error recording transaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def run_anomaly_detection(transaction_id: str, user_id: str, amount: float, 
                          counterparty_name: str, monthly_income: float):
    """
    Background task: Run anomaly detection on transaction
    
    This runs asynchronously after transaction is saved to DB.
    Creates notification if anomaly is detected.
    """
    try:
        print(f"DEBUG: Starting anomaly detection for transaction {transaction_id}")
        
        # Get average spend for the category (for anomaly detection)
        avg_category_spend = 50.0  # TODO: Calculate from user's transaction history
        
        # LAYER 1: Math Engine - Check for anomalies
        is_anomaly = check_for_anomaly(
            amount,
            monthly_income,
            avg_category_spend
        )
        
        # LAYER 3: AI Interception (Only if anomaly detected)
        if is_anomaly:
            message = (
                f"Attempted charge of RM{amount:.2f} at {counterparty_name}. "
                "We paused this transaction because we know your account balance. "
                "You so broke, you sure you wanna proceed ah?"
            )
            # create_notification(
            #     user_id=user_id,
            #     title="Unusual Spending Detected",
            #     message=message,
            #     notification_type="anomaly_detection"
            # )
            print(f"DEBUG: Anomaly detected for transaction {transaction_id}: {message}")
        else:
            print(f"DEBUG: No anomaly detected for transaction {transaction_id}")
        
    except Exception as e:
        print(f"Error in anomaly detection for transaction {transaction_id}: {e}")


def run_tax_relief_detection(transaction_id: str, user_id: str, counterparty_name: str, 
                            amount: float, reference: str | None):
    """
    Background task: Run tax relief detection on transaction
    
    This runs asynchronously after transaction is saved to DB.
    Updates transaction with tax relief info and creates notification if detected.
    Same logic as /api/check-tax endpoint.
    """
    try:
        print(f"DEBUG: Starting tax relief detection for transaction {transaction_id}")
        
        # LAYER 3: AI Tax Relief Detection
        try:
            tax_category = get_tax_category(
                counterparty_name,
                amount,
                reference
            )
            print(f"DEBUG: Tax category for transaction {transaction_id}: {tax_category}")
            is_claimable = tax_category != "N/A"
            
            # Update transaction record with tax information (same as /api/check-tax)
            if is_claimable:
                from database import get_db as get_db_client
                # Create fresh db connection for background task
                db = next(get_db_client())
                supabase = db
                
                try:
                    supabase.table("transactions") \
                        .update({
                            "is_tax_relief_detected": True,
                            "tax_relief_category": tax_category
                        }) \
                        .eq("transaction_id", transaction_id) \
                        .execute()
                    
                    print(f"DEBUG: Tax relief detected for transaction {transaction_id}: {tax_category}")
                except Exception as db_err:
                    print(f"Error updating database for transaction {transaction_id}: {db_err}")
            else:
                print(f"DEBUG: No tax relief eligible for transaction {transaction_id}")
        except Exception as e:
            print(f"Warning: Tax check failed for transaction {transaction_id}: {e}")
        
    except Exception as e:
        print(f"Error in tax relief detection for transaction {transaction_id}: {e}")



@app.post("/api/debt-routing")
def get_debt_routing_advice(req: DebtRoutingRequest):
    # LAYER 3: The AI Debt Strategist
    ai_advice = generate_debt_advice(
        req.surplus,
        req.liabilities
    )

    return {
        "status": "success",
        "ai_advice": ai_advice
    }

# @app.post("/api/check-tax")
# def check_tax_eligibility(req: TaxExemptionRequest, db = Depends(get_db)):
#     supabase = db
#     results = []
    
#     for tx in req.transactions:
#         reference = tx.reference
#         category = get_tax_category(tx.merchant, tx.amount, reference)
#         is_claimable = category != "N/A"
        
#         if is_claimable:
#             try:
#                 supabase.table("transactions") \
#                     .update({
#                         "is_tax_relief_detected": True,
#                         "tax_relief_category": category
#                     }) \
#                     .eq("reference", reference) \
#                     .execute()
#             except Exception as e:
#                 print(f"Error updating database for reference {reference}: {e}")

#         results.append({
#             "merchant": tx.merchant,
#             "amount": tx.amount,
#             "reference": reference,
#             "tax_category": category,
#             "is_tax_claimable": is_claimable
#         })

#     return {
#         "status": "success",
#         "results": results
#     }



@app.get("/api/notifications/{user_id}", response_model=List[NotificationResponse])
async def get_notifications(user_id: str, db = Depends(get_db)):
    notifications = get_user_notifications(user_id, db=db)
    return notifications

@app.get("/api/claims/{user_id}", response_model=List[ClaimResponse])
async def get_claims(user_id: str, db = Depends(get_db)):
    print(f"DEBUG: Received request for claims of user: {user_id}")
    claims = get_user_claims(user_id, db=db)
    print(f"DEBUG: Returning {len(claims)} claims")
    return claims

@app.get("/api/users/{user_id}/pockets")
def list_pockets(user_id: str, db = Depends(get_db)):
    """Retrieves all pockets tied to a user."""
    pockets = get_user_pockets(user_id, db=db)
    return {"pockets": pockets, "count": len(pockets)}

@app.get("/api/user/{user_id}/lifestyle-forecast")
def get_lifestyle_forecast(user_id: str, db = Depends(get_db)):
    """
    Returns AI-suggested pocket allocations based on latest income and trends.
    """
    try:
        user = get_user_profile(user_id, db=db)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        pockets = get_user_pockets(user_id, db=db)
        
        user_pockets_data = []
        fixed_expenses_total = 0.0
        
        for p in pockets:
            if p['pocket_type'].upper() == 'FIXED' and p['pocket_name'].lower() != 'savings':
                fixed_expenses_total += float(p.get('monthly_limit') or 0.0)
            
            user_pockets_data.append({
                'pocket_id': p['pocket_id'],
                'pocket_name': p['pocket_name'],
                'parent_category': p['pocket_name'],
                'created_at': user['created_at'][:10] if user['created_at'] else datetime.now().strftime('%Y-%m-%d'),
                'previous_limit': float(p.get('monthly_limit') or 0.0)
            })
            
        target_month = datetime.now().month
        forecast_results = allocate_monthly_budget(
            user_income=user['monthly_income'],
            savings_mode=user['savings_mode'],
            target_month=target_month,
            fixed_expenses_total=fixed_expenses_total,
            user_pockets_data=user_pockets_data
        )
        
        if isinstance(forecast_results, str):
            raise HTTPException(status_code=400, detail=forecast_results)
            
        # AI Refinement Layer (Zero-Sum check across ALL pockets)
        all_pockets_raw = {}
        # Build the full list for AI to see
        for p in pockets:
            if p['pocket_type'].upper() == 'FIXED' and p['pocket_name'].lower() != 'savings':
                all_pockets_raw[p['pocket_name']] = float(p.get('monthly_limit') or 0.0)
            elif p['pocket_name'].lower() == 'savings':
                all_pockets_raw[p['pocket_name']] = forecast_results['savings_locked']
            else:
                # Variable pocket
                amount = forecast_results['pocket_allocations'].get(p['pocket_id'], 0.0)
                all_pockets_raw[p['pocket_name']] = amount

        refined_pockets = refine_forecast_with_ai(
            income=user['monthly_income'],
            mode=user['savings_mode'],
            math_forecast=all_pockets_raw
        )

        # Map refined amounts back to pocket IDs
        name_to_pocket_id = {p['pocket_name']: p['pocket_id'] for p in user_pockets_data}
        final_pocket_allocations = {}
        final_savings_locked = refined_pockets.get('Savings', forecast_results['savings_locked'])

        for name, amount in refined_pockets.items():
            if name == 'Savings':
                continue
            if name in name_to_pocket_id:
                final_pocket_allocations[name_to_pocket_id[name]] = amount

        return {
            "discretionary_total": forecast_results['discretionary_total'],
            "savings_locked": final_savings_locked,
            "pocket_allocations": final_pocket_allocations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{user_id}/pockets")
def add_pocket(user_id: str, req: CreatePocketRequest, db = Depends(get_db)):
    if req.pocket_type not in ["FIXED", "VARIABLE", "fixed", "variable"]:
        raise HTTPException(status_code=400, detail="Invalid pocket type validation configuration")
        
    new_pocket = create_user_pocket(
        user_id=user_id,
        pocket_name=req.pocket_name,
        pocket_type=req.pocket_type.upper(),
        monthly_limit=req.monthly_limit,
        db=db
    )
    if not new_pocket:
        raise HTTPException(status_code=500, detail="Failed to instantiate user pocket architecture asset")
        
    return {
        "status": "success",
        "pocket_id": new_pocket["pocket_id"],
        "pocket": {
            "pocket_id": new_pocket["pocket_id"],
            "pocket_name": new_pocket["pocket_name"],
            "pocket_type": new_pocket["pocket_type"],
            "monthly_limit": req.monthly_limit,
            "current_balance": float(new_pocket["current_pocket_balance"])
        }
    }

@app.put("/api/pockets/{pocket_id}")
def rename_pocket(pocket_id: str, req: UpdatePocketRequest, db = Depends(get_db)):
    updated = update_user_pocket(
        pocket_id=pocket_id, 
        pocket_name=req.pocket_name, 
        monthly_limit=req.monthly_limit,
        db=db
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Target tracking pocket structural entity not found")
        
    return {
        "status": "success",
        "pocket": {
            "pocket_id": updated["pocket_id"],
            "pocket_name": updated["pocket_name"],
            "pocket_type": updated["pocket_type"],
            "current_balance": float(updated["current_pocket_balance"])
        }
    }

@app.delete("/api/pockets/{pocket_id}")
def remove_pocket(pocket_id: str, db = Depends(get_db)):
    # Note: Complex implementations handling balance migration logic can route balances 
    # to main account before removing record here.
    success = delete_user_pocket(pocket_id=pocket_id, db=db)
    if not success:
        raise HTTPException(status_code=404, detail="Target instance identifier invalid for active records")
    return {"status": "success", "message": "Pocket deleted"}

@app.post("/api/pocket-transfers")
def handle_pocket_transfer(req: TransferFundsRequest, db = Depends(get_db)):
    transfer_id = execute_pocket_transfer(
        user_id=req.user_id,
        source_id=req.source_pocket_id,
        dest_id=req.destination_pocket_id,
        amount=req.amount,
        db=db
    )
    if not transfer_id:
        raise HTTPException(status_code=400, detail="Transfer operation rejected. Check asset balance constraints.")
        
    return {"status": "success", "transfer_id": transfer_id, "message": "Transfer completed"}

@app.get("/api/users/{user_id}/daily-summary")
def get_daily_spending_summary(user_id: str, db = Depends(get_db)):
    """
    Computes a live, database-driven summary profile, pulling active variables
    and calculating the remaining dynamic daily allowance.
    """
    supabase = db
    
    # 1. Fetch strict user properties
    user_profile = get_user_profile(user_id, db=db)
    if not user_profile:
        raise HTTPException(status_code=404, detail="User account signature invalid")
        
    # 2. Extract variable pockets matching active user ID
    pockets_data = get_user_pockets(user_id, db=db)
    variable_sum = sum(
        float(p["current_balance"]) 
        for p in pockets_data 
        if p["pocket_type"].upper() == "VARIABLE"
    )
    
    # 3. Calculate dynamic live limit using the math module
    # We use the user's account creation date as the onboarding reference point
    created_at_str = user_profile.get("created_at")
    onboarding_date = None
    if created_at_str:
        # Created at is typically "2026-05-21T08:24:45.123+00:00"
        onboarding_date = pd.to_datetime(created_at_str)

    # For the hackathon, we keep today's "real" time as the reference
    today = datetime.now(MYT)
    computed_limit = calculate_daily_limit(
        variable_sum, 
        mock_today=today, 
        onboarding_date=onboarding_date
    )
    
    # 4. Recompute from today's transactions and persist to daily_total_spends.
    synced_summary = sync_daily_total_spend(
        user_id=user_id,
        spend_date=today.date(),
        daily_limit=computed_limit,
        db=db,
    )

    today_spent = float((synced_summary or {}).get("today_total_spend") or 0.0)
    persisted_limit = float((synced_summary or {}).get("today_daily_limit") or computed_limit)
    
    return {
        "username": user_profile["username"],
        "main_balance": float(user_profile["main_balance"]),
        "daily_limit": persisted_limit,
        "today_spent": today_spent,
        "current_streak": int(user_profile.get("streak") or user_profile.get("current_streak") or 0)
    }

@app.put("/api/user/{user_id}/salary")
async def update_salary(user_id: str, req: SalaryUpdateRequest, db = Depends(get_db)):
    """Update user's monthly income."""
    try:
        success = update_user_salary(user_id, req.monthly_income, db=db)
        if not success:
            raise HTTPException(status_code=404, detail="User not found or update failed")
        return {"status": "success", "message": "Salary updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
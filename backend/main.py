# main.py
# API routes to fetch and read data from db and call AI/ML service
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

# Import Database module
from database import (
    get_db,
    get_user_profile,
    get_user_notifications,
    UserProfileResponse,
    NotificationResponse
)
from typing import Dict, List
from service_module.onboarding_math import calculate_cold_start_budget
from AI.onboarding_AI import reality_check_budget
from service_module.daily_limit_calculation import calculate_daily_limit
from service_module.spending_forecast import allocate_monthly_budget
from service_module.burn_rate_math import predict_deficit_risk
from service_module.check_for_anomaly import check_for_anomaly
from AI.salary_router_AI import explain_monthly_allocation
from AI.risk_predictor_AI import generate_momentum_warning
from AI.anomaly_detection_AI import generate_anomaly_interception
from AI.debt_routing_AI import generate_debt_advice
from AI.consent_rebalancing_AI import generate_rebalancing_proposal
from AI.tax_exemption_AI import get_tax_category

app = FastAPI(title="MoneyKawKaw API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OnboardingRequest(BaseModel):
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

class TransactionRequest(BaseModel):
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

class TaxExemptionRequest(BaseModel):
    transactions: List[Dict] # List of {merchant, amount}

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
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/onboarding")
def process_onboarding(req: OnboardingRequest):
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
    initial_daily_limit = calculate_daily_limit(spendable_balance)

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

@app.post("/api/check-anomaly")
def check_transaction_anomaly(req: TransactionRequest):
    # 1. LAYER 1: The Math Engine (Outlier Detection)
    is_anomaly = check_for_anomaly(
        req.amount,
        req.monthly_income,
        req.avg_category_spend
    )

    # 2. LAYER 3: The AI Interception Message (Only if anomaly)
    ai_interception = None
    if is_anomaly:
        ai_interception = generate_anomaly_interception(
            req.amount,
            req.merchant
        )

    return {
        "status": "success",
        "is_anomaly": is_anomaly,
        "ai_interception": ai_interception
    }

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

@app.post("/api/consent-rebalancing")
def propose_rebalancing(req: RebalancingRequest):
    # LAYER 3: The AI Consensus AI
    ai_proposal = generate_rebalancing_proposal(
        req.overspent_category,
        req.amount_needed,
        req.source_category,
        req.source_balance
    )

    return {
        "status": "success",
        "ai_proposal": ai_proposal
    }

@app.post("/api/check-tax")
def check_tax_eligibility(req: TaxExemptionRequest):
    # LAYER 3: The AI Tax Expert
    results = []
    for tx in req.transactions:
        category = get_tax_category(tx["merchant"], tx["amount"])
        results.append({
            "merchant": tx["merchant"],
            "amount": tx["amount"],
            "tax_category": category,
            "is_tax_claimable": category != "N/A"
        })

    return {
        "status": "success",
        "results": results
    }



# Health check
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/api/notifications/{user_id}", response_model=List[NotificationResponse])
async def get_notifications(user_id: str, db = Depends(get_db)):
    notifications = get_user_notifications(user_id, db=db)
    return notifications
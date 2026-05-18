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
    UserProfileResponse
)

# Import Layer 1 & 2 (Math & ML)
from service_module.check_for_anomaly import check_for_anomaly
from service_module.burn_rate_math import predict_deficit_risk
from service_module.tax_exemption import tag_tax_exemptions_smart

# Import Layer 3 (GenAI)
from AI.ai_brain import generate_anomaly_interception, generate_momentum_warning

app = FastAPI(title="MoneyKawKaw API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# EXAMPLE: Fetch user profile from database
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


# EXISTING: Process transaction with ML/AI
class TransactionRequestOld(BaseModel):
    user_income: float
    user_avg_category_spend: float
    amount: float
    merchant: str
    category: str
    variable_balance: float
    days_left: int
    daily_spend_avg: float


@app.post("/api/transaction")
def process_transaction(req: TransactionRequestOld):
    """
    This endpoint runs every time the user buys something.
    It chains the ML models and GenAI seamlessly.
    """
    response_payload = {
        "status": "success",
        "tax_eligible": False,
        "ai_alert": None,
        "action_required": None
    }

    # 1. TAX CHECK (Layer 1 - Hybrid NLP)
    df_tx = pd.DataFrame([{'merchant': req.merchant, 'amount': req.amount}])
    tagged_tx = tag_tax_exemptions_smart(df_tx)
    if tagged_tx['tax_category'].iloc[0] != 'None':
        response_payload["tax_eligible"] = True

    # 2. ANOMALY CHECK (Layer 2 - ML)
    is_anomaly = check_for_anomaly(req.amount, req.user_income, req.user_avg_category_spend)
    if is_anomaly:
        response_payload["action_required"] = "USER_CONSENT_NEEDED"
        # Layer 3 - GenAI creates the human message
        response_payload["ai_alert"] = generate_anomaly_interception(req.amount, req.merchant)
        return response_payload # Halt the process, ask user!

    # 3. DEFICIT RISK CHECK (Layer 2 - ML)
    # We add the new transaction to their daily avg to check momentum
    new_daily_avg = req.daily_spend_avg + req.amount 
    is_at_risk, shortfall, prob = predict_deficit_risk(
        req.user_income, req.variable_balance, req.days_left, new_daily_avg
    )
    
    if is_at_risk and prob > 80.0:
        # Layer 3 - GenAI creates the warning
        response_payload["ai_alert"] = generate_momentum_warning(req.category, 3, shortfall)

    return response_payload


# Health check
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}
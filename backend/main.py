# main.py
from fastapi import FastAPI
from pydantic import BaseModel

# Import Layer 1 & 2 (Math & ML)
from service_module.check_for_anomaly import check_for_anomaly
from service_module.burn_rate_math import predict_deficit_risk
from service_module.tax_exemption import tag_tax_exemptions_smart
import pandas as pd

# Import Layer 3 (GenAI)
from AI.ai_brain import generate_anomaly_interception, generate_momentum_warning

app = FastAPI()

# Data validation model for the frontend request
class TransactionRequest(BaseModel):
    user_income: float
    user_avg_category_spend: float
    amount: float
    merchant: str
    category: str
    variable_balance: float
    days_left: int
    daily_spend_avg: float

@app.post("/api/transaction")
def process_transaction(req: TransactionRequest):
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
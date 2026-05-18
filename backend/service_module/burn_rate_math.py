import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parents[1] / 'Notebook' / 'risk_predictor_v2.pkl'
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
try:
    risk_model = joblib.load(MODEL_PATH)
except ModuleNotFoundError as e:
    missing = e.name if hasattr(e, 'name') else str(e)
    raise ModuleNotFoundError(
        f"{missing} is required to load the model.\nInstall it into your virtualenv, e.g. `pip install scikit-learn`"
    ) from e

def predict_deficit_risk(income, variable_balance, days_left, daily_spend_avg):
    """
    Returns: (is_at_risk: bool, projected_shortfall: float, risk_probability: float)
    """
    # 1. Math Engine: Feature Engineering
    safe_daily_limit = variable_balance / days_left if days_left > 0 else 0
    burn_rate = daily_spend_avg / safe_daily_limit if safe_daily_limit > 0 else 999.0
    
    # 2. Format for the Model
    input_data = pd.DataFrame([[income, variable_balance, days_left, daily_spend_avg, burn_rate]], 
                              columns=['monthly_income', 'variable_balance', 'days_left_in_month', 'daily_spend_avg', 'burn_rate'])
    
    # 3. Get Prediction (1 = Risk, 0 = Safe)
    prediction = risk_model.predict(input_data)[0]
    
    # Get the exact probability (e.g., 0.85 = 85% chance of going broke)
    probabilities = risk_model.predict_proba(input_data)[0]
    risk_probability = probabilities[1] # The probability of class 1 (Risk)
    
    # 4. Math Engine: Calculate exactly how much they will be short
    projected_shortfall = 0.0
    if prediction == 1:
        projected_spend = daily_spend_avg * days_left
        projected_shortfall = round(projected_spend - variable_balance, 2)
        
    return (prediction == 1), projected_shortfall, round(risk_probability * 100, 1)

# --- Test It! ---
# Alex earns RM3500. He has RM300 left in Variable pockets. There are 10 days left.
# His Safe Limit is RM30/day. But he is currently spending RM45/day!
# is_risk, shortfall, prob = predict_deficit_risk(3500, 300, 10, 45)

# print(f"At Risk? {is_risk}") 
# print(f"Probability of Deficit: {prob}%")
# print(f"Projected Shortfall: RM {shortfall}")
# # Output: At Risk? True | Prob: 94.2% | Shortfall: RM 150.0
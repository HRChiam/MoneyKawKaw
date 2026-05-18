import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parents[1] / 'Notebook' / 'anomaly_detector.pkl'
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
try:
    anomaly_model = joblib.load(MODEL_PATH)
except ModuleNotFoundError as e:
    missing = e.name if hasattr(e, 'name') else str(e)
    raise ModuleNotFoundError(
        f"{missing} is required to load the model.\nInstall it into your virtualenv, e.g. `pip install scikit-learn`"
    ) from e

def check_for_anomaly(transaction_amount, user_monthly_income, user_avg_category_spend):
    """
    Evaluates a single transaction to see if it's an anomaly.
    Returns: (is_anomaly: bool, reason: str)
    """
    # Prevent division by zero if it's a brand new user/category
    if user_avg_category_spend <= 0:
        user_avg_category_spend = 1 

    # 1. Feature Engineering (Must match how we trained it!)
    income_ratio = transaction_amount / user_monthly_income
    avg_spend_ratio = transaction_amount / user_avg_category_spend
    
    # 2. Format as a DataFrame for the model
    input_data = pd.DataFrame([[income_ratio, avg_spend_ratio]], 
                              columns=['amount_to_income_ratio', 'amount_to_avg_spend_ratio'])
    
    # 3. Get the prediction! 
    # IsolationForest returns 1 for NORMAL, and -1 for ANOMALY
    prediction = anomaly_model.predict(input_data)[0]
    
    is_anomaly = (prediction == -1)
    
    return is_anomaly

# Scenario A: Alex earns RM 3000. He usually spends RM 15 on lunch. 
# He buys lunch for RM 18.
# print("Test A (Lunch):", check_for_anomaly(18, 3000, 15)) 
# # Output: False (Normal)

# # Scenario B: Alex suddenly gets charged RM 1200 at a fancy restaurant!
# print("Test B (Massive Dinner):", check_for_anomaly(1200, 3000, 15)) 
# # Output: True (🚨 ANOMALY DETECTED!)
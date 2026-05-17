import joblib
import pandas as pd
from datetime import datetime
from pathlib import Path

# Load the AI model and the translators (Encoders) when the server starts
NOTEBOOK_PATH = Path(__file__).resolve().parents[1] / 'Notebook'
forecaster_model = joblib.load(NOTEBOOK_PATH / 'spending_forecaster_v2.pkl')
le_mode = joblib.load(NOTEBOOK_PATH / 'encoder_savings_mode.pkl')
le_category = joblib.load(NOTEBOOK_PATH / 'encoder_parent_category.pkl')

def allocate_monthly_budget(user_income, savings_mode, target_month, fixed_expenses_total, user_pockets_data):
    """
    user_pockets_data is a list of dictionaries straight from your Pockets table:
    [{'pocket_id': 'uuid1', 'parent_category': 'Food', 'created_at': '2026-05-10', 'previous_limit': 800}, ...]
    """
    # 1. Math Engine: Secure the core funds first
    mandatory_savings = user_income * 0.10 # Force 10% savings
    discretionary_budget = user_income - fixed_expenses_total - mandatory_savings
    
    if discretionary_budget <= 0:
        return "Error: Fixed expenses exceed income!"

    raw_predictions = {}
    total_predicted = 0.0

    # 2. ML Layer: Get raw predictions for every pocket
    mode_encoded = le_mode.transform([savings_mode])[0]
    today = datetime.now()

    for pocket in user_pockets_data:
        # Translate the parent category to a number
        # Note: In production, wrap this in a try-except in case of unknown categories
        category_encoded = le_category.transform([pocket['parent_category']])[0]
        
        # Calculate pocket age
        created_date = datetime.strptime(pocket['created_at'], '%Y-%m-%d')
        pocket_age_days = (today - created_date).days
        
        # Format the data row exactly how we trained it
        input_data = pd.DataFrame([[
            user_income, mode_encoded, category_encoded, target_month, 
            pocket_age_days, pocket['previous_limit']
        ]], columns=['monthly_income', 'savings_mode_encoded', 'parent_category_encoded', 
                     'month_of_year', 'pocket_age_days', 'previous_allocated_limit'])
        
        # Predict!
        predicted_spend = forecaster_model.predict(input_data)[0]
        raw_predictions[pocket['pocket_id']] = predicted_spend
        total_predicted += predicted_spend

    # 3. Math Engine: Normalize the ML predictions
    # The ML model might predict they need RM 2000, but they only have RM 1500 left!
    # We mathematically scale all pockets down (or up) to fit the exact budget.
    final_allocations = {}
    
    for pocket_id, raw_amount in raw_predictions.items():
        # Calculate what percentage this pocket takes up of the total predicted
        proportion = raw_amount / total_predicted if total_predicted > 0 else 0
        
        # Apply that percentage to their ACTUAL available cash
        safe_amount = discretionary_budget * proportion
        final_allocations[pocket_id] = round(safe_amount, 2)
        
    return {
        "discretionary_total": round(discretionary_budget, 2),
        "savings_locked": round(mandatory_savings, 2),
        "pocket_allocations": final_allocations
    }

# --- Let's Test It! ---
# Alex earns RM 3500. He pays RM 1000 in rent/loans. 
# He has three pockets. Notice the "Concert" pocket is brand new!
alex_pockets = [
    {'pocket_id': 'p1_food', 'parent_category': 'Food', 'created_at': '2025-01-01', 'previous_limit': 800},
    {'pocket_id': 'p2_transport', 'parent_category': 'Transport', 'created_at': '2025-01-01', 'previous_limit': 300},
    {'pocket_id': 'p3_concert', 'parent_category': 'Entertainment', 'created_at': '2026-05-15', 'previous_limit': 150} # Just created 2 days ago!
]

final_budget = allocate_monthly_budget(3500, 'Aggressive', 6, 1000, alex_pockets)
print(final_budget)
import joblib
import pandas as pd
from datetime import datetime
from pathlib import Path
import os

# Load the AI model and the translators (Encoders) when the server starts
NOTEBOOK_PATH = Path(__file__).resolve().parents[1] / 'Notebook'
forecaster_model = joblib.load(NOTEBOOK_PATH / 'spending_forecaster_v2.pkl')
le_mode = joblib.load(NOTEBOOK_PATH / 'encoder_savings_mode.pkl')
le_category = joblib.load(NOTEBOOK_PATH / 'encoder_parent_category.pkl')

CSV_PATH = Path(__file__).resolve().parents[2] / 'app' / 'app' / 'data' / 'transaction data.csv'

def get_historical_trend():
    """Reads transaction data CSV and returns average monthly spending per pocket category."""
    try:
        if not os.path.exists(CSV_PATH):
            print(f"Warning: CSV file not found at {CSV_PATH}")
            return {}
            
        df = pd.read_csv(CSV_PATH)
        # Filter for expenses
        df_expenses = df[df['transaction_type'] == 'EXPENSE'].copy()
        
        # Simple aggregation: sum by pocket_name
        # Since we don't know the exact time span of the CSV, we'll treat it as 'representative month'
        trend = df_expenses.groupby('pocket_name')['amount'].sum().to_dict()
        return trend
    except Exception as e:
        print(f"Error processing historical trend: {e}")
        return {}

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
    # Handle savings_mode encoding (case insensitive)
    try:
        mode_encoded = le_mode.transform([savings_mode.capitalize()])[0]
    except:
        mode_encoded = le_mode.transform(['Balanced'])[0] # Fallback
        
    today = datetime.now()
    
    # Get historical trend to influence predictions
    historical_trend = get_historical_trend()

    for pocket in user_pockets_data:
        # Translate the parent category to a number
        category_name = pocket.get('parent_category') or pocket.get('pocket_name', 'Other')
        
        try:
            category_encoded = le_category.transform([category_name])[0]
        except:
            category_encoded = le_category.transform(['Food'])[0] # Fallback
        
        # Calculate pocket age
        created_at = pocket.get('created_at', datetime.now().strftime('%Y-%m-%d'))
        try:
            created_date = datetime.strptime(created_at, '%Y-%m-%d')
        except:
            # Handle ISO format if provided
            try:
                created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00')).replace(tzinfo=None)
            except:
                created_date = today
                
        pocket_age_days = (today - created_date).days
        
        # Format the data row exactly how we trained it
        input_data = pd.DataFrame([[
            user_income, mode_encoded, category_encoded, target_month, 
            pocket_age_days, pocket.get('previous_limit', 0)
        ]], columns=['monthly_income', 'savings_mode_encoded', 'parent_category_encoded', 
                     'month_of_year', 'pocket_age_days', 'previous_allocated_limit'])
        
        # Predict!
        predicted_spend = float(forecaster_model.predict(input_data)[0])
        
        # Influence with historical trend if available
        if category_name in historical_trend:
            # Weighted average: 70% ML prediction, 30% historical trend
            predicted_spend = (predicted_spend * 0.7) + (historical_trend[category_name] * 0.3)
            
        raw_predictions[pocket['pocket_id']] = predicted_spend
        total_predicted += predicted_spend

    # 3. Math Engine: Normalize the ML predictions
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

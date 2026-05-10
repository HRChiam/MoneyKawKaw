import os
import json
import joblib
import numpy as np
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# Load environment variables from .env
load_dotenv()

# Initialize your AI (Replace with your actual API key from Google AI Studio)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))

# --- Load Trained ML Model ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "gx_smart_predictor.pkl")
try:
    predictor_model = joblib.load(MODEL_PATH)
except Exception as e:
    predictor_model = None
    print(f"Warning: Could not load GX Smart Predictor model: {e}")

# ==========================================
# ⚙️ HYBRID AI (Backend Math -> LLM Messaging)
# ==========================================

# --- Feature 1: Initial Setup Allocation ---
def calculate_initial_allocation(income, fixed_expenses_dict, mode):
    """
    income: Total monthly income (RM)
    fixed_expenses_dict: Dict of chosen fixed expenses { 'Loan': 500, 'PTPTN': 200, ... }
    mode: 'Balanced', 'Saver', or 'Socialite'
    """
    total_fixed = sum(fixed_expenses_dict.values())
    disposable = max(0, income - total_fixed)
    
    # Mathematical Baseline (as a starting point for AI)
    modes = {
        "Balanced": {"Saving": 0.3, "F&B": 0.2, "Transport": 0.1, "Groceries": 0.2, "Entertainment": 0.2},
        "Saver": {"Saving": 0.5, "F&B": 0.1, "Transport": 0.1, "Groceries": 0.1, "Entertainment": 0.2},
        "Socialite": {"Saving": 0.1, "F&B": 0.3, "Transport": 0.1, "Groceries": 0.2, "Entertainment": 0.3}
    }
    ratios = modes.get(mode, modes["Balanced"])
    baseline = {k: round(disposable * v, 2) for k, v in ratios.items()}

    # AI Smart Adjustment
    template = """
    You are a professional financial planner for the MoneyKawKaw app.
    The user has a monthly income of RM{income}.
    They have fixed expenses (Non-negotiable) totaling RM{total_fixed}: {fixed_details}.
    They have RM{disposable} left for their disposable pockets.
    Their desired lifestyle mode is '{mode}'.

    Here is a mathematical baseline for their disposable pockets:
    {baseline}

    CRITICAL RULES:
    1. If fixed expenses are > 50% of income, prioritize 'Saving' (at least 10% of disposable) and 'Groceries' and 'Food & Beverage' over 'Entertainment'.
    2. If fixed expenses are very high (> 70%), you MUST reduce 'Entertainment' to a minimum (e.g. RM50 or less) to ensure they have enough for 'Groceries' and 'Saving'.
    3. If they are in 'Socialite' mode but have little money, be realistic—reduce F&B slightly to keep 'Transport' and 'Groceries' viable.
    4. The total of [Saving, F&B, Transport, Groceries, Entertainment] MUST exactly equal RM{disposable}.
    5. Return ONLY a JSON object with these keys: Saving, F&B, Transport, Groceries, Entertainment. Use numbers only.
    """
    
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm | JsonOutputParser()
    
    try:
        # Get AI adjusted pockets
        smart_pockets = chain.invoke({
            "income": income,
            "total_fixed": total_fixed,
            "fixed_details": json.dumps(fixed_expenses_dict),
            "disposable": disposable,
            "mode": mode,
            "baseline": json.dumps(baseline)
        })
        
        # Merge with fixed expenses
        final_allocation = {k: float(v) for k, v in fixed_expenses_dict.items()}
        for k, v in smart_pockets.items():
            final_allocation[k] = float(v)
            
        return final_allocation
    except Exception as e:
        print(f"AI Allocation failed, falling back to math: {e}")
        # Fallback to math
        allocation = {k: float(v) for k, v in fixed_expenses_dict.items()}
        for k, v in baseline.items():
            allocation[k] = float(v)
        return allocation


# --- Feature 6 & 8: Smart Income Router & Rebalancer ---
def process_income_event(income_amount, past_spending_summary, current_ratios, is_freelance=False):
    """
    Handles major income arrival (Payday or Big Freelance gig).
    Implements the 'Weekly Drip' strategy and adjusts ratios based on past 30 days.
    """
    user_type = "Freelance" if is_freelance else "Salaried (Payday Detected)"
    weekly_release = round(income_amount / 4, 2)
    
    template = """
    You are the MoneyKawKaw Smart Router. 
    Income Received: RM{income}
    User Type: {user_type}
    
    Past 30 Days Spending Pattern: {spending_data}
    Current Budget Plan (Ratios): {ratios}
    
    YOUR TASK:
    1. Acknowledge the RM{income} income and analyze past spending to suggest/apply ratio adjustments.
    2. Explain the 'Weekly Drip':
       - You are dividing this income into 4 weekly parts (RM{weekly} per week).
       - For Salaried: The first RM{weekly} has been moved to pockets now; the rest stays in the main account to be released every Sunday.
       - For Freelance: You've updated their plan percentages, and they should move RM{weekly} manually every week to follow the plan.
    
    Write a 3-sentence encouraging summary. Use Malaysian slang (lah, steady, boss).
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({
        "income": income_amount, 
        "user_type": user_type,
        "weekly": weekly_release,
        "spending_data": json.dumps(past_spending_summary),
        "ratios": json.dumps(current_ratios)
    }).content

# --- Feature 6b: The Silent Buffer Sweep (Small Random Incomes) ---
def summarize_weekly_silent_sweep(total_pooled, pocket_distribution):
    """
    Called every Sunday to summarize small random transfers received during the week.
    """
    template = """
    You are the MoneyKawKaw AI assistant. 
    This week, the user received several small transfers (friend repayments, small gigs, etc.) totaling RM{total}.
    You kept this silently in a buffer to prevent alert fatigue.
    Now it's Sunday! You just automatically moved that RM{total} into their pockets:
    {distribution}
    
    Write a fun, 2-sentence summary telling them the 'Sunday Sweep' is done. 
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({
        "total": total_pooled,
        "distribution": json.dumps(pocket_distribution)
    }).content

# --- Feature 7: Momentum & Prediction ---
def generate_momentum_warning(category, days_over, daily_limit, current_avg_spend):
    """
    Combines ML Prediction (Shortfall) with LLM Messaging.
    """
    predicted_shortfall = 0
    
    # 1. Use the trained ML model to predict shortfall
    if predictor_model:
        try:
            # We assume the model expects: [days_over, daily_limit, current_avg_spend]
            # NOTE: If your model requires more/different features, update this list!
            features = np.array([[days_over, daily_limit, current_avg_spend]])
            prediction = predictor_model.predict(features)
            predicted_shortfall = round(float(prediction[0]), 2)
        except Exception as e:
            print(f"ML Prediction failed: {e}")
            # Fallback simple math: (overspend per day) * remaining days
            predicted_shortfall = (current_avg_spend - daily_limit) * 20
    else:
        # Fallback if no model is loaded
        predicted_shortfall = (current_avg_spend - daily_limit) * 20

    # 2. Use LLM to generate the human-friendly warning
    template = """
    You are a strict but empathetic financial AI for MoneyKawKaw. 
    The user has exceeded their daily limit for {category} for {days_over} days in a row.
    Our ML momentum engine predicts they will be short RM{predicted_shortfall} by the end of the month if they don't stop.
    
    Give them a 2-sentence reality check. Be direct but don't panic them.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({
        "category": category, 
        "days_over": days_over, 
        "predicted_shortfall": predicted_shortfall
    }).content

# ==========================================
# 🤖 TRUE AGENTIC AI (LLM Decision Making)
# ==========================================

# --- Feature 3: The "Hard Warning" Trade-Off ---
def execute_hard_warning(attempted_purchase_amount, pocket_category, current_balances):
    template = """
    You are the MoneyKawKaw Active Consent Engine.
    The user is trying to spend RM{amount} on {category}, but their {category} pocket is empty!
    Here are their remaining pocket balances: {balances}.
    
    Rule 1: Look at their balances. Find the pocket with the highest available money (prefer Entertainment or Shopping over Savings).
    Rule 2: Generate a short, strict prompt forcing them to make a trade-off. 
    
    Example format: "Hold up! You have RM0 for Food. To buy this RM15 meal, you must sacrifice RM15 from your [Chosen Pocket]. Do you agree?"
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    response = chain.invoke({
        "amount": attempted_purchase_amount, 
        "category": pocket_category, 
        "balances": current_balances
    })
    return response.content

# --- Feature 9: Debt-Routing & Cross-Selling ---
def agentic_debt_router(surplus_amount, liabilities):
    # Python Math: Debt Avalanche method
    worst_debt = sorted(liabilities, key=lambda x: x['interest_rate'], reverse=True)[0]
    
    template = """
    You are an elite wealth manager for GXBank. The user has RM{surplus} extra cash this month.
    The backend math engine determined that their most toxic debt is a {debt_name} charging {interest}% compounding interest.
    
    Write a persuasive 3-sentence nudge. 
    1. Tell them to route the RM{surplus} to the {debt_name}.
    2. If the debt is an 'External Credit Card', casually mention they should transfer that balance to 'GX FlexiCredit' for lower rates.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    response = chain.invoke({
        "surplus": surplus_amount, 
        "debt_name": worst_debt['name'], 
        "interest": worst_debt['interest_rate']
    })
    return response.content


# ==========================================
# 🚀 TEST BLOCK (Run this to see the magic)
# ==========================================
if __name__ == "__main__":
    print("--- 1. Initial Setup (Smart AI Allocation) ---")
    mock_fixed = {"Rental": 2500, "PTPTN": 150, "Car_Loan":300} # High fixed expenses
    print(calculate_initial_allocation(5000, mock_fixed, "Balanced"))
    
    print("\n--- 6 & 8. Smart Income Event ---")
    mock_past_spending = {"F&B": 1200, "Entertainment": 400, "Groceries": 600}
    mock_ratios = {"Saving": 0.3, "F&B": 0.2, "Transport": 0.1, "Groceries": 0.2, "Entertainment": 0.2}
    print(process_income_event(5000, mock_past_spending, mock_ratios, is_freelance=False))
    
    print("\n--- 6b. Sunday Silent Sweep ---")
    mock_sweep_dist = {"Groceries": 50, "Saving": 100}
    print(summarize_weekly_silent_sweep(150, mock_sweep_dist))
    
    print("\n--- 7. Momentum Warning (ML + AI) ---")
    # Simulation: Daily limit is RM30, but user is spending RM50/day
    print(generate_momentum_warning("Food", 4, 30, 50))

    print("\n--- 3. Hard Warning Interception ---")
    mock_balances = {"Entertainment": 100, "Shopping": 20, "Savings": 500, "Food": 0}
    print(execute_hard_warning(15, "Food", mock_balances))
    
    print("\n--- 9. Agentic Debt Routing ---")
    user_debts = [
        {"name": "External Car Loan", "interest_rate": 3.0}, 
        {"name": "Maybank Credit Card", "interest_rate": 18.0}
    ]
    print(agentic_debt_router(300, user_debts))
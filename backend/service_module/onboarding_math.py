# core/onboarding_math.py

def calculate_cold_start_budget(monthly_income: float, fixed_expenses: dict, savings_mode: str):
    """
    Calculates the day-1 budget baseline for a new user based on their chosen persona.
    
    Args:
        monthly_income (float): The user's total salary.
        fixed_expenses (dict): Key-value pairs of fixed costs e.g., {'Rent': 800, 'PTPTN': 150}
        savings_mode (str): 'Conservative', 'Balanced', or 'Aggressive'
        
    Returns:
        dict: A fully distributed budget plan.
    """
    # 1. Secure the Fixed Expenses first
    total_fixed = sum(fixed_expenses.values())
    disposable_income = monthly_income - total_fixed
    
    if disposable_income <= 0:
        return {"error": "Fixed expenses exceed or equal monthly income. Bankruptcy risk!"}

    # 2. Define the Persona Templates (Ratios for disposable income)
    # 'Aggressive' here means aggressive savings/investing.
    templates = {
        "Aggressive": { # High savings focus
            "Savings": 0.50,
            "Food": 0.25,
            "Transport": 0.10,
            "Entertainment": 0.05,
            "Shopping": 0.10
        },
        "Balanced": { # Balanced approach
            "Savings": 0.40,
            "Food": 0.30,
            "Transport": 0.10,
            "Entertainment": 0.10,
            "Shopping": 0.10
        },
        "Conservative": { # Moderate savings focus
            "Savings": 0.30,
            "Food": 0.35,
            "Transport": 0.15,
            "Entertainment": 0.10,
            "Shopping": 0.10
        }
    }
    
    # Default to Balanced if a weird string is passed
    ratios = templates.get(savings_mode, templates["Balanced"])
    
    # 3. Calculate the Variable Pocket allocations
    variable_pockets = {}
    for category, percentage in ratios.items():
        variable_pockets[category] = round(disposable_income * percentage, 2)
        
    # 4. Handle rounding errors (ensure it adds up to exactly the disposable income)
    allocated_total = sum(variable_pockets.values())
    difference = round(disposable_income - allocated_total, 2)
    if difference != 0:
        # Dump any leftover cents into Savings
        variable_pockets["Savings"] = round(variable_pockets["Savings"] + difference, 2)
        
    return {
        "monthly_income": monthly_income,
        "total_fixed_expenses": total_fixed,
        "disposable_income": disposable_income,
        "fixed_pockets": fixed_expenses,
        "variable_pockets": variable_pockets
    }

# --- Test it! ---
if __name__ == "__main__":
    # Test Scenario: RM 4000 salary, RM 1200 in fixed bills, wants a "Balanced" lifestyle
    user_fixed_bills = {"Rent": 900.00, "Car_Loan": 300.00}
    
    baseline = calculate_cold_start_budget(
        monthly_income=4000.00, 
        fixed_expenses=user_fixed_bills, 
        savings_mode="Balanced"
    )
    
    import json
    print(json.dumps(baseline, indent=2))
# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict
from service_module.onboarding_math import calculate_cold_start_budget
from AI.onboarding_AI import reality_check_budget

app = FastAPI()

class OnboardingRequest(BaseModel):
    monthly_income: float
    fixed_expenses: Dict[str, float]
    savings_mode: str

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

    return {
        "status": "success",
        "database_payload": {
            "fixed_pockets": req.fixed_expenses,
            "variable_pockets": final_pockets
        }
    }
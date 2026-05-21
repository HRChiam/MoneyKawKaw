# Add this to services/ai_brain.py
import json
import os
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Initialize Gemini LLM for financial planning
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.0
)

def reality_check_budget(income: float, fixed_total: float, disposable: float, mode: str, math_baseline: dict):
    """
    Acts as a sanity check. If the mathematical baseline is unrealistic based on the user's 
    income-to-debt ratio, the AI modifies the percentages.
    """
    template = """
    You are a realistic Malaysian Financial Planner AI for the GX Catalyst app.
    
    USER FINANCIAL PROFILE:
    - Monthly Income: RM{income}
    - Fixed Expenses (Rent/Loans): RM{fixed_total}
    - Disposable Income Remaining: RM{disposable}
    - Desired Lifestyle Persona: {mode}
    
    DEFAULT MATHEMATICAL BASELINE:
    {baseline}
    
    YOUR MISSION:
    Review the baseline for realism. 
    1. If their Fixed Expenses take up a massive chunk of their income (e.g., > 60%), they are in survival mode. You MUST heavily reduce 'Entertainment' to ensure 'Food' and 'Transport' have enough raw RM to survive the month, regardless of their chosen persona.
    2. If they have plenty of disposable income, respect their chosen persona (Conservative/Balanced/Aggressive).
    3. The sum of all categories MUST exactly equal their Disposable Income (RM{disposable}). Do not invent money.
    
    OUTPUT INSTRUCTIONS:
    Return ONLY a valid JSON object with the adjusted amounts. Use these exact keys: "Savings", "Food", "Drinks", "Transport", "Entertainment". Do not wrap it in markdown block quotes.
    """
    
    prompt = PromptTemplate(
        template=template,
        input_variables=["income", "fixed_total", "disposable", "mode", "baseline"]
    )
    
    # JsonOutputParser forces the LLM to return a clean Python dictionary!
    chain = prompt | llm | JsonOutputParser()
    
    try:
        ai_adjusted_pockets = chain.invoke({
            "income": income,
            "fixed_total": fixed_total,
            "disposable": disposable,
            "mode": mode,
            "baseline": json.dumps(math_baseline)
        })
        return ai_adjusted_pockets
    except Exception as e:
        print(f"⚠️ AI Reality Check Failed. Falling back to Math Engine. Error: {e}")
        return math_baseline # Fail-safe: If AI crashes, trust the math.
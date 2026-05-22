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
    Review the baseline for realism based on the actual current cost of living in Malaysia. 
    
    CRITICAL RULES:
    1. THE REALISM CHECK (SURVIVAL OVERRIDE): Evaluate the absolute RM amount for 'Food' and 'Transport'. For example, RM300/month for food is only RM10/day, which is highly unrealistic for a working adult. 
    2. HIERARCHY OF FUNDS: Essential survival beats savings goals. If the baseline leaves 'Food' or 'Transport' with unlivable amounts, you MUST override the persona. You are explicitly authorized and required to slash 'Savings', 'Entertainment', and 'Drinks' down to zero if necessary, just to ensure 'Food' and 'Transport' have enough raw RM to survive the month.
    3. RESPECT PERSONA (WHEN SAFE): Only if basic needs (Food/Transport) are comfortably met should you apply their chosen persona (Conservative/Balanced/Aggressive) to distribute the remaining funds into Savings and Lifestyle.
    4. ZERO-SUM MATH: The sum of all output categories (Savings + Food + Drinks + Transport + Entertainment) MUST exactly equal their Disposable Income (RM{disposable}). Do not invent or lose money.
    5. PRETTY NUMBERS: Use clean, rounded Malaysian amounts. Prefer multiples of 10 or 50 (e.g., RM1250, RM400, RM150) rather than odd numbers like RM432.17. It makes it easier for users to track.

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
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

# Load environment variables from .env
load_dotenv()

# Initialize your AI (Replace with your actual API key from Google AI Studio)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))

# ==========================================
# ⚙️ HYBRID AI (Backend Math -> LLM Messaging)
# ==========================================

# --- Feature 1: Initial Setup Allocation ---
def generate_welcome_message(persona, food_pct, savings_pct):
    template = """
    You are the MoneyKawKaw AI assistant. The user just chose the '{persona}' lifestyle.
    The backend math has allocated {food_pct}% of their money to Food, and {savings_pct}% to Savings.
    Write a fun, encouraging 2-sentence welcome message explaining this setup. 
    Keep it very short and use Malaysian slang (like 'lah' or 'makan') subtly.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({"persona": persona, "food_pct": food_pct, "savings_pct": savings_pct}).content

# --- Feature 6: Receiving Money Routing (The Freelancer Buffer) ---
def summarize_weekly_buffer(total_pooled, food_amt, savings_amt):
    template = """
    You are the MoneyKawKaw AI assistant. 
    This week, the user received several small transfers (from friends or freelance gigs) totaling RM{total}.
    To prevent alert fatigue, you silently kept this in a buffer. 
    Now it's Sunday. You just automatically moved RM{food} to their Food pocket and RM{savings} to Savings.
    Write a 2-sentence friendly summary telling the user you handled this for them.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({"total": total_pooled, "food": food_amt, "savings": savings_amt}).content

# --- Feature 7: Momentum & Prediction ---
def generate_momentum_warning(category, days_over, predicted_shortfall):
    template = """
    You are a strict but empathetic financial AI. 
    The user has exceeded their daily limit for {category} for {days_over} days in a row.
    If they keep this up, they will be short RM{predicted_shortfall} by the end of the month.
    Give them a 2-sentence reality check. Be direct but don't panic them.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({"category": category, "days_over": days_over, "predicted_shortfall": predicted_shortfall}).content

# --- Feature 8: Continuous Learning (The Monthly Rebalancer) ---
def continuous_learning_rebalance(pocket_name, budgeted, actual_spent):
    variance = actual_spent - budgeted
    if variance > 0:
        trend = f"overspent by RM{variance}"
        suggestion = "increase"
    else:
        trend = f"underspent by RM{abs(variance)}"
        suggestion = "decrease"

    template = """
    You are a smart financial AI. It is the end of the month.
    The user's original budget for {category} was RM{budget}, but they actually spent RM{spent}.
    They {trend}.
    Write a casual, 2-sentence prompt asking if they want to {suggestion} their {category} budget for next month to match their actual lifestyle.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({
        "category": pocket_name, 
        "budget": budgeted, 
        "spent": actual_spent, 
        "trend": trend, 
        "suggestion": suggestion
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
    2. Explain briefly why compounding interest is a trap.
    3. If the debt is an 'External Credit Card', casually mention they should transfer that balance to 'GX FlexiCredit' for lower rates.
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
    print("--- 1. Initial Setup ---")
    print(generate_welcome_message("Balanced", 40, 20))
    
    print("\n--- 6. Silent Buffer Sweep ---")
    print(summarize_weekly_buffer(150, 100, 50))
    
    print("\n--- 7. Momentum Warning ---")
    print(generate_momentum_warning("Food", 3, 150))
    
    print("\n--- 8. Monthly Rebalancer ---")
    print(continuous_learning_rebalance("Food", 600, 850))

    print("\n--- 3. Hard Warning Interception ---")
    mock_balances = {"Entertainment": 100, "Shopping": 20, "Savings": 500, "Food": 0}
    print(execute_hard_warning(15, "Food", mock_balances))
    
    print("\n--- 9. Agentic Debt Routing ---")
    user_debts = [
        {"name": "External Car Loan", "interest_rate": 3.0}, 
        {"name": "Maybank Credit Card", "interest_rate": 18.0}
    ]
    print(agentic_debt_router(300, user_debts))
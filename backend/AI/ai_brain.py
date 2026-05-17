# services/ai_brain.py
import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))

# --- Feature 6 & 8: Smart Monthly Router ---
def explain_monthly_allocation(income_amount, past_spending_summary, new_allocations):
    """
    Called AFTER spending_forecast.py has done the math.
    """
    template = """
    You are the MoneyKawKaw Smart Router. 
    Income Received: RM{income}
    Past 30 Days Spending Pattern: {spending_data}
    New Mathematically Verified Allocations: {allocations}
    
    YOUR TASK:
    Acknowledge the RM{income} payday! Explain why their money was directly distributed into these pockets based on their past trends. 
    Remind them to just follow their Daily Limit and they'll be steady. Use Malaysian slang (steady, boss).
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({
        "income": income_amount, 
        "spending_data": json.dumps(past_spending_summary),
        "allocations": json.dumps(new_allocations)
    }).content

# --- Feature 7: Momentum Warning ---
def generate_momentum_warning(category, days_over, predicted_shortfall):
    """
    Called AFTER burn_rate_math.py has predicted the exact shortfall.
    """
    template = """
    You are a strict but empathetic financial AI for MoneyKawKaw. 
    The user has exceeded their daily limit for {category} for {days_over} days in a row.
    Our ML engine predicts they will be short RM{predicted_shortfall} by the end of the month.
    
    Give them a 2-sentence reality check. Be direct but don't panic them.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({
        "category": category, 
        "days_over": days_over, 
        "predicted_shortfall": predicted_shortfall
    }).content

# --- Feature 11: Anomaly Actionable Modal ---
def generate_anomaly_interception(transaction_amount, merchant):
    """
    Called AFTER check_for_anomaly.py flags a transaction.
    """
    template = """
    The user just spent an abnormal RM{amount} at {merchant}.
    Ask them if this was a planned purchase (draw from savings), fraud, or if they want to convert it to a GX FlexiCredit installment. Keep it under 3 sentences.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    return chain.invoke({"amount": transaction_amount, "merchant": merchant}).content
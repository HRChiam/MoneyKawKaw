import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.7)
llm_structured = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.0)

def refine_forecast_with_ai(income: float, mode: str, math_forecast: dict):
    """
    Refines the ML-based forecast to ensure pretty numbers and zero-sum math across the ENTIRE budget.
    math_forecast should contain ALL pockets (fixed and variable) plus Savings.
    """
    template = """
    You are a Smart Malaysian Financial Advisor for the GX Catalyst app.
    
    USER PROFILE:
    - Monthly Income: RM{income}
    - Savings Mode: {mode}
    
    ML-GENERATED FULL BUDGET (includes fixed expenses, variable pockets, and savings):
    {forecast}
    
    YOUR TASK:
    Refine the variable amounts to be "pretty" (multiples of 10 or 50) while ensuring the SUM of ALL pockets equals EXACTLY RM{income}.
    
    RULES:
    1. RESPECT FIXED POCKETS: Some pockets are fixed (like Loans, Rent). Do NOT change their amounts.
    2. PRETTY VARIABLE POCKETS: Round variable amounts (Food, Drinks, Entertainment, etc.) to the nearest RM10 or RM50.
    3. ZERO-SUM MATH: The sum of EVERY SINGLE pocket in your JSON response MUST add up to EXACTLY RM{income}. 
    4. ADJUST SAVINGS LAST: If your rounding causes the total to be slightly off RM{income}, adjust the 'Savings' pocket amount to make it perfect.
    
    OUTPUT:
    Return ONLY a valid JSON object where keys are the pocket names from the forecast and values are the refined RM amounts. 
    Include ALL pockets in the output, even the fixed ones.
    """
    
    prompt = PromptTemplate(
        template=template,
        input_variables=["income", "mode", "forecast"]
    )
    
    chain = prompt | llm_structured | JsonOutputParser()
    
    try:
        refined = chain.invoke({
            "income": income,
            "mode": mode,
            "forecast": json.dumps(math_forecast)
        })
        return refined
    except Exception as e:
        print(f"⚠️ AI Forecast Refinement Failed. Error: {e}")
        return math_forecast

def explain_monthly_allocation(income_amount, past_spending_summary, new_allocations):
    """
    Generates a personalized explanation of the monthly budget distribution.
    """
    template = """
    You are the MoneyKawKaw Smart Router, a professional financial assistant. 
    Income Received: RM{income}
    Past 30 Days Spending Pattern: {spending_data}
    New Mathematically Verified Allocations: {allocations}
    
    YOUR TASK:
    1. Acknowledge the RM{income} payday! 
    2. Explicitly recommend the new pocket allocations to the user. Use the EXACT RM amounts provided in the 'New Mathematically Verified Allocations' section. Do not round them or summarize them differently.
    3. Briefly explain why this specific breakdown makes sense based on their past spending trends.
    4. Remind them to just follow their Daily Limit and they'll be steady.
    
    CRITICAL: The numbers in your message MUST exactly match the numbers in the provided 'New Mathematically Verified Allocations' JSON.
    
    Keep the tone conversational and strictly keep it under 4 sentences.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "income": income_amount, 
            "spending_data": json.dumps(past_spending_summary),
            "allocations": json.dumps(new_allocations)
        })
        return response.content
    except Exception as e:
        return f"Payday is here! We've recommended your RM{income_amount} into your pockets based on your spending history. "
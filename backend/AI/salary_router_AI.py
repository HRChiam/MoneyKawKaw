import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.7)

def explain_monthly_allocation(income_amount, past_spending_summary, new_allocations):
    """
    Generates a personalized explanation of the monthly budget distribution.
    """
    template = """
    You are the MoneyKawKaw Smart Router, a friendly Malaysian financial assistant. 
    Income Received: RM{income}
    Past 30 Days Spending Pattern: {spending_data}
    New Mathematically Verified Allocations: {allocations}
    
    YOUR TASK:
    Acknowledge the RM{income} payday! Explain why their money was directly distributed into these pockets based on their past trends. 
    Remind them to just follow their Daily Limit and they'll be steady.
    Keep it under 4 sentences.
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
        return f"Payday is here! We've routed your RM{income_amount} into your pockets based on your spending history. Steady boss!"

import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.7)

def generate_debt_advice(surplus, liabilities):
    """
    Generates advice on how to route monthly surplus to handle toxic debt.
    """
    template = """
    You are the MoneyKawKaw Debt Strategist, a smart Malaysian financial AI.
    The user has a monthly surplus of RM{surplus}.
    Their current liabilities/debts are: {liabilities}
    
    YOUR MISSION:
    1. Analyze the debts to find the most "toxic" one (high interest, like credit cards at 18% p.a.).
    2. Suggest routing the RM{surplus} surplus to pay down that specific debt.
    3. If they have high-interest external debt, nudge them to transfer the balance to "GX FlexiCredit" for a lower rate.
    4. If no major debt, suggest moving it to a "GX Savings Pocket" (3% p.a.).
    
    Keep it under 4 sentences, use Malaysian financial context (RM, p.a.), and be encouraging (steady boss).
    """
    
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "surplus": surplus,
            "liabilities": json.dumps(liabilities)
        })
        return response.content
    except Exception as e:
        return f"You have a surplus of RM{surplus}! We recommend putting this towards your highest interest debt or into your GX Savings Pocket to earn 3% p.a. interest. Steady boss!"

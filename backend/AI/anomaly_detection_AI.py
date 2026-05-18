import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.0)

def generate_anomaly_interception(transaction_amount, merchant):
    """
    Generates an interception message for a suspicious transaction.
    """
    template = """
    You are the MoneyKawKaw Security AI.
    The user just spent an abnormal RM{amount} at {merchant}.
    
    YOUR TASK:
    Ask them if this was a planned purchase (draw from savings), potential fraud, or if they want to convert it to a GX FlexiCredit installment. 
    Keep it under 3 sentences. Be helpful but alert.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    try:
        response = chain.invoke({"amount": transaction_amount, "merchant": merchant})
        return response.content
    except Exception as e:
        return f"Wait! We detected an unusual RM{transaction_amount} transaction at {merchant}. Was this you? If yes, you might want to check your budget or use FlexiCredit."

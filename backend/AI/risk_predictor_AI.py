import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.0)

def generate_momentum_warning(category, days_over, predicted_shortfall):
    """
    Generates a warning message when the user is at risk of a budget deficit.
    """
    template = """
    You are a strict but empathetic financial AI for MoneyKawKaw. 
    The user has exceeded their daily limit for {category} for {days_over} days in a row.
    Our ML engine predicts they will be short RM{predicted_shortfall} by the end of the month.
    
    YOUR TASK:
    Give them a 2-sentence reality check. Be direct but don't panic them.
    Highlight the RM{predicted_shortfall} shortfall clearly.
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "category": category, 
            "days_over": days_over, 
            "predicted_shortfall": predicted_shortfall
        })
        return response.content
    except Exception as e:
        return f"Warning: You've been overspending on {category}. You might be short RM{predicted_shortfall} by month-end. Time to slow down!"

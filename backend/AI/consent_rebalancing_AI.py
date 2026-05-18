import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.7)

def generate_rebalancing_proposal(overspent_category, amount_needed, source_category, source_balance):
    """
    Generates a proposal to move money from one pocket to another when a limit is hit.
    """
    template = """
    You are the MoneyKawKaw Consensus AI.
    The user is trying to spend money on {overspent_category}, but their pocket is empty.
    They need RM{amount_needed} more.
    Our math engine found that they have RM{source_balance} in their {source_category} pocket.
    
    YOUR MISSION:
    1. Explain the situation clearly.
    2. Propose a "trade-off": Sacrifice RM{amount_needed} from {source_category} to fund {overspent_category}.
    3. Ask for their consent to proceed with this rebalancing.
    
    Keep it warm, under 3 sentences, and use Malaysian flavor (e.g., "Jom rebalance?", "Steady boss").
    """
    
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "overspent_category": overspent_category,
            "amount_needed": amount_needed,
            "source_category": source_category,
            "source_balance": source_balance
        })
        return response.content
    except Exception as e:
        return f"Your {overspent_category} pocket is empty! To proceed, you can move RM{amount_needed} from your {source_category} pocket. Should we do this for you? Steady boss!"

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.0)

TAX_KNOWLEDGE_BASE = [
    { "category": "Medical Expenses", "keywords": "Medical treatment, dental treatment, special needs, carer, serious diseases, fertility treatment, vaccination, health examination, COVID-19 test, mental health, disease detection" },
    { "category": "Disability Support Equipment", "keywords": "basic supporting equipment for disabled self, spouse, child or parent, wheelchair, hearing aid, artificial limb, hemodialysis" },
    { "category": "Education (Tuition fee)", "keywords": "Education fees self, degree, masters, doctorate, law, accounting, islamic financing, technical, vocational, industrial, scientific, technology, upskilling, self-enhancement" },
    { "category": "Books", "keywords": "books, journals, magazines, newspapers, publications" },
    { "category": "Mobile / Computer Devices", "keywords": "personal computer, smartphone, tablet" },
    { "category": "Internet Bill", "keywords": "monthly bill for internet subscription" },
    { "category": "Personal Development Fees", "keywords": "skill improvement, personal development course fee" },
    { "category": "Sports", "keywords": "sports equipment, rental or entrance fee to sports facility, registration fee for sports competition, gymnasium membership fee, sports training" },
    { "category": "Breastfeeding Equipment", "keywords": "breastfeeding equipment for own use child aged 2 years and below" },
    { "category": "Child Care", "keywords": "Child care fees, registered child care centre, kindergarten child aged 6 years and below" },
    { "category": "EV charging", "keywords": "charging facilities for Electric Vehicle" },
    { "category": "Food Waste Composting Machine", "keywords": "domestic food waste composting machine" }
]

def get_tax_category(merchant_name, amount, reference=None):
    """
    Classifies a transaction into a Malaysian LHDN tax relief category.
    
    Args:
        merchant_name (str): The name of the merchant
        amount (float): The transaction amount
        reference (str, optional): User-provided reference/note (e.g., "lunch", "for baby", "sports equipment")
    """
    template = """
    You are a Malaysian LHDN Tax Expert AI. 
    Match the transaction to a tax relief category based ONLY on this Knowledge Base:
    {knowledge_base}

    Merchant Name: {merchant_name}
    Transaction Amount: RM{amount}
    User Reference/Note: {reference}

    RULES:
    1. Consider BOTH merchant name AND user reference when determining category.
    2. User reference is a helpful hint - use it to clarify ambiguous merchants.
    3. If either merchant name OR reference strongly matches a category, and it makes sense, use that category.
    4. If it does not match (e.g., normal food, clothes, groceries), reply ONLY with: N/A
    5. Do not guess. If in doubt, output N/A.
    6. Reply ONLY with the Category Name or N/A. Output nothing else.
    """
    
    kb_string = "\n".join([f"- {item['category']}: {item['keywords']}" for item in TAX_KNOWLEDGE_BASE])
    
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "merchant_name": merchant_name,
            "amount": amount,
            "reference": reference if reference else "None provided",
            "knowledge_base": kb_string
        })
        return response.content.strip()
    except Exception as e:
        return "N/A"

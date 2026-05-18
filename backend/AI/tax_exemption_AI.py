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

def get_tax_category(merchant_name, amount):
    """
    Classifies a transaction into a Malaysian LHDN tax relief category.
    """
    template = """
    You are a Malaysian LHDN Tax Expert AI. 
    Match the transaction to a tax relief category based ONLY on this Knowledge Base:
    {knowledge_base}

    Merchant Name: {merchant_name}
    Transaction Amount: RM{amount}

    RULES:
    1. If the merchant strongly matches a category, reply ONLY with that Category Name.
    2. If it does not match (e.g., normal food, clothes, groceries), reply ONLY with: N/A
    3. Do not guess. If in doubt, output N/A.
    4. Output nothing else.
    """
    
    kb_string = "\n".join([f"- {item['category']}: {item['keywords']}" for item in TAX_KNOWLEDGE_BASE])
    
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "merchant_name": merchant_name,
            "amount": amount,
            "knowledge_base": kb_string
        })
        return response.content.strip()
    except Exception as e:
        return "N/A"

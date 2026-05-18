import os
import re
import time
import pandas as pd
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

# Load environment variables
load_dotenv(override=True)

# 1. Setup Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.0 
)

# 2. Step 1: The Local RAG "Knowledge Base"
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

# 3. Step 2: The RAG Injection Prompt
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

prompt = PromptTemplate.from_template(template)
ai_categorizer = prompt | llm

def _invoke_tax_categorizer_with_retry(payload, max_attempts=3, sleep_secs=2):
    """Invoke the model with basic retry/backoff for quota errors."""
    for attempt in range(1, max_attempts + 1):
        try:
            return ai_categorizer.invoke(payload)
        except Exception as exc:
            error_text = str(exc)
            is_quota_error = "RESOURCE_EXHAUSTED" in error_text or "429" in error_text
            
            # Only retry on quota/rate-limit errors; raise immediately for other errors
            if not is_quota_error or attempt == max_attempts:
                raise
            
            print(f"     ⏳ Quota hit (attempt {attempt}/{max_attempts}). Waiting {sleep_secs}s...")
            time.sleep(sleep_secs)

def tag_tax_exemptions_llm(df_transactions):
    """
    Scans a dataframe of transactions and classifies tax eligibility.
    """
    df_transactions['tax_category'] = 'N/A'
    df_transactions['is_tax_claimable'] = False
    
    # Compress the Knowledge base to save tokens
    kb_string = ""
    for item in TAX_KNOWLEDGE_BASE:
        kb_string += f"- {item['category']}: {item['keywords']}\n"
        
    valid_categories = [item["category"] for item in TAX_KNOWLEDGE_BASE]
    
    print("🤖 GX AI Tax Expert scanning transactions...")
    for index, row in df_transactions.iterrows():
        print(f"  -> Analyzing: {row['merchant']} (RM{row['amount']})")
        
        payload = {
            "merchant_name": row['merchant'],
            "amount": row['amount'],
            "knowledge_base": kb_string
        }

        try:
            ai_response = _invoke_tax_categorizer_with_retry(payload, sleep_secs=2)
            clean_result = ai_response.content.strip()
        except Exception as exc:
            clean_result = "N/A"
            print(f"     ⚠️ AI call failed, defaulting to N/A.")
        
        if clean_result in valid_categories:
            df_transactions.at[index, 'tax_category'] = clean_result
            df_transactions.at[index, 'is_tax_claimable'] = True
            print(f"     ✅ Match Found: {clean_result}")
        else:
            print(f"     ❌ No Tax Relief (Result: {clean_result})")
            
    return df_transactions

# ==========================================
# 🚀 TEST BLOCK
# ==========================================
if __name__ == "__main__":
    data = {
        'date': ['2026-05-01'],
        'merchant': [
            'Bicycle',             
        ],
        'amount': [150.00]
    }
    df_mock = pd.DataFrame(data)

    df_tagged = tag_tax_exemptions_llm(df_mock)
    
    print("\n--- Final AI Tax Categorizer Results ---")
    print(df_tagged[['merchant', 'is_tax_claimable', 'tax_category']])
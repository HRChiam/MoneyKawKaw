import os
from dotenv import load_dotenv
import pandas as pd
# If you haven't installed these, run: pip install langchain-google-genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

# Load environment variables from .env
load_dotenv()

# 1. Setup Gemini (The "Smart" Backup)
# Replace 'YOUR_API_KEY' with your actual Google AI Studio key
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))

prompt_template = PromptTemplate.from_template(
    "You are a Malaysian Tax Expert. "
    "Look at this merchant name: '{merchant_name}'. "
    "Based on LHDN rules, does this sound like a place you would buy Tech Gadgets, Sports Equipment, or Medical Services? "
    "Reply with ONLY ONE of these exact words: 'Tech_Relief', 'Sports_Relief', 'Medical_Relief', 'Childcare_Relief' or 'None'."
)
ai_categorizer = prompt_template | llm

# 2. Your Original Dictionary (The "Fast" Filter)
tax_keywords = {
    "Tech_Relief": ["APPLE", "SAMSUNG", "DELL", "MACHINES", "ALL IT", "PC IMAGE"],
    "Sports_Relief": ["DECATHLON", "SPORTS DIRECT", "NIKE", "JD SPORTS"],
    "Childcare_Relief": ["KINDERDIX", "SMART READER", "REAL KIDS", "TASKA"]
}

def tag_tax_exemptions_smart(df_transactions):
    df_transactions['tax_category'] = 'None'
    
    # --- STEP 1: Fast Dictionary Match ---
    print("Running Step 1: Fast Dictionary Scan...")
    for category, keywords in tax_keywords.items():
        pattern = '|'.join(keywords)
        mask = df_transactions['merchant'].str.upper().str.contains(pattern, na=False)
        df_transactions.loc[mask, 'tax_category'] = category

    # --- STEP 2: AI Fallback for "Unknown" Big Purchases ---
    print("Running Step 2: AI Fallback for Unknowns...")
    for index, row in df_transactions.iterrows():
        # Only ask AI if we don't know the category AND the amount is somewhat large (e.g., > RM 100)
        # This saves API calls and speeds up the system!
        if row['tax_category'] == 'None' and row['amount'] > 100:
            print(f"  -> Asking AI about mysterious purchase: {row['merchant']}")
            
            # Send to Gemini
            ai_response = ai_categorizer.invoke({"merchant_name": row['merchant']})
            clean_result = ai_response.content.strip()
            
            if clean_result != "None":
                df_transactions.at[index, 'tax_category'] = clean_result
                
    return df_transactions

# --- Test the Hybrid Logic ---
data = {
    'date': ['2026-05-01', '2026-05-05', '2026-05-08', '2026-05-10'],
    'merchant': ['Mamak Ali', 'Machines KLCC', 'Kedai Basikal Ah Chong', 'Klinik Pergigian Dr. Lee'],
    'amount': [15.00, 4200.00, 850.00, 350.00]
}
df_mock = pd.DataFrame(data)

# df_tagged = tag_tax_exemptions_smart(df_mock)
# print("\n--- Final Hybrid Categorizer Results ---")
# print(df_tagged[['merchant', 'amount', 'tax_category']])
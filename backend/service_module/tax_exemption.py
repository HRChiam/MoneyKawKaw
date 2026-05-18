import pandas as pd
from AI.tax_exemption_AI import get_tax_category, TAX_KNOWLEDGE_BASE

def tag_tax_exemptions_llm(df_transactions):
    """
    Scans a dataframe of transactions and classifies tax eligibility using the AI module.
    """
    df_transactions['tax_category'] = 'N/A'
    df_transactions['is_tax_claimable'] = False
    
    valid_categories = [item["category"] for item in TAX_KNOWLEDGE_BASE]
    
    print("🤖 GX AI Tax Expert scanning transactions...")
    for index, row in df_transactions.iterrows():
        print(f"  -> Analyzing: {row['merchant']} (RM{row['amount']})")
        
        clean_result = get_tax_category(row['merchant'], row['amount'])
        
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
# if __name__ == "__main__":
#     data = {
#         'date': ['2026-05-01'],
#         'merchant': [
#             'Bicycle',             
#         ],
#         'amount': [150.00]
#     }
#     df_mock = pd.DataFrame(data)

#     df_tagged = tag_tax_exemptions_llm(df_mock)
    
#     print("\n--- Final AI Tax Categorizer Results ---")
#     print(df_tagged[['merchant', 'is_tax_claimable', 'tax_category']])

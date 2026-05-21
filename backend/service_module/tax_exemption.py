import pandas as pd
from AI.tax_exemption_AI import get_tax_category, TAX_KNOWLEDGE_BASE

# actually not used in API route calling
def tag_tax_exemptions_llm(df_transactions):
    """
    Scans a dataframe of transactions and classifies tax eligibility using the AI module.
    
    Expected columns: 'merchant', 'amount', and optionally 'reference'
    """
    df_transactions['tax_category'] = 'N/A'
    df_transactions['is_tax_claimable'] = False
    
    valid_categories = [item["category"] for item in TAX_KNOWLEDGE_BASE]
    
    print("🤖 GX AI Tax Expert scanning transactions...")
    for index, row in df_transactions.iterrows():
        merchant = row['merchant']
        amount = row['amount']
        reference = row.get('reference', None) if 'reference' in df_transactions.columns else None
        
        if reference:
            print(f"  -> Analyzing: {merchant} (RM{amount}) | Reference: {reference}")
        else:
            print(f"  -> Analyzing: {merchant} (RM{amount})")
        
        clean_result = get_tax_category(merchant, amount, reference)
        
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
            'Apple'
        ],
        'amount': [150.00],
        'reference': ['laptop']
    }
    df_mock = pd.DataFrame(data)

    df_tagged = tag_tax_exemptions_llm(df_mock)
    
    print("\n--- Final AI Tax Categorizer Results ---")
    print(df_tagged[['merchant', 'reference', 'is_tax_claimable', 'tax_category']])
from datetime import timedelta

import pandas as pd

def check_no_spend_streak(df_transactions):
    """
    Checks if the user had zero discretionary spending yesterday to award a streak.
    """
    today = pd.to_datetime('today').normalize()
    yesterday = today - timedelta(days=1)
    
    # Filter transactions to only those from yesterday
    # Ensure the 'date' column is datetime type
    df_transactions['date'] = pd.to_datetime(df_transactions['date'])
    yesterday_tx = df_transactions[df_transactions['date'].dt.normalize() == yesterday]
    
    # Define what counts as "discretionary" (e.g., exclude fixed bills like Rent)
    discretionary_categories = ['Food', 'Entertainment', 'Shopping']
    
    discretionary_spent = yesterday_tx[yesterday_tx['category'].isin(discretionary_categories)]['amount'].sum()
    
    if discretionary_spent == 0:
        return True, "🎉 You earned a No-Spend Streak for yesterday!"
    else:
        return False, f"You spent RM {discretionary_spent} yesterday. Streak broken."

# --- Test the Logic ---
# Add a category column to our mock data and set dates to today/yesterday
data_streak = {
    'date': [pd.to_datetime('today'), pd.to_datetime('today') - timedelta(days=1)],
    'merchant': ['Grab', 'TNB'], # TNB is a utility, not discretionary
    'amount': [20.00, 150.00],
    'category': ['Transport', 'Utilities']
}
df_streak = pd.DataFrame(data_streak)

success, message = check_no_spend_streak(df_streak)
print("\n--- Streak Calculator Results ---")
print(message)
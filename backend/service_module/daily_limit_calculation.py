from datetime import datetime
import calendar

def calculate_daily_limit(total_discretionary, spent_so_far):
    """
    Calculates the 'Safe to Spend' daily limit based on the remaining budget and days left in the month.
    """
    # FIXED: Using May 12, 2026 as today for all features
    today = datetime(2026, 5, 12)
    # Get the total number of days in the current month
    _, total_days_in_month = calendar.monthrange(today.year, today.month)
    
    days_passed = today.day
    days_left = total_days_in_month - days_passed + 1 # +1 to include today
    
    remaining_budget = total_discretionary - spent_so_far
    
    if remaining_budget <= 0:
        return 0.00
    
    daily_limit = remaining_budget / days_left
    return round(daily_limit, 2)

# --- Test the Logic ---
# Suppose Alex had RM 2000 total discretionary, and spent RM 500 so far. Today is the 10th.
limit = calculate_daily_limit(total_discretionary=2000, spent_so_far=500)
print(f"Alex's Safe to Spend limit for today is: RM {limit}")
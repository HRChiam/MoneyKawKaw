# core/daily_limit_calculation.py
from datetime import datetime
import calendar

def calculate_daily_limit(variable_pockets_balance: float, mock_today: datetime = None):
    """
    Calculates the 'Safe to Spend' daily limit.
    Core Logic: Remaining Variable Money ÷ Remaining Days in Month.
    
    Args:
        variable_pockets_balance (float): The SUM of current_balance for all VARIABLE pockets.
        mock_today (datetime): Optional. Used to force a specific date during hackathon testing.
    """
    # 1. Determine "Today" (Use mock_today for testing, otherwise real system time)
    today = mock_today if mock_today else datetime.now()
    
    # 2. Get the total number of days in the current month
    _, total_days_in_month = calendar.monthrange(today.year, today.month)
    
    # 3. Calculate Days Left (including today)
    days_passed = today.day
    days_left = total_days_in_month - days_passed + 1 
    
    # 4. Handle Edge Cases
    if days_left <= 0:
        days_left = 1 # Prevent division by zero on the absolute last day
        
    if variable_pockets_balance <= 0:
        return 0.00 # User is completely broke in their discretionary funds!
        
    # 5. The Math Engine (The Compass)
    daily_limit = variable_pockets_balance / days_left
    
    return round(daily_limit, 2)
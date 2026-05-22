from database.db import get_user_profile, get_user_pockets, create_notification, _get_supabase_client
from service_module.spending_forecast import allocate_monthly_budget, get_historical_trend
from AI.salary_router_AI import explain_monthly_allocation, refine_forecast_with_ai
from datetime import datetime

def process_lifestyle_limit_update(user_id: str, db=None):
    """
    Triggers a lifestyle limit update analysis and creates a notification.
    Called after onboarding.
    """
    try:
        # 1. Fetch user data
        user = get_user_profile(user_id, db=db)
        if not user:
            print(f"Error: User {user_id} not found for lifestyle update")
            return False
            
        pockets = get_user_pockets(user_id, db=db)
        if not pockets:
            print(f"Error: No pockets found for user {user_id}")
            return False
            
        # 2. Prepare data for forecast
        # We need to map DB pockets to the format expected by allocate_monthly_budget
        user_pockets_data = []
        current_limits = {}
        fixed_expenses_total = 0.0
        
        for p in pockets:
            if p['pocket_type'].upper() == 'FIXED' and p['pocket_name'].lower() != 'savings':
                fixed_expenses_total += float(p.get('monthly_limit') or 0.0)
            
            user_pockets_data.append({
                'pocket_id': p['pocket_id'],
                'pocket_name': p['pocket_name'],
                'parent_category': p['pocket_name'], # Using name as category for now
                'created_at': user['created_at'][:10] if user['created_at'] else datetime.now().strftime('%Y-%m-%d'),
                'previous_limit': float(p.get('monthly_limit') or 0.0)
            })
            current_limits[p['pocket_name']] = float(p.get('monthly_limit') or 0.0)
            
        # 3. Get Forecasted Allocations
        target_month = datetime.now().month
        forecast_results = allocate_monthly_budget(
            user_income=user['monthly_income'],
            savings_mode=user['savings_mode'],
            target_month=target_month,
            fixed_expenses_total=fixed_expenses_total,
            user_pockets_data=user_pockets_data
        )
        
        if isinstance(forecast_results, str):
            print(f"Forecast failed: {forecast_results}")
            return False
            
        # 3.1 AI Refinement Layer (Zero-Sum check across ALL pockets)
        all_pockets_raw = {}
        pocket_id_to_name = {p['pocket_id']: p['pocket_name'] for p in user_pockets_data}
        
        # Build the full list for AI to see
        for p in pockets:
            if p['pocket_type'].upper() == 'FIXED' and p['pocket_name'].lower() != 'savings':
                all_pockets_raw[p['pocket_name']] = float(p.get('monthly_limit') or 0.0)
            elif p['pocket_name'].lower() == 'savings':
                all_pockets_raw[p['pocket_name']] = forecast_results['savings_locked']
            else:
                # Variable pocket
                amount = forecast_results['pocket_allocations'].get(p['pocket_id'], 0.0)
                all_pockets_raw[p['pocket_name']] = amount

        refined_pockets = refine_forecast_with_ai(
            income=user['monthly_income'],
            mode=user['savings_mode'],
            math_forecast=all_pockets_raw
        )

        # 4. Get Historical Trend for AI context
        trend = get_historical_trend()
        
        # 5. Generate AI Message using refined data (now includes the whole RM income context)
        ai_message = explain_monthly_allocation(
            income_amount=user['monthly_income'],
            past_spending_summary=trend,
            new_allocations=refined_pockets
        )
        
        # 6. Save Notification
        notification_id = create_notification(
            user_id=user_id,
            title="Lifestyle Limit Update",
            message=ai_message,
            notification_type="ai_learning",
            db=db
        )
        
        if notification_id:
            print(f"Successfully created lifestyle update notification for user {user_id}")
            return True
        return False
        
    except Exception as e:
        print(f"Error in process_lifestyle_limit_update: {e}")
        return False

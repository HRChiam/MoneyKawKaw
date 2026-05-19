# How to Use the Backend Architecture

## 📁 File Structure

```
backend/
├── main.py                      ← API routes (uses database module)
├── database/
│   ├── __init__.py             ← Package initialization (exports everything)
│   ├── db.py                   ← Database connection + query functions
│   └── models.py               ← Pydantic validation models
├── service_module/             ← Existing ML models (unchanged)
└── AI/                          ← Existing GenAI (unchanged)
```

---

## 🔄 Data Flow (Example: Fetch User Profile)

### Step 1: Frontend Makes Request
```typescript
// app/utils/api.ts
const response = await fetch('http://localhost:8000/api/user/123e4567-e89b-12d3-a456-426614174000')
const userProfile = await response.json()
```

### Step 2: API Route Receives Request
```python
# main.py
@app.get("/api/user/{user_id}", response_model=UserProfileResponse)
async def get_user(user_id: str, db = Depends(get_db)):
    # Route calls database function with db session
    user_profile = get_user_profile(user_id, db=db)
    return user_profile
```

### Step 3: Database Function Executes
```python
# database/db.py
def get_user_profile(user_id: str, db=None):
  supabase = db or _get_supabase_client()
  response = (
    supabase.table("users")
    .select("user_id, username, email, savings_mode, monthly_income, payday, main_balance, current_streak, reward_points, created_at")
    .eq("user_id", str(user_id))
    .single()
    .execute()
  )
  return response.data
```

### Step 4: Response Returned to Frontend
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "email": "john@example.com",
  "monthly_income": 5000,
  "main_balance": 2500,
  "current_streak": 12,
  "reward_points": 450
}
```

---

## 🚀 Available Endpoints

### 1. Get User Profile
```
GET /api/user/{user_id}
Response: UserProfileResponse
```

**Example:**
```bash
curl http://localhost:8000/api/user/123e4567-e89b-12d3-a456-426614174000
```

**Returns:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "email": "john@example.com",
  "savings_mode": "aggressive",
  "monthly_income": 5000,
  "payday": 1,
  "main_balance": 2500,
  "current_streak": 12,
  "reward_points": 450,
  "created_at": "2024-01-15T10:30:00"
}
```
---

## 📋 File Responsibilities

### `database/db.py`
**Contains:**
- Supabase client setup
- Query functions (get_user_profile, get_user_transactions, etc.)

### `database/models.py`
**Contains:**
- Pydantic request validation models
- Pydantic response models
- Type hints and documentation

**Models:**
- `UserProfileResponse` - User data returned from API
- `TransactionResponse` - Single transaction
- `TransactionListResponse` - List of transactions
- `PocketResponse` - Pocket information
- `PocketListResponse` - List of pockets
- `TransactionRequest` - Create transaction request

### `main.py`
**Contains:**
- FastAPI app setup
- CORS configuration
- API route endpoints
- Business logic (calls database module + ML/AI)

**Endpoints:**
- `GET /api/user/{user_id}` - Fetch user profile
- `POST /api/transaction` - Process transaction with ML/AI layers
- `GET /health` - Health check

---

## 🔗 How to Import from Database Module

**In main.py:**
```python
from database import (
    get_db,
    get_user_profile,
    get_user_transactions,
    get_user_pockets,
    save_transaction,
    UserProfileResponse,
    TransactionResponse,
    TransactionListResponse,
    PocketResponse,
    PocketListResponse,
    TransactionRequest,
)

# Use get_db as a FastAPI dependency
@app.get("/api/user/{user_id}", response_model=UserProfileResponse)
async def get_user(user_id: str, db = Depends(get_db)):
    user_profile = get_user_profile(user_id, db=db)
    transactions = get_user_transactions(user_id, db=db)
    pockets = get_user_pockets(user_id, db=db)
    return user_profile
```

---

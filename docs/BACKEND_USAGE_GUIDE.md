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
async def get_user(user_id: str):
    # Route calls database function
    user_profile = get_user_profile(user_id)
    return user_profile
```

### Step 3: Database Function Executes
```python
# database/db.py
def get_user_profile(user_id: str):
  supabase = _get_supabase_client()
  user = (
    supabase.table("users")
    .select("user_id, username, monthly_income")
    .eq("user_id", str(user_id))
    .single()
    .execute()
  )
  return user.data
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

### 2. Get User Transactions
```
GET /api/user/{user_id}/transactions
Response: TransactionListResponse
```

**Example:**
```bash
curl http://localhost:8000/api/user/123e4567-e89b-12d3-a456-426614174000/transactions
```

**Returns:**
```json
{
  "transactions": [
    {
      "transaction_id": "abc123",
      "amount": 50.00,
      "counterparty_name": "Starbucks",
      "transaction_type": "DEBIT",
      "tax_relief_detected": false,
      "tax_category": null,
      "created_at": "2024-01-20T14:30:00"
    },
    {
      "transaction_id": "def456",
      "amount": 150.00,
      "counterparty_name": "Medical Clinic",
      "transaction_type": "DEBIT",
      "tax_relief_detected": true,
      "tax_category": "MEDICAL",
      "created_at": "2024-01-19T10:15:00"
    }
  ],
  "count": 2
}
```

---

### 3. Get User Pockets
```
GET /api/user/{user_id}/pockets
Response: PocketListResponse
```

**Example:**
```bash
curl http://localhost:8000/api/user/123e4567-e89b-12d3-a456-426614174000/pockets
```

**Returns:**
```json
{
  "pockets": [
    {
      "pocket_id": "pocket-001",
      "pocket_name": "F&B",
      "pocket_type": "DISCRETIONARY",
      "monthly_limit": 500,
      "current_balance": 250
    },
    {
      "pocket_id": "pocket-002",
      "pocket_name": "Transport",
      "pocket_type": "DISCRETIONARY",
      "monthly_limit": 300,
      "current_balance": 120
    }
  ],
  "count": 2
}
```

---

### 4. Create Transaction
```
POST /api/transactions/create
Body: TransactionRequest
Response: Success/Error
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/transactions/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "pocket_id": "pocket-001",
    "amount": 45.50,
    "transaction_type": "DEBIT",
    "counterparty_name": "Starbucks",
    "tax_detected": false,
    "tax_category": null,
    "warning_triggered": false
  }'
```

**Returns:**
```json
{
  "status": "success",
  "transaction_id": "tx-789",
  "tax_eligible": false,
  "tax_category": null,
  "message": "Transaction recorded successfully"
}
```

---

## 📋 File Responsibilities

### `database/db.py`
**Contains:**
- Supabase client setup
- Query functions (get_user_profile, get_user_transactions, etc.)

**Example queries:**
```python
# Get user profile
profile = get_user_profile("user_id_here")

# Get user transactions
transactions = get_user_transactions("user_id_here", limit=30)

# Get user pockets
pockets = get_user_pockets("user_id_here")

# Save transaction
tx_id = save_transaction(
    user_id="user_id_here",
    pocket_id="pocket_id_here",
    amount=50.00,
    transaction_type="DEBIT",
    counterparty_name="Starbucks",
    tax_detected=False,
    tax_category=None,
    warning_triggered=False
)
```

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
- `GET /api/user/{user_id}/transactions` - Fetch transactions
- `GET /api/user/{user_id}/pockets` - Fetch pockets
- `POST /api/transactions/create` - Create transaction
- `GET /health` - Health check

---

## 🔗 How to Import from Database Module

**In main.py:**
```python
from database import (
    get_user_profile,
    get_user_transactions,
    get_user_pockets,
    save_transaction,
    UserProfileResponse,
    TransactionListResponse,
    PocketListResponse,
)

# Use them directly
user_profile = get_user_profile("user_id")
transactions = get_user_transactions("user_id")
pockets = get_user_pockets("user_id")
```

---

## 🧪 Testing the API

### 1. Start the backend
```bash
cd backend
python -m venv venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Test user profile endpoint
```bash
curl http://localhost:8000/api/user/123e4567-e89b-12d3-a456-426614174000
```

### 3. Test health
```bash
curl http://localhost:8000/health
```

---

## ✅ What's Working

✅ Supabase connection via `SUPABASE_URL` and `SUPABASE_KEY`
✅ User profile fetching via Supabase
✅ Transaction history via Supabase
✅ Pockets information via Supabase
✅ Transaction creation with Supabase persistence
✅ Tax eligibility detection
✅ API validation with Pydantic models
✅ CORS configured for frontend

---

## 🎯 How to Add More Endpoints

**Pattern:**
```python
@app.get("/api/some-endpoint/{param}")
async def some_endpoint(param: str):
    try:
        # 1. Call database function
        data = get_some_data(param)
        
        # 2. Process data / call ML if needed
        processed = some_ml_function(data)
        
        # 3. Return response
        return processed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 🔐 Supabase Connection

**Set environment variables:**
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-service-role-or-anon-key"
```

Or in `.env` file:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-or-anon-key
```

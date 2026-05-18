# Simplified Backend Architecture for Prototype

## Goal: Build this in 2-3 hours, not 6+

---

## 📁 Minimal File Structure

```
backend/
├── main.py                 # FastAPI app (entry point only)
├── requirements.txt
├── db.py                   # 🆕 Single DB module (connection + queries)
├── models.py               # 🆕 Pydantic models (validation only)
├── service_module/         # EXISTING (ML models - unchanged)
│   ├── check_for_anomaly.py
│   ├── burn_rate_math.py
│   ├── tax_exemption.py
│   └── ...
└── AI/                     # EXISTING (GenAI - unchanged)
    └── ai_brain.py
```

**That's it.** Only 2-3 new files instead of 10+.

---

## 🚀 Phase 1: Database Module (30 min)

**File: `backend/db.py`**

```python
"""
Single DB module that handles:
- Connection
- All queries
- All data preparation
"""

from sqlalchemy import create_engine, Column, String, Float, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import os
import pandas as pd

# ===== SETUP =====
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///moneykawkaw.db")
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# ===== MODELS =====
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True)
    user_id = Column(String)
    merchant = Column(String)
    amount = Column(Float)
    category = Column(String)
    is_anomaly = Column(Boolean, default=False)
    tax_eligible = Column(Boolean, default=False)
    ai_alert = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)


class UserProfile(Base):
    __tablename__ = "user_profiles"
    user_id = Column(String, primary_key=True)
    income = Column(Float)
    daily_limit = Column(Float)
    avg_spend_fbb = Column(Float, default=0)
    avg_spend_transport = Column(Float, default=0)
    avg_spend_groceries = Column(Float, default=0)


# Create tables
Base.metadata.create_all(bind=engine)


# ===== DATABASE FUNCTIONS =====
def get_db():
    """Dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_transactions(user_id: str, days: int = 30):
    """Get recent transactions for analysis"""
    db = SessionLocal()
    from datetime import timedelta
    
    cutoff = datetime.now() - timedelta(days=days)
    txs = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.created_at >= cutoff
    ).all()
    db.close()
    
    return [
        {
            'amount': t.amount,
            'category': t.category,
            'merchant': t.merchant,
        }
        for t in txs
    ]


def get_category_avg(user_id: str, category: str):
    """Get average spending for category"""
    db = SessionLocal()
    from sqlalchemy import func
    
    result = db.query(func.avg(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.category == category
    ).scalar()
    
    db.close()
    return float(result or 0)


def save_transaction(user_id: str, merchant: str, amount: float, category: str, 
                     is_anomaly: bool, tax_eligible: bool, ai_alert: str = None) -> str:
    """Save transaction with analysis"""
    db = SessionLocal()
    import uuid
    
    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        merchant=merchant,
        amount=amount,
        category=category,
        is_anomaly=is_anomaly,
        tax_eligible=tax_eligible,
        ai_alert=ai_alert
    )
    db.add(tx)
    db.commit()
    db.close()
    
    return tx.id


def get_user_profile(user_id: str):
    """Get or create user profile"""
    db = SessionLocal()
    
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()
    
    if not profile:
        profile = UserProfile(
            user_id=user_id,
            income=5000,
            daily_limit=166,
        )
        db.add(profile)
        db.commit()
    
    result = {
        'user_id': profile.user_id,
        'income': profile.income,
        'daily_limit': profile.daily_limit,
    }
    
    db.close()
    return result
```

---

## 🚀 Phase 2: Pydantic Models (10 min)

**File: `backend/models.py`**

```python
from pydantic import BaseModel
from typing import Optional

class TransactionRequest(BaseModel):
    user_id: str
    merchant: str
    amount: float
    category: str


class TransactionResponse(BaseModel):
    transaction_id: str
    status: str  # "success" or "needs_approval"
    is_anomaly: bool
    ai_alert: Optional[str]
    tax_eligible: bool
    tax_category: Optional[str]


class InsightResponse(BaseModel):
    message: str
    forecast: Optional[float]
    data: dict
```

---

## 🚀 Phase 3: Simplified Routes (30 min)

**File: `backend/main.py`** (Refactored)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from models import TransactionRequest, TransactionResponse, InsightResponse
from db import (
    get_user_transactions, 
    get_category_avg,
    save_transaction, 
    get_user_profile,
    get_db
)
from service_module.check_for_anomaly import check_for_anomaly
from service_module.tax_exemption import tag_tax_exemptions_smart
from AI.ai_brain import generate_anomaly_interception, generate_momentum_warning

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== ENDPOINTS =====

@app.post("/api/transactions/create", response_model=TransactionResponse)
async def create_transaction(req: TransactionRequest):
    """
    Process transaction:
    1. Fetch user history
    2. Run anomaly detection
    3. Check tax eligibility
    4. Generate AI alert
    5. Save to DB
    """
    
    try:
        # Get user data
        user_profile = get_user_profile(req.user_id)
        category_avg = get_category_avg(req.user_id, req.category)
        
        # Tax check
        df_tx = pd.DataFrame([{'merchant': req.merchant, 'amount': req.amount}])
        tagged = tag_tax_exemptions_smart(df_tx)
        tax_eligible = tagged['tax_category'].iloc[0] != 'None'
        tax_category = tagged['tax_category'].iloc[0] if tax_eligible else None
        
        # Anomaly detection
        is_anomaly = check_for_anomaly(
            req.amount,
            user_profile['income'],
            category_avg
        )
        
        # AI alert
        ai_alert = None
        if is_anomaly:
            ai_alert = generate_anomaly_interception(
                amount=req.amount,
                merchant=req.merchant,
                category=req.category,
                context={'avg': category_avg}
            )
        
        # Save to DB
        tx_id = save_transaction(
            req.user_id,
            req.merchant,
            req.amount,
            req.category,
            is_anomaly,
            tax_eligible,
            ai_alert
        )
        
        # Return response
        return TransactionResponse(
            transaction_id=tx_id,
            status="needs_approval" if is_anomaly else "success",
            is_anomaly=is_anomaly,
            ai_alert=ai_alert,
            tax_eligible=tax_eligible,
            tax_category=tax_category
        )
    
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/api/insights/{user_id}")
async def get_insights(user_id: str):
    """Get spending insights"""
    try:
        transactions = get_user_transactions(user_id, days=30)
        
        if not transactions:
            return InsightResponse(
                message="Not enough data",
                forecast=0,
                data={}
            )
        
        df = pd.DataFrame(transactions)
        total_spend = df['amount'].sum()
        daily_avg = total_spend / 30
        
        # Generate insight
        insight = generate_momentum_warning(
            forecast_data={'daily_avg': daily_avg},
            current_spend=total_spend,
            user_profile=get_user_profile(user_id)
        )
        
        return InsightResponse(
            message=insight,
            forecast=daily_avg * 30,  # 30 day forecast
            data={
                'total_spend': total_spend,
                'daily_avg': daily_avg,
                'transaction_count': len(transactions)
            }
        )
    
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/transactions/{user_id}")
async def get_transactions(user_id: str):
    """Get transaction history"""
    try:
        transactions = get_user_transactions(user_id)
        return {"data": transactions}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

## 🎯 Phase 4: Frontend Integration (20 min)

**File: `app/utils/api.ts`**

```typescript
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000"

export const api = {
  transactions: {
    create: async (data: any) => {
      const response = await fetch(`${API_BASE}/api/transactions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return response.json()
    },
    
    getHistory: async (userId: string) => {
      const response = await fetch(`${API_BASE}/api/transactions/${userId}`)
      return response.json()
    }
  },
  
  insights: {
    get: async (userId: string) => {
      const response = await fetch(`${API_BASE}/api/insights/${userId}`)
      return response.json()
    }
  }
}
```

---

## 📦 Updated `requirements.txt`

```
fastapi==0.104.0
uvicorn==0.24.0
sqlalchemy==2.0.0
pandas==2.0.0
pydantic==2.0.0
```

---

## 🚀 Quick Start (2-3 hours total)

### Backend Setup
```bash
cd backend
python -m venv venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd app
npm start
```

### Test Endpoint
```bash
curl -X POST http://localhost:8000/api/transactions/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "merchant": "Starbucks",
    "amount": 150,
    "category": "F&B"
  }'
```

---

## ✅ What You Get

✅ DB connection working
✅ Transactions saved to DB
✅ ML anomaly detection using real data
✅ Tax eligibility check
✅ AI alerts generated
✅ Insights endpoint
✅ Frontend can call API

---

## 🎯 Key Differences from Complex Version

| Aspect | Complex | Simple (Prototype) |
|--------|---------|-------------------|
| Files | 10+ | 3 |
| Repository pattern | ✅ Yes | ❌ Simplified |
| Dependency injection | ✅ Yes | ❌ Direct calls |
| DataAggregator class | ✅ Yes | ❌ Inline logic |
| Time to implement | 6+ hours | 2-3 hours |
| Learning curve | High | Low |
| Good for | Production | Prototype/Hackathon |

---

## 📝 Notes

- SQLite by default (0 setup needed)
- Can switch to PostgreSQL by changing `DATABASE_URL`
- All ML models work unchanged
- AI brain works unchanged
- Simple and fast ✅

Ready to implement?

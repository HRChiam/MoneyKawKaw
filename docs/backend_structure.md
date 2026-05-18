# MoneyKawKaw Backend Structure Documentation

## Overview
The MoneyKawKaw backend is a **three-layer intelligence system** that processes financial transactions in real-time and provides smart recommendations. It combines mathematical models, machine learning, and generative AI to help users manage their money wisely.

---

## 📁 Directory Structure

### Root Level

#### `main.py`
**Purpose:** The FastAPI application server that orchestrates all the backend logic.
- Exposes `/api/transaction` endpoint that fires every time a user makes a purchase
- Chains together Tax Check → Anomaly Detection → Burn Rate Risk Prediction → AI-generated alerts
- Returns a response payload with:
  - Tax eligibility status
  - AI-generated alerts for anomalies/warnings
  - Action recommendations for the frontend

**Key Responsibilities:**
1. Validates incoming transaction requests using Pydantic models
2. Runs Layer 1 (Tax), Layer 2 (ML), and Layer 3 (GenAI) in sequence
3. Constructs the response payload to send back to the frontend

---

### 📊 `AI/` Directory

#### `ai_brain.py`
**Purpose:** The generative AI layer that creates human-friendly messages for users.
- Uses **Google Gemini 2.5 Flash** (via LangChain) to generate contextual financial advice
- Bridges the gap between cold ML predictions and warm, conversational guidance

**Key Functions:**

1. **`explain_monthly_allocation()`** (Feature 6 & 8: Smart Monthly Router)
   - Called after `spending_forecast.py` calculates monthly budget allocations
   - Takes the user's income, past spending patterns, and new allocations
   - Returns: A personalized explanation of why money was distributed to specific pockets (with Malaysian slang like "steady, boss")

2. **`generate_momentum_warning()`** (Feature 7: Momentum Warning)
   - Called after `burn_rate_math.py` predicts a potential deficit
   - Takes category, consecutive days over limit, and projected shortfall
   - Returns: A 2-sentence reality check that's direct but empathetic

3. **`generate_anomaly_interception()`** (Feature 2: Real-Time Anomaly Alerts)
   - Called when `check_for_anomaly.py` detects an unusual transaction
   - Returns: A personalized message asking for user consent before processing

---

### 🧮 `service_module/` Directory (The Math & ML Engine)

#### `burn_rate_math.py`
**Purpose:** Predicts whether the user will run out of money before the next paycheck.
- Uses a **scikit-learn Random Forest classifier** trained on historical spending patterns
- Calculates "burn rate" (how fast money is being spent relative to safe limits)

**Key Function:**
- **`predict_deficit_risk(income, variable_balance, days_left, daily_spend_avg)`**
  - Performs feature engineering (safe daily limit, burn rate ratio)
  - Loads trained model from `Notebook/risk_predictor_v2.pkl`
  - Returns: `(is_at_risk: bool, projected_shortfall: float, risk_probability: float)`
  - Example: If Alex earns RM3500, has RM300 left, 10 days remaining, but spends RM45/day (vs. safe limit of RM30), this returns `(True, 150.00, 85.3%)`

---

#### `check_for_anomaly.py`
**Purpose:** Detects suspicious transactions in real-time using anomaly detection.
- Uses **IsolationForest** ML model to flag unusual purchases
- Compares current transaction against user's historical behavior

**Key Function:**
- **`check_for_anomaly(transaction_amount, user_monthly_income, user_avg_category_spend)`**
  - Calculates two ratios: amount-to-income and amount-to-category-average
  - Loads trained model from `Notebook/anomaly_detector.pkl`
  - Returns: `(is_anomaly: bool, reason: str)`
  - Example: RM18 lunch vs. RM15 average = Normal. But RM1200 dinner vs. RM15 average = 🚨 ANOMALY!

---

#### `daily_limit_calculation.py`
**Purpose:** Calculates the user's "Safe to Spend" daily limit based on remaining budget and days left.
- Mathematical logic, no ML required
- Updates daily as the month progresses

**Key Function:**
- **`calculate_daily_limit(total_discretionary, spent_so_far)`**
  - Calculates days remaining in current month (May 2026 hardcoded for now)
  - Returns: `remaining_budget / days_left` rounded to 2 decimal places
  - Example: RM2000 budget, RM500 spent, 21 days left = RM71.43/day limit

---

#### `spending_forecast.py`
**Purpose:** Forecasts optimal monthly budget allocations for each user "pocket" (spending category).
- Uses **Random Forest regressor** trained on historical user behavior, income, savings mode, and season
- Distributes the monthly discretionary budget intelligently across pockets

**Key Function:**
- **`allocate_monthly_budget(user_income, savings_mode, target_month, fixed_expenses_total, user_pockets_data)`**
  - Mandatory savings: 10% of income (enforced first)
  - Discretionary budget: Income - Fixed Expenses - Mandatory Savings
  - For each pocket (e.g., Food, Entertainment):
    - Encodes savings mode and category using label encoders
    - Calculates pocket age (days since created)
    - Uses trained model to predict optimal spend limit
  - Returns: Adjusted allocations that sum to discretionary budget
  - Loads models from `Notebook/spending_forecaster_v2.pkl`, `Notebook/encoder_savings_mode.pkl`, `Notebook/encoder_parent_category.pkl`

---

#### `streak_calculation.py`
**Purpose:** Checks if the user qualifies for a "No-Spend Streak" reward.
- Rewards users who don't spend on discretionary categories for a full day
- Gamification element to encourage smart spending

**Key Function:**
- **`check_no_spend_streak(df_transactions)`**
  - Filters transactions to yesterday only
  - Checks if total discretionary spending (Food, Entertainment, Shopping) = 0
  - Returns: `(streak_earned: bool, message: str)`
  - Example: If user had no discretionary purchases yesterday = 🎉 Streak earned!

---

#### `tax_exemption.py`
**Purpose:** Identifies tax-deductible purchases and tags them for later tax filing.
- **Two-tier system:** Fast dictionary lookup first, then AI fallback for unknowns
- Supports Malaysian LHDN tax relief categories (Tech Relief, Sports Relief, Medical Relief, Childcare Relief)

**Key Function:**
- **`tag_tax_exemptions_smart(df_transactions)`**
  - **Step 1 (Fast):** Dictionary matching against keywords (APPLE, SAMSUNG, DECATHLON, etc.)
  - **Step 2 (AI):** For unknown purchases >RM100, sends to Gemini to categorize
  - Returns: DataFrame with new `tax_category` column
  - Example: "APPLE STORE" → Tech_Relief, "DECATHLON KL" → Sports_Relief

---

### 📓 `Notebook/` Directory (ML Training & Development)

#### `anomaly_detector.ipynb`
**Purpose:** Jupyter notebook for training the anomaly detection model.
- Loads transaction history data
- Trains IsolationForest algorithm
- Evaluates precision/recall and saves model as `anomaly_detector.pkl`

#### `risk_predictor.ipynb`
**Purpose:** Jupyter notebook for training the burn-rate risk prediction model.
- Trains Random Forest classifier on historical monthly deficit patterns
- Features: income, variable balance, days left, daily spend average, burn rate
- Saves model as `risk_predictor_v2.pkl`

#### `spending_forecaster.ipynb`
**Purpose:** Jupyter notebook for training the budget allocation forecaster.
- Trains Random Forest regressor on historical pocket spending patterns
- Considers: user income, savings mode, category, month of year, pocket age, previous limit
- Saves model + label encoders as `spending_forecaster_v2.pkl`, `encoder_savings_mode.pkl`, `encoder_parent_category.pkl`

---

### 📦 Project Dependencies

#### `requirements.txt`
Lists all Python dependencies for the backend:
- **FastAPI** — Web framework for building the REST API
- **Pydantic** — Data validation for API requests
- **pandas** — Data manipulation (for ML features)
- **scikit-learn** — ML library (Random Forest, IsolationForest)
- **joblib** — Model serialization (load .pkl files)
- **LangChain** — Framework for chaining LLM operations
- **langchain-google-genai** — Google Gemini integration
- **python-dotenv** — Load environment variables (GEMINI_API_KEY)

---

## 🔄 Data Flow: A Transaction Example

**Scenario:** Alex buys lunch for RM25

```
Frontend → POST /api/transaction
   ├─ user_income: 3500
   ├─ user_avg_category_spend: 15 (Food average)
   ├─ amount: 25
   ├─ merchant: "KOPITIAM KL"
   ├─ category: "Food"
   ├─ variable_balance: 450
   ├─ days_left: 8
   └─ daily_spend_avg: 35

main.py receives request
   ├─ Layer 1 (Tax): tag_tax_exemptions_smart() → "None" (no relief)
   │
   ├─ Layer 2 (Anomaly): check_for_anomaly(25, 3500, 15) → False (normal)
   │
   ├─ Layer 3 (Burn Rate): predict_deficit_risk(3500, 450, 8, 35)
   │   └─ Safe daily limit = 450/8 = RM56.25
   │   └─ Burn rate = 35/56.25 = 0.62 (OK, below 1.0)
   │   └─ Returns: (False, 0.0, 12.3%) → No risk
   │
   └─ Response to Frontend:
      {
         "status": "success",
         "tax_eligible": false,
         "ai_alert": null,
         "action_required": null
      }

Frontend receives response → Transaction processed! ✅
```

---

## 🎯 Three-Layer Architecture Explained

### Layer 1: Tax Logic (`tax_exemption.py`)
- **Input:** Transaction merchant name and amount
- **Output:** Tax relief category
- **Purpose:** Help users track tax-deductible purchases

### Layer 2: ML Detection (`check_for_anomaly.py` + `burn_rate_math.py`)
- **Input:** Transaction amount + user's income & spending history
- **Output:** Anomaly flag + burn-rate risk assessment
- **Purpose:** Catch unusual behavior and predict month-end deficits

### Layer 3: Generative AI (`ai_brain.py`)
- **Input:** ML predictions + contextual user data
- **Output:** Human-friendly messages with Malaysian slang
- **Purpose:** Explain the "why" behind ML decisions in an empathetic way

---

## 🚀 How to Use

### 1. Setup
```bash
cd backend
python -m venv venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run the Server
```bash
uvicorn main:app --reload
```

### 3. Test the API
```bash
curl -X POST http://localhost:8000/api/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "user_income": 3500,
    "user_avg_category_spend": 15,
    "amount": 25,
    "merchant": "KOPITIAM KL",
    "category": "Food",
    "variable_balance": 450,
    "days_left": 8,
    "daily_spend_avg": 35
  }'
```

---

## 📌 Key Design Patterns

1. **Layered Architecture:** Tax → ML → AI (simple to complex)
2. **Model-as-Code:** ML models loaded at startup, not retrained
3. **Graceful Fallback:** Tax AI kicks in only for large unknowns (>RM100)
4. **Feature Engineering:** All ML inputs are calculated/normalized, not raw
5. **Error Handling:** Models check for division by zero, missing data gracefully

---

## 🔧 Environment Variables Required

```
GEMINI_API_KEY=sk-xxxxx...  # Google AI Studio API key
```

---

## 📝 Notes for Developers

- The hardcoded date in `daily_limit_calculation.py` (May 12, 2026) should be updated to use real `datetime.now()`
- ML models must be retrained periodically as user behavior evolves
- Anomaly detection thresholds can be tuned in `check_for_anomaly.py`
- Tax keywords dictionary in `tax_exemption.py` should expand as new use cases emerge

---

**Last Updated:** May 2026  
**Stack:** FastAPI + scikit-learn + LangChain + Google Gemini

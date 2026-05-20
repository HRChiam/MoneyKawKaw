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

The AI layer is organized into modular, focused modules that use **Google Gemini 2.5 Flash** (via LangChain) to generate contextual financial advice. Each module handles a specific use case.

#### `onboarding_AI.py`
**Purpose:** Provides reality checks on the user's initial budget allocations.
**Key Function:**
- **`reality_check_budget(user_income, allocated_budget)`**
  - Validates budget sanity for new users
  - Returns: Feedback message on budget feasibility

#### `salary_router_AI.py`
- just notification, no allocation action
**Purpose:** Generates personalized explanations for monthly budget allocations (Feature 6 & 8: Smart Monthly Router).
**Key Function:**
- **`explain_monthly_allocation(income_amount, past_spending_summary, new_allocations)`**
  - Called after `spending_forecast.py` calculates monthly budget allocations
  - Takes the user's income, past spending patterns, and new allocations
  - Returns: A personalized explanation of why money was distributed to specific pockets (with Malaysian slang like "steady, boss")

#### `risk_predictor_AI.py`
- ai insight notification, monthly notification
**Purpose:** Generates momentum warnings for spend-rate risks (Feature 7: Momentum Warning).
**Key Function:**
- **`generate_momentum_warning(category, days_over, predicted_shortfall)`**
  - Called after `burn_rate_math.py` predicts a potential deficit
  - Takes category, consecutive days over limit, and projected shortfall
  - Returns: A 2-sentence reality check that's direct but empathetic

#### `anomaly_detection_AI.py`
- upon transaction, notification 
**Purpose:** Generates user-friendly messages for anomalous transactions (Feature 2: Real-Time Anomaly Alerts).
**Key Function:**
- **`generate_anomaly_interception(transaction_amount, merchant)`**
  - Called when `check_for_anomaly.py` detects an unusual transaction
  - Returns: A personalized message asking for user consent before processing

#### `tax_exemption_AI.py`
- upon transaction, notification -> if user press accept, then take receipt action required
**Purpose:** Classifies transactions into Malaysian LHDN tax relief categories.
**Key Function:**
- **`get_tax_category(merchant_name, amount)`**
  - Matches merchant to tax relief category using knowledge base + Gemini AI
  - Supports: Medical, Disability Equipment, Education, Sports, Child Care, EV Charging, etc.
  - Returns: Tax category name or "N/A" if not eligible
  - Example: "APPLE STORE" → "Mobile / Computer Devices", "DECATHLON KL" → "Sports"

#### `debt_routing_AI.py`
- ai insight notification, monthly notification
**Purpose:** Generates debt repayment advice based on user liabilities.
**Key Function:**
- **`generate_debt_advice(surplus, liabilities)`**
  - Creates prioritized debt repayment recommendations
  - Takes surplus amount and list of outstanding debts
  - Returns: Strategic advice on which debt to pay first

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

#### `onboarding_math.py`
**Purpose:** Calculates cold-start budget allocations for new users with no transaction history.
**Key Function:**
- **`calculate_cold_start_budget(monthly_income, fixed_expenses, savings_mode)`**
  - Generates initial budget recommendations for onboarding users
  - Applies savings mode logic (conservative, balanced, aggressive)
  - Returns: Dictionary of initial pocket allocations

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
- **FastAPI** (0.136.1) — Web framework for building the REST API
- **uvicorn** (0.47.0) — ASGI server for running FastAPI
- **Supabase** (2.30.0) — Database and authentication backend
- **pydantic** — Data validation for API requests
- **pandas** (3.0.3) — Data manipulation (for ML features)
- **scikit-learn** (1.7.2) — ML library (Random Forest, IsolationForest)
- **joblib** (1.5.3) — Model serialization (load .pkl files)
- **LangChain** — Framework for chaining LLM operations
- **langchain-google-genai** (4.2.2) — Google Gemini 2.5 Flash integration
- **python-dotenv** (1.2.2) — Load environment variables (GEMINI_API_KEY)

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
   ├─ Layer 1 (Tax): get_tax_category("KOPITIAM KL", 25) → "N/A" (no relief)
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
         "tax_category": "N/A",
         "is_anomaly": false,
         "ai_alert": null,
         "action_required": null
      }

Frontend receives response → Transaction processed! ✅
```

---

## 🎯 Three-Layer Architecture Explained

### Layer 1: Tax Logic (`tax_exemption_AI.py`)
- **Input:** Transaction merchant name and amount
- **Output:** Tax relief category (or "N/A" if not eligible)
- **Purpose:** Help users track tax-deductible purchases; supports Malaysian LHDN reliefs
- **Execution:** Fast dictionary lookup + Gemini AI fallback for unknowns

### Layer 2: ML Detection (`check_for_anomaly.py` + `burn_rate_math.py`)
- **Input:** Transaction amount + user's income & spending history
- **Output:** Anomaly flag + burn-rate risk assessment
- **Purpose:** Catch unusual behavior and predict month-end deficits
- **Execution:** IsolationForest (anomaly) + Random Forest (risk prediction)

### Layer 3: Generative AI (Modular AI Modules)
- **Input:** ML predictions + contextual user data
- **Output:** Human-friendly messages with Malaysian slang
- **Purpose:** Explain the "why" behind ML decisions in an empathetic way
- **Modules:** `anomaly_detection_AI.py`, `risk_predictor_AI.py`, `salary_router_AI.py`, `consent_rebalancing_AI.py`, `debt_routing_AI.py`

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
- Tax knowledge base in `tax_exemption_AI.py` should expand as new Malaysian LHDN reliefs emerge
- All AI modules use Gemini 2.5 Flash with temperature=0.0 for deterministic responses
- Supabase is used for user authentication and transaction data persistence

---

**Last Updated:** May 20, 2026  
**Stack:** FastAPI + Supabase + scikit-learn + LangChain + Google Gemini 2.5 Flash

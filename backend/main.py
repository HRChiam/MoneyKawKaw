from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow your mobile app to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "GX Catalyst Backend is Live!"}

@app.get("/pockets/balances")
def get_balances():
    # Mock data for Day 1
    return {
        "safe_to_spend_today": 45.50,
        "food": 120.00,
        "transport": 50.00
    }
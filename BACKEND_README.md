1. cd backend
2. Create a virtual environment and activate it:
   - For Windows:
     ```
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - For macOS/Linux:
     ```
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```
   uvicorn main:app --reload
   ```
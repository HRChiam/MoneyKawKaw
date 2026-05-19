# Backend Setup Instructions
1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:

   **Windows**

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

   **macOS / Linux**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
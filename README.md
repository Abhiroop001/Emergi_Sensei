# Emergi-Sensei - Accident & Fire Detection System

Emergi-Sensei is an intelligent real-time accident and fire detection monitoring system combining machine learning inference with an interactive dashboard and live camera feeds.

## Project Structure
- `frontend/`: React + Vite web dashboard for real-time surveillance, CCTV monitoring, incident alerts, analysis, and camera stream integration.
- `backend/`: FastAPI backend providing inference endpoints, real-time alert dispatching, analytics, and camera stream processing.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python run.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

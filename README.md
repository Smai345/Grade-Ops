# Grade Ops

## Overview
Grade Ops is a student grading project with:
- a React + Vite frontend (`frontend/`)
- a Node.js Express file upload backend (`backend/`)
- a Python FastAPI grading pipeline with handwriting extraction (`ml_pipeline/`)

> Note: The React frontend is configured to use the Python grading backend at `VITE_API_URL`.

## Repository Structure
- `frontend/` — React application for uploading student work and showing grading results.
- `backend/` — Express upload API for file handling and PostgreSQL health checks.
- `ml_pipeline/` — Python grading backend that extracts handwriting and returns a score using Gemini.

## Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database for the backend
- Gemini API key for the ML pipeline

## Setup

### 1. Frontend
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/` with:
```bash
VITE_API_URL=http://localhost:8000
```
Run:
```bash
npm run dev
```

> Do not commit `frontend/.env` to Git. Instead, share `frontend/.env.example`.

### 2. Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` with:
```bash
DB_USER=postgres
DB_HOST=localhost
DB_NAME=gradeops
DB_PASSWORD=your_db_password
DB_PORT=5432
```
Run:
```bash
npm start
```

> Do not commit `backend/.env` to Git. Instead, share `backend/.env.example`.

### 3. Python ML Pipeline
```bash
cd ml_pipeline
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
Set your Gemini API key in your shell:
```bash
set GEMINI_API_KEY=your_api_key
```
Run:
```bash
python server.py
```

> Do not commit `ml_pipeline/.env` to Git. Instead, share `ml_pipeline/.env.example`.

## Notes
- `frontend/src/App.jsx` is configured to use `VITE_API_URL` and expects the grading backend route `/api/grade`.
- `backend/db.js` is updated to read PostgreSQL credentials from environment variables.
- If you only want to use the local Python grading backend, keep `VITE_API_URL=http://localhost:8000`.

## GitHub Push
```bash
git add .
git commit -m "Add project README and setup documentation"
git push origin main
```

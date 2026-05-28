# Grade Ops Frontend

This is the React + Vite frontend for the Grade Ops project.

## What it does
- Uploads a student submission image
- Sends the image to the grading backend
- Displays a predicted score, justification, and extracted text
- Supports keyboard shortcuts: `A` to approve, `O` to override

## Local setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:
```bash
VITE_API_URL=http://localhost:8000
```

Run the app:
```bash
npm run dev
```

## Notes
- The frontend is configured to post to `/api/grade` on the backend defined by `VITE_API_URL`.
- For the full project setup, see the repository root `README.md`.

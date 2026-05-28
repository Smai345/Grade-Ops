from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from extract import extract_handwriting
from grader import app as grading_agent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://stalwart-ganache-3decb3.netlify.app"
    ],  
    allow_credentials=True,  
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/grade")
async def process_exam(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        extracted_text = extract_handwriting(temp_path)
        initial_state = {"extracted_text": extracted_text}
        result = grading_agent.invoke(initial_state)
        
        return {
            "score": result.get("score"),
            "justification": result.get("justification"),
            "extracted_text": extracted_text
        }
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
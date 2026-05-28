import json
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from google import genai
from pydantic import BaseModel

import os
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 1. Define State (The memory passed between nodes)
class AgentState(TypedDict):
    extracted_text: str
    is_relevant: str
    score: float
    justification: str

# 2. Define Schemas
class RelevanceCheck(BaseModel):
    is_relevant: str # 'yes' or 'no'

class GradeResult(BaseModel):
    score: float
    justification: str

RUBRIC = "Total: 10 marks. 5 for mentioning 'package.json/requirements.txt'. 5 for preventing conflicts."

# 3. Define Nodes (The AI Agents)
def check_relevance(state: AgentState):
    print("-> Checking if text is a valid answer...")
    prompt = f"Is this text attempting to answer a programming question? Text: {state['extracted_text']}"
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config={'response_mime_type': 'application/json', 'response_schema': RelevanceCheck}
    )
    is_relevant = "yes" if "yes" in response.text.lower() else "no"
    return {"is_relevant": is_relevant}

def grade_answer(state: AgentState):
    print("-> Grading the relevant answer...")
    prompt = f"Rubric: {RUBRIC}\nStudent Answer: {state['extracted_text']}\nGrade it."
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config={'response_mime_type': 'application/json', 'response_schema': GradeResult}
    )
    data = json.loads(response.text)
    return {"score": data.get("score") , "justification": data.get("justification")}

def reject_answer(state: AgentState):
    print("-> Rejecting irrelevant answer...")
    return {"score": 0.0, "justification": "The extracted text is irrelevant or unreadable."}

# 4. Define Routing Edge
def route_relevance(state: AgentState):
    return "grade" if state["is_relevant"] == "yes" else "reject"

# 5. Build Graph
workflow = StateGraph(AgentState)
workflow.add_node("relevance_checker", check_relevance)
workflow.add_node("grade_node", grade_answer)
workflow.add_node("reject_node", reject_answer)

workflow.add_edge(START, "relevance_checker")
workflow.add_conditional_edges(
    "relevance_checker", 
    route_relevance, 
    {"grade": "grade_node", "reject": "reject_node"}
)
workflow.add_edge("grade_node", END)
workflow.add_edge("reject_node", END)

app = workflow.compile()

# --- Run the End-to-End Pipeline ---
if __name__ == "__main__":
    # 1. Import your vision script
    from extract import extract_handwriting
    
    test_img_path = "test2.jpg"
    
    try:
        # Step 1: Extract text using Gemini Vision
        print(f"\n--- STEP 1: VISION EXTRACTION ---")
        live_text = extract_handwriting(test_img_path)
        print(f"Extracted: {live_text}")
        
        # Step 2: Grade the text using LangGraph
        print(f"\n--- STEP 2: AGENTIC GRADING ---")
        initial_state = {"extracted_text": live_text}
        result = app.invoke(initial_state)
        
        print("\n--- FINAL JSON RESULT ---")
        print(f"Score: {result.get('score')}/10.0")
        print(f"Justification: {result.get('justification')}")
        
    except Exception as e:
        import traceback
        print("\n--- ERROR ---")
        traceback.print_exc()
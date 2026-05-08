from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Travel Engine API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.get("/")
def read_root():
    return {"message": "Welcome to the Travel Engine API"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Retrieve the last message
    last_message = request.messages[-1].content
    
    # Simple Mock Logic for the AI Agent
    # In a real app, this connects to an LLM prompted with agent.md instructions
    lower_message = last_message.lower()
    
    if "delhi" in lower_message and "kerala" in lower_message:
        response_text = "Namaste! That sounds like an epic cross-country adventure. Since you're on a tight budget, I highly recommend taking the train. To break up the long journey and see something amazing in the middle, how about a 2-day stopover in **Gokarna** or **Hampi** in Karnataka?"
    else:
        response_text = f"Namaste! You said: '{last_message}'. Where are you starting from, where do you want to go, and what is your travel style (backpacker, standard, luxury)?"
        
    return {"role": "assistant", "content": response_text}

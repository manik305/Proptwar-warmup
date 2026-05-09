from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from openai import OpenAI
from dotenv import load_dotenv

# Get the directory where main.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(BASE_DIR, '.env')

load_dotenv(dotenv_path=dotenv_path, override=False)

app = FastAPI(title="SafarEngine API", version="1.0.0")

# ── Health check (required by Cloud Run liveness probe) ──────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "safar-backend"}

# Setup CORS — allow localhost + any Cloud Run / custom domain
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:80",
    os.getenv("FRONTEND_URL", ""),
    # Cloud Run auto-generated URLs pattern
    "https://safar-frontend-*.run.app",
]
# Filter empty strings
allowed_origins = [o for o in allowed_origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Lock down to allowed_origins post-launch
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# System Prompt based on agent.md
SYSTEM_PROMPT = """
# Core Agent Identity
Role: You are "Safar", an expert, friendly, and highly knowledgeable Indian travel assistant.
Tone: Enthusiastic, helpful, practical, and culturally aware.

# Core Directives
1. Indian Destinations Only: You must focus exclusively on Indian travel destinations. If a user asks for international locations, politely redirect them to Indian alternatives.
2. Complete Travel Plan: When a user provides their trip details (name, origin, destination, dates, members), you must immediately generate a highly detailed and beautifully formatted travel plan.
3. Content of the Plan:
   - Primary Locations: Show all major locations covered in that specific destination.
   - Budget Breakdown: Provide a realistic estimated budget based on the number of adults/children.
   - Transportation: Best ways to reach the destination from their origin and how to travel locally.
   - Accommodation & Food: Suggest standard/budget/luxury options depending on context, along with famous local food spots.
   - Middle-of-the-trip Stops: Suggest 1 or 2 logical, beautiful pit stops or layovers depending on the mode of transport.
   - Practical Tips: Weather during their dates, packing tips, and local cultural etiquette.

Format your response using Markdown (bold text, bullet points) to make it highly readable and visually appealing. Always address the user by their name if provided!
"""

@app.get("/")
def read_root():
    return {"message": "Welcome to the Travel Engine API"}

@app.get("/api/trips")
def get_trips():
    return [
        {
            "id": 1,
            "name": "Jaipur, Rajasthan",
            "short_description": "The Pink City's royal heritage.",
            "full_description": "Jaipur, the capital of India's Rajasthan state, evokes the royal family that once ruled the region and that, in 1727, founded what is now called the Old City, or 'Pink City' for its trademark building color. Explore the magnificent Amer Fort, Hawa Mahal, and the City Palace. Perfect for history buffs and culture enthusiasts.",
            "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2940&auto=format&fit=crop",
            "price": "₹12,000"
        },
        {
            "id": 2,
            "name": "Kerala Backwaters",
            "short_description": "God's own country backwaters.",
            "full_description": "The Kerala backwaters are a network of brackish lagoons and lakes lying parallel to the Arabian Sea coast of Kerala state in southern India. Experience the serene beauty on a traditional houseboat, surrounded by lush palm trees, diverse wildlife, and peaceful village life.",
            "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2832&auto=format&fit=crop",
            "price": "₹18,000"
        },
        {
            "id": 3,
            "name": "North East India",
            "short_description": "Misty hills, tribes & wild forests.",
            "full_description": "North East India is one of the most breathtaking and unexplored regions of the country, comprising eight sisters states — Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, and Sikkim. From the living root bridges of Cherrapunji and the tea gardens of Assam to the monasteries of Sikkim and the tribal cultures of Nagaland, the North East is a paradise for adventure lovers, nature enthusiasts, and culture seekers alike.",
            "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2940&auto=format&fit=crop",
            "price": "₹20,000"
        },
        {
            "id": 4,
            "name": "Goa Beaches",
            "short_description": "Sun, sand, and vibrant nightlife.",
            "full_description": "Goa is a state in western India with coastlines stretching along the Arabian Sea. Its long history as a Portuguese colony prior to 1961 is evident in its preserved 17th-century churches and the area's tropical spice plantations. Goa is also known for its beaches, ranging from popular stretches at Baga and Palolem to those in laid-back fishing villages.",
            "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2874&auto=format&fit=crop",
            "price": "₹15,000"
        },
        {
            "id": 5,
            "name": "Varanasi",
            "short_description": "Spiritual capital of India.",
            "full_description": "Varanasi is a city in the northern Indian state of Uttar Pradesh dating to the 11th century B.C. Regarded as the spiritual capital of India, the city draws Hindu pilgrims who bathe in the Ganges River's sacred waters and perform funeral rites. Along the city's winding streets are some 2,000 temples, including Kashi Vishwanath.",
            "image": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=2952&auto=format&fit=crop",
            "price": "₹8,000"
        },
        {
            "id": 6,
            "name": "Ladakh",
            "short_description": "The Land of High Passes.",
            "full_description": "Ladakh is most famous for breathtaking landscapes, the crystal clear skies, the highest mountain passes, thrilling adventure activities, Buddhist Monasteries and festivals. Renowned as the cold desert, Ladakh offers stunning views of Pangong Lake, Nubra Valley, and Magnetic Hill.",
            "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2940&auto=format&fit=crop",
            "price": "₹25,000"
        }
    ]

from dotenv import dotenv_values

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # 1. Check environment (for Cloud Run / Secrets)
    api_key = os.getenv("EURI_API_KEY")
    source = "environment"
    
    if api_key:
        api_key = api_key.strip().replace('"', '').replace("'", "")
        # Remove "Bearer " prefix if the user accidentally included it
        if api_key.lower().startswith("bearer "):
            api_key = api_key[7:].strip()
        
    # 2. Fallback to .env for local development
    if not api_key or api_key == "YOUR_EURI_API_KEY" or not api_key.strip():
        source = ".env file"
        config = dotenv_values(dotenv_path)
        api_key = config.get("EURI_API_KEY", "").strip().replace('"', '').replace("'", "")
        if api_key.lower().startswith("bearer "):
            api_key = api_key[7:].strip()
        
    if not api_key or api_key == "YOUR_EURI_API_KEY" or not api_key.strip():
        print("ERROR: EURI_API_KEY is missing or invalid.")
        raise HTTPException(status_code=500, detail="EURI_API_KEY not configured. Please check Secret Manager.")
    
    # Diagnostics
    key_len = len(api_key)
    masked_key = f"{api_key[:4]}...{api_key[-4:]}" if key_len > 8 else "****"
    print(f"DEBUG: Loaded API key from {source}. Length: {key_len}, Pattern: {masked_key}")
        
    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.euron.one/api/v1/euri"
        )
        
        # Convert incoming messages to OpenAI format
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        for msg in request.messages:
            # Map roles properly. OpenAI uses 'assistant' instead of 'model'
            role = 'user' if msg.role == 'user' else 'assistant'
            messages.append({"role": role, "content": msg.content})
            
        response = client.chat.completions.create(
            model="gemini-3.0-flash",
            messages=messages,
            temperature=0.7
        )
        
        return {"role": "assistant", "content": response.choices[0].message.content}
    except Exception as e:
        error_msg = str(e)
        print(f"CRITICAL ERROR in chat_endpoint: {error_msg}")
        
        # Specific handling for 401 format errors
        if "401" in error_msg or "authentication" in error_msg.lower():
            raise HTTPException(
                status_code=401, 
                detail=f"API Key Authentication Failed: {error_msg}. Key length used: {len(api_key)}. Pattern: {api_key[:4]}...{api_key[-4:]}. Please ensure Secret Manager contains ONLY the raw key."
            )
        
        if "insufficient_quota" in error_msg:
            error_msg = "EURI API Quota exceeded. Please check your EURI account."
            
        raise HTTPException(status_code=500, detail=error_msg)

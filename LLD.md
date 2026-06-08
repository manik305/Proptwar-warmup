# Low-Level Design (LLD) — Safar Travel Planning & Experience Engine

## 1. Frontend Architecture (React + TypeScript)
The frontend is a single-page application (SPA) structured around a clean component hierarchy and state-driven rendering.

### 1.1 Key Modules & State Elements
- **Active View State**: Manages whether the user is viewing the "Home", "Destinations", or "Saved Itineraries" views.
- **Chat State**:
  - `messages`: Array of `ChatMessage` objects containing `role` ('user' | 'assistant') and `content` (string).
  - `isOpen`: Boolean governing the visibility of the Safar Chat Drawer.
  - `isLoading`: Boolean tracking active API roundtrips.
- **Destinations State**: Static or fetched list of Indian tourist hubs (Jaipur, Kerala, North East, Goa, Varanasi, Ladakh) with dynamic search filters.

### 1.2 Component Hierarchy
- **Header**: Navigation bar containing brand logo, links, and action button to toggle the Chatbot.
- **Hero / Showcase**: Visually striking section featuring premium gradients, typography, and call-to-actions.
- **DestinationGrid / Card**: Displays curated cards using glassmorphism effects (`backdrop-blur-md bg-white/10 border border-white/20`).
- **SafarChatDrawer**: Slide-in component housing message threads. Autoscrolls on new replies and parses markdown inside message bubbles.

---

## 2. Backend Architecture (FastAPI)
The backend is structured around a single-file FastAPI routing module (`main.py`) optimized for swift request processing.

### 2.1 API Endpoint Specifications

#### `GET /health`
Liveness/readiness probe used by Cloud Run.
- **Response**: `{"status": "ok", "service": "safar-backend"}`

#### `GET /api/trips`
Returns hardcoded details on the 6 featured Indian destinations.
- **Response Schema**:
  ```json
  [
    {
      "id": 1,
      "name": "Jaipur, Rajasthan",
      "short_description": "...",
      "full_description": "...",
      "image": "https://..."
    }
  ]
  ```

#### `POST /api/chat`
Handles AI chatbot conversation routing.
- **Request Body Schema (Pydantic)**:
  ```python
  class ChatMessage(BaseModel):
      role: str
      content: str

  class ChatRequest(BaseModel):
      messages: List[ChatMessage]
  ```
- **Response**: `{"role": "assistant", "content": "..."}`

### 2.2 LLM Configuration & System Directives
The system prompt enforces strict guardrails:
- Focus exclusively on Indian tourist sites.
- Format responses in markdown with rich structure (bullet points, bold text).
- Construct day-by-day travel plans covering lodging, food, route stops, and destination details.

---

## 3. DevOps & Containerization

### 3.1 Dockerization
- **Backend**: Uses a base `python:3.10-slim` image, installs requirements from `requirements.txt`, and launches via `uvicorn main:app --host 0.0.0.0 --port 8000`.
- **Frontend**: Utilizes a Node-based environment to build static production assets, served via an efficient web server (or standalone static serving layer).

### 3.2 Infrastructure & Deployment Path
- **Terraform (`/terraform`)**:
  - Sets up the Artifact Registry repository.
  - Deploys Cloud Run services for the frontend and backend.
  - Manages permissions for service accounts.
- **CI/CD (`.github/workflows/deploy.yml`)**:
  - Automatically runs on push/pull requests to the `main` branch.
  - Re-applies Terraform config, builds the Docker containers, tags them, and pushes them to GCP Artifact Registry.
  - Re-deploys the services on Cloud Run.

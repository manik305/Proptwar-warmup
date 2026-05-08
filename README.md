# Travel Planning & Experience Engine

A dynamic trip-planning platform for India's top tourist destinations, featuring an interactive AI chatbot that provides real-time, personalized itineraries based on user preferences.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Design System:** Generated via Stitch UI based on `DESIGN.md`

## Features
- AI Chatbot Assistant for instant travel planning.
- Dynamic itinerary generation for popular Indian locations (e.g., Goa, Jaipur, Kerala).
- Destination showcase with rich, premium UI elements (glassmorphism, modern typography).
- Responsive, mobile-first design.

## Folder Structure
- `/frontend`: Contains the React/TypeScript/Tailwind web application.
- `/backend`: Contains the FastAPI backend and AI integration.

## Setup Instructions

### Backend (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend (React + TypeScript + Tailwind)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Design Specifications
Please refer to [DESIGN.md](./DESIGN.md) for detailed UI/UX guidelines and the design system overview.

## Product Requirements
Please refer to [PRD.md](./PRD.md) for the complete product requirements and features.

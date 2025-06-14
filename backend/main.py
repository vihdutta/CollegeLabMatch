from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from services.vector_service import VectorService
from services.pinecone_service import PineconeService
from models.lab_models import LabMatch, UserQuery

app = FastAPI(title="College Lab Match API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vector_service = VectorService()
pinecone_service = PineconeService()

# Mount static files for frontend
app.mount("/static", StaticFiles(directory="/app/frontend"), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    with open("/app/frontend/index.html", "r") as f:
        return HTMLResponse(content=f.read())


@app.post("/api/search-labs", response_model=List[LabMatch])
async def search_labs(query: UserQuery):
    try:
        # Vectorize user query
        query_vector = vector_service.vectorize_text(query.keywords)

        # Search similar labs in Pinecone
        matches = pinecone_service.search_similar_labs(
            query_vector=query_vector, top_k=query.max_results
        )

        return matches

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.post("/api/add-lab")
async def add_lab(lab_data: Dict[str, Any]):
    """
    Add a new lab to the vector database (admin endpoint)
    """
    try:
        # Vectorize lab description
        description = f"{lab_data.get('name', '')} {lab_data.get('description', '')} {lab_data.get('research_areas', '')}"
        lab_vector = vector_service.vectorize_text(description)

        # Store in Pinecone
        success = pinecone_service.upsert_lab(
            lab_id=lab_data.get("id"), vector=lab_vector, metadata=lab_data
        )

        if success:
            return {"message": "Lab added successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to add lab")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add lab: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)

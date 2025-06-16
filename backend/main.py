from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from services.vector_service import VectorService
from services.pinecone_service import PineconeService
from models.lab_models import LabMatch, UserQuery, UserQueryWithFile

app = FastAPI(title="UM Robotics Lab Match API", version="1.0.0")

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
import os
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/static", StaticFiles(directory=frontend_path), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    frontend_index = os.path.join(frontend_path, "index.html")
    with open(frontend_index, "r") as f:
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


@app.post("/api/search-labs-with-resume", response_model=List[LabMatch])
async def search_labs_with_resume(
    max_results: int = Form(10),
    search_type: str = Form("text"),
    keywords: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None)
):
    """
    Search labs with either text keywords or resume file
    """
    try:
        query_text = ""
        
        if search_type == "resume" and resume_file:
            # Validate file type
            if not resume_file.filename:
                raise HTTPException(status_code=400, detail="No file selected")
            
            file_extension = resume_file.filename.lower().split('.')[-1]
            if file_extension not in ['pdf', 'docx', 'doc']:
                raise HTTPException(
                    status_code=400, 
                    detail="Unsupported file type. Please upload PDF or DOCX files."
                )
            
            # Read file content
            file_content = await resume_file.read()
            
            # Extract text from resume
            resume_text = vector_service.extract_text_from_resume(file_content, resume_file.filename)
            
            # Extract research interests from resume
            query_text = vector_service.extract_research_interests_from_resume(resume_text)
            
            if not query_text.strip():
                raise HTTPException(
                    status_code=400, 
                    detail="Could not extract research interests from resume. Please try with text input."
                )
        
        elif search_type == "text" and keywords:
            query_text = keywords
        
        else:
            raise HTTPException(status_code=400, detail="Please provide either keywords or upload a resume")
        
        # Vectorize the query text
        query_vector = vector_service.vectorize_text(query_text)
        
        # Search similar labs in Pinecone
        matches = pinecone_service.search_similar_labs(
            query_vector=query_vector, top_k=max_results
        )
        
        return matches
        
    except HTTPException:
        raise
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

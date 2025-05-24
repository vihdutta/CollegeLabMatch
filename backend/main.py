from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
import time
import asyncio

from .db import get_db, init_db
from .parse import extract_text_from_file, clean_text
from .match import create_embedding, find_matching_labs, get_available_universities

app = FastAPI(title="College Research Match API")

# cors for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchRequest(BaseModel):
    text: str
    university: str

class MatchResponse(BaseModel):
    labs: List[dict]
    processing_time: float

# global variable to track matching progress
matching_progress = {"status": "idle", "progress": 0}

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "College Research Match API"}

@app.get("/universities")
async def get_universities(db: Session = Depends(get_db)):
    """get list of available universities"""
    try:
        universities = get_available_universities(db)
        return {"universities": universities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match", response_model=MatchResponse)
async def match_labs(
    request: MatchRequest,
    db: Session = Depends(get_db)
):
    """match user input to research labs"""
    start_time = time.time()
    
    try:
        # update progress
        global matching_progress
        matching_progress = {"status": "processing", "progress": 10}
        
        # clean input text
        cleaned_text = clean_text(request.text)
        if not cleaned_text.strip():
            raise HTTPException(status_code=400, detail="no valid text provided")
        
        matching_progress["progress"] = 30
        await asyncio.sleep(0.1)  # allow progress update
        
        # create embedding
        embedding = create_embedding(cleaned_text)
        matching_progress["progress"] = 60
        await asyncio.sleep(0.1)
        
        # find matching labs
        labs = find_matching_labs(embedding, request.university, db)
        matching_progress["progress"] = 90
        await asyncio.sleep(0.1)
        
        processing_time = time.time() - start_time
        matching_progress = {"status": "complete", "progress": 100}
        
        return MatchResponse(labs=labs, processing_time=processing_time)
        
    except Exception as e:
        matching_progress = {"status": "error", "progress": 0}
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match/file")
async def match_from_file(
    file: UploadFile = File(...),
    university: str = Form(...),
    db: Session = Depends(get_db)
):
    """match uploaded file content to research labs"""
    start_time = time.time()
    
    try:
        global matching_progress
        matching_progress = {"status": "processing", "progress": 5}
        
        # read and parse file
        file_content = await file.read()
        matching_progress["progress"] = 20
        
        extracted_text = extract_text_from_file(file_content, file.filename)
        cleaned_text = clean_text(extracted_text)
        
        if not cleaned_text.strip():
            raise HTTPException(status_code=400, detail="no valid text extracted from file")
        
        matching_progress["progress"] = 40
        await asyncio.sleep(0.1)
        
        # create embedding
        embedding = create_embedding(cleaned_text)
        matching_progress["progress"] = 70
        await asyncio.sleep(0.1)
        
        # find matching labs
        labs = find_matching_labs(embedding, university, db)
        matching_progress["progress"] = 90
        await asyncio.sleep(0.1)
        
        processing_time = time.time() - start_time
        matching_progress = {"status": "complete", "progress": 100}
        
        return MatchResponse(labs=labs, processing_time=processing_time)
        
    except Exception as e:
        matching_progress = {"status": "error", "progress": 0}
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/progress")
async def get_progress():
    """get current matching progress for real-time updates"""
    return matching_progress 
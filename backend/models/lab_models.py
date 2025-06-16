from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserQuery(BaseModel):
    """Model for user search queries"""
    keywords: str = Field(..., description="User's research interests and keywords")
    max_results: int = Field(default=10, ge=1, le=50, description="Maximum number of results to return")

class UserQueryWithFile(BaseModel):
    """Model for user search queries with optional file upload"""
    keywords: Optional[str] = Field(None, description="User's research interests and keywords")
    max_results: int = Field(default=10, ge=1, le=50, description="Maximum number of results to return")
    search_type: str = Field(default="text", description="Type of search: 'text' or 'resume'")

class LabInfo(BaseModel):
    """Model for lab information"""
    id: str
    name: str
    professor: str
    description: str
    research_areas: List[str]
    website: Optional[str] = None
    email: Optional[str] = None

class LabMatch(BaseModel):
    """Model for lab search results with similarity scores"""
    lab: LabInfo
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score between 0 and 1")

class PineconeMatch(BaseModel):
    """Model for raw Pinecone search results"""
    id: str
    score: float
    metadata: Dict[str, Any] 
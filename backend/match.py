from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
import numpy as np
from .db import Lab

# load model once at module level for efficiency
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def create_embedding(text: str) -> List[float]:
    """create embedding vector from text using sentence transformer"""
    embedding = model.encode(text)
    return embedding.tolist()

def find_matching_labs(
    user_embedding: List[float], 
    university: str,
    db: Session,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """find labs matching user input using cosine similarity"""
    
    # convert list to numpy array for pgvector
    embedding_str = str(user_embedding)
    
    # use pgvector cosine similarity operator
    query = text("""
        SELECT 
            id, name, university, pi, email, summary,
            1 - (embedding <=> :user_embedding) as similarity_score
        FROM labs 
        WHERE university = :university
        ORDER BY embedding <=> :user_embedding
        LIMIT :limit
    """)
    
    result = db.execute(query, {
        'user_embedding': embedding_str,
        'university': university,
        'limit': limit
    })
    
    labs = []
    for row in result:
        labs.append({
            'id': row.id,
            'name': row.name,
            'university': row.university,
            'pi': row.pi,
            'email': row.email,
            'summary': row.summary,
            'similarity_score': float(row.similarity_score)
        })
    
    return labs

def get_available_universities(db: Session) -> List[str]:
    """get list of available universities in database"""
    result = db.execute(text("SELECT DISTINCT university FROM labs ORDER BY university"))
    return [row.university for row in result] 
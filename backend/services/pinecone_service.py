from pinecone import Pinecone, ServerlessSpec
import os
import logging
from typing import List, Dict, Any, Optional
import numpy as np

from ..models.lab_models import LabMatch, LabInfo, PineconeMatch

logger = logging.getLogger(__name__)

class PineconeService:
    def __init__(self):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = "collegelabmatch"  # Hardcoded index name
        self.pc = None
        self.index = None
        
        if not self.api_key:
            logger.warning("PINECONE_API_KEY not found in environment variables")
            return
            
        self._initialize_pinecone()
    
    def _initialize_pinecone(self):
        try:
            self.pc = Pinecone(api_key=self.api_key)
            
            # Use existing hardcoded index - don't create dynamically
            self.index = self.pc.Index(self.index_name)
            logger.info(f"Connected to Pinecone index: {self.index_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {e}")
            raise
    
    def upsert_lab(self, lab_id: str, vector: np.ndarray, metadata: Dict[str, Any]) -> bool:
        """
        Store or update a lab in the vector database
        
        Args:
            lab_id: Unique identifier for the lab
            vector: Vector embedding of lab description
            metadata: Lab metadata (name, description, etc.)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.index:
            logger.error("Pinecone index not initialized")
            return False
        
        try:
            vector_list = vector.tolist()
            self.index.upsert(
                vectors=[(lab_id, vector_list, metadata)]
            )
            
            logger.info(f"Successfully upserted lab {lab_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to upsert lab {lab_id}: {e}")
            return False
    
    def search_similar_labs(self, query_vector: np.ndarray, top_k: int = 10) -> List[LabMatch]:
        """
        Search for labs similar to the query vector
        
        Args:
            query_vector: Vector embedding of user query
            top_k: Number of results to return
            
        Returns:
            List of matching labs with similarity scores
        """
        if not self.index:
            logger.error("Pinecone index not initialized")
            return []
        
        try:
            query_list = query_vector.tolist()
            
            search_results = self.index.query(
                vector=query_list,
                top_k=top_k,
                include_metadata=True
            )
            
            matches = []
            for match in search_results.matches:
                try:
                    lab_info = LabInfo(**match.metadata)
                    lab_match = LabMatch(
                        lab=lab_info,
                        similarity_score=float(match.score)
                    )
                    matches.append(lab_match)
                except Exception as e:
                    logger.warning(f"Failed to parse lab match: {e}")
                    continue
            
            logger.info(f"Found {len(matches)} matching labs")
            return matches
            
        except Exception as e:
            logger.error(f"Failed to search labs: {e}")
            return []
    

    
    def get_lab_count(self) -> int:
        if not self.index:
            return 0
        
        try:
            stats = self.index.describe_index_stats()
            return stats.total_vector_count
        except Exception as e:
            logger.error(f"Failed to get lab count: {e}")
            return 0
    
    def delete_lab(self, lab_id: str) -> bool:
        if not self.index:
            logger.error("Pinecone index not initialized")
            return False
        
        try:
            self.index.delete(ids=[lab_id])
            logger.info(f"Successfully deleted lab {lab_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete lab {lab_id}: {e}")
            return False 
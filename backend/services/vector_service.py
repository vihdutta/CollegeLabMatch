from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Union
import logging

logger = logging.getLogger(__name__)

class VectorService:    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        try:
            logger.info(f"Loading sentence transformer model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model {self.model_name}: {e}")
            raise
    
    def vectorize_text(self, text: Union[str, List[str]]) -> Union[np.ndarray, List[np.ndarray]]:
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        try:
            if isinstance(text, str):
                if not text.strip():
                    raise ValueError("Input text cannot be empty")
            elif isinstance(text, list):
                if not text or all(not t.strip() for t in text):
                    raise ValueError("Input text list cannot be empty")
            
            embeddings = self.model.encode(text, convert_to_numpy=True)

            if embeddings.ndim == 1:
                embeddings = embeddings / np.linalg.norm(embeddings)
            else:
                embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Error vectorizing text: {e}")
            raise
    

    
    def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        try:
            embedding1 = embedding1 / np.linalg.norm(embedding1)
            embedding2 = embedding2 / np.linalg.norm(embedding2)

            similarity = np.dot(embedding1, embedding2)

            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Error computing similarity: {e}")
            raise 
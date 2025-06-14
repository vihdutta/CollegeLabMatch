import numpy as np
from typing import List, Union
import logging
import os

logger = logging.getLogger(__name__)

class VectorService:    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._setup_client()
    
    def _setup_client(self):
        """Setup the Hugging Face Inference Client"""
        try:
            from huggingface_hub import InferenceClient
            
            hf_token = os.getenv("HF_TOKEN")
            if not hf_token:
                logger.warning("HF_TOKEN not found. API calls may be rate limited.")
                self.client = InferenceClient()
            else:
                self.client = InferenceClient(
                    provider="hf-inference",
                    api_key=hf_token
                )
            
            logger.info(f"Initialized Hugging Face client for model: {self.model_name}")
            
        except ImportError:
            raise RuntimeError("huggingface_hub library is required. Install with: pip install huggingface_hub")
    
    def vectorize_text(self, text: Union[str, List[str]]) -> Union[np.ndarray, List[np.ndarray]]:
        """
        Vectorize text using HF Inference API.
        Maintains the same interface as the local implementation.
        """
        try:
            if isinstance(text, str):
                if not text.strip():
                    raise ValueError("Input text cannot be empty")
            elif isinstance(text, list):
                if not text or all(not t.strip() for t in text):
                    raise ValueError("Input text list cannot be empty")
            
            # Use the feature extraction endpoint
            embeddings_result = self.client.feature_extraction(
                text=text,
                model=self.model_name
            )
            
            # Convert to numpy array and normalize
            if isinstance(text, str):
                # Single text input
                embeddings = np.array(embeddings_result, dtype=np.float32)
                embeddings = embeddings / np.linalg.norm(embeddings)
            else:
                # Multiple text inputs
                embeddings = np.array(embeddings_result, dtype=np.float32)
                embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Error vectorizing text: {e}")
            raise
    
    def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Compute cosine similarity between two embeddings.
        Maintains the same interface as the local implementation.
        """
        try:
            embedding1 = embedding1 / np.linalg.norm(embedding1)
            embedding2 = embedding2 / np.linalg.norm(embedding2)

            similarity = np.dot(embedding1, embedding2)

            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Error computing similarity: {e}")
            raise 
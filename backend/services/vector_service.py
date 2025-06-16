import numpy as np
from typing import List, Union, Optional
import logging
import os
import io
import tempfile

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
    
    def extract_text_from_resume(self, file_content: bytes, filename: str) -> str:
        """Extract text from resume files (PDF, DOCX)"""
        try:
            file_extension = filename.lower().split('.')[-1]
            
            if file_extension == 'pdf':
                return self._extract_pdf_text(file_content)
            elif file_extension in ['docx', 'doc']:
                return self._extract_docx_text(file_content)
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text from resume: {e}")
            raise
    
    def _extract_pdf_text(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            import pdfplumber
            
            text = ""
            with io.BytesIO(file_content) as pdf_buffer:
                with pdfplumber.open(pdf_buffer) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            
            return text.strip()
            
        except ImportError:
            logger.error("pdfplumber is required for PDF parsing")
            raise RuntimeError("PDF parsing dependencies not installed")
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            raise
    
    def _extract_docx_text(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            from docx import Document
            
            text = ""
            with io.BytesIO(file_content) as docx_buffer:
                doc = Document(docx_buffer)
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
            
            return text.strip()
            
        except ImportError:
            logger.error("python-docx is required for DOCX parsing")
            raise RuntimeError("DOCX parsing dependencies not installed")
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {e}")
            raise
    
    def extract_research_interests_from_resume(self, resume_text: str) -> str:
        """Extract and format research interests from resume text"""
        try:
            # Basic extraction - look for common research-related sections
            research_keywords = []
            lines = resume_text.lower().split('\n')
            
            # Look for research experience, skills, interests sections
            research_sections = []
            capture_next = False
            section_indicators = [
                'research experience', 'research interests', 'technical skills',
                'skills', 'projects', 'publications', 'experience',
                'education', 'coursework', 'areas of interest'
            ]
            
            for line in lines:
                line = line.strip()
                if any(indicator in line for indicator in section_indicators):
                    capture_next = True
                    continue
                
                if capture_next and line:
                    if len(line) > 10:  # Avoid capturing single words
                        research_sections.append(line)
                    
                    # Stop capturing after empty line or new section
                    if not line or any(indicator in line for indicator in section_indicators):
                        capture_next = False
            
            # Combine research sections
            research_text = ' '.join(research_sections)
            
            # If no specific research sections found, use the whole resume but limit length
            if not research_text.strip():
                research_text = resume_text[:2000]  # Limit to first 2000 characters
            
            return research_text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting research interests: {e}")
            # Fallback to using the first portion of the resume
            return resume_text[:1500] if resume_text else ""
    
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
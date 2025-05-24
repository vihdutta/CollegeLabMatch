import io
from typing import Optional
import PyPDF2
from docx import Document

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """extract text from uploaded file based on file extension"""
    file_extension = filename.lower().split('.')[-1]
    
    if file_extension == 'pdf':
        return _extract_from_pdf(file_content)
    elif file_extension in ['docx', 'doc']:
        return _extract_from_docx(file_content)
    else:
        # treat as plain text
        return file_content.decode('utf-8', errors='ignore')

def _extract_from_pdf(file_content: bytes) -> str:
    """extract text from PDF using PyPDF2"""
    try:
        pdf_stream = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_stream)
        
        text_parts = []
        for page in pdf_reader.pages:
            text_parts.append(page.extract_text())
        
        return ' '.join(text_parts).strip()
    except Exception as e:
        raise ValueError(f"failed to parse PDF: {str(e)}")

def _extract_from_docx(file_content: bytes) -> str:
    """extract text from DOCX using python-docx"""
    try:
        docx_stream = io.BytesIO(file_content)
        doc = Document(docx_stream)
        
        text_parts = []
        for paragraph in doc.paragraphs:
            text_parts.append(paragraph.text)
        
        return ' '.join(text_parts).strip()
    except Exception as e:
        raise ValueError(f"failed to parse DOCX: {str(e)}")

def clean_text(text: str) -> str:
    """clean and normalize text for embedding"""
    # remove excessive whitespace and normalize
    cleaned = ' '.join(text.split())
    return cleaned 
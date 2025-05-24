# College Research Match

A lightweight, production-ready full-stack application that helps college students match their resume or research interests to labs at their university using semantic search.

## Features

- **Semantic Matching**: Uses sentence-transformers/all-MiniLM-L6-v2 for intelligent text similarity
- **File Support**: Upload PDF, DOCX, or plain text resumes
- **Real-time Progress**: Live progress bar during matching process
- **Beautiful UI**: Monochrome design with serif/sans-serif typography
- **Fast & Lightweight**: Minimal dependencies, clean architecture

## Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: FastAPI + Python 3.11+
- **Database**: PostgreSQL with pgvector extension
- **ML**: Sentence Transformers (all-MiniLM-L6-v2)
- **Deployment**: Docker Compose

## Quick Start

### 1. Start the Database
```bash
docker-compose up -d postgres
```

### 2. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the Backend
```bash
uvicorn backend.main:app --reload
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 5. Start the Frontend
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
collegeresearchmatch/
├── backend/
│   ├── main.py          # FastAPI app
│   ├── match.py         # Embedding & matching logic
│   ├── parse.py         # File parsing (PDF/DOCX)
│   └── db.py           # Database models & connection
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main application
│   │   ├── api.ts               # Backend API calls
│   │   └── components/
│   │       ├── UploadForm.tsx   # File/text input
│   │       ├── ProgressBar.tsx  # Real-time progress
│   │       └── ResultList.tsx   # Lab results display
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## Database Schema

The `labs` table stores research lab information:

```sql
CREATE TABLE labs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    university TEXT NOT NULL,
    pi TEXT NOT NULL,
    email TEXT NOT NULL,
    summary TEXT NOT NULL,
    embedding VECTOR(384),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

- `GET /universities` - List available universities
- `POST /match` - Match text input to labs
- `POST /match/file` - Match uploaded file to labs
- `GET /progress` - Get real-time matching progress

## Adding Lab Data

To populate the database with lab data, you can use the database connection in `backend/db.py` to insert records with embeddings:

```python
from backend.db import SessionLocal, Lab
from backend.match import create_embedding

db = SessionLocal()

# Example lab data
lab = Lab(
    name="AI Research Lab",
    university="Stanford University",
    pi="Dr. Jane Smith",
    email="jsmith@stanford.edu",
    summary="We focus on machine learning and natural language processing...",
    embedding=create_embedding("machine learning natural language processing AI")
)

db.add(lab)
db.commit()
```

## Development

The application follows clean architecture principles:
- Modular components with single responsibilities
- Type-safe interfaces between frontend and backend
- Efficient vector similarity search using pgvector
- Real-time progress updates via polling

## Production Deployment

For production:
1. Set proper environment variables for database connection
2. Use a production WSGI server like Gunicorn for the backend
3. Build the frontend with `npm run build`
4. Serve static files with nginx or similar
5. Use a managed PostgreSQL instance with pgvector support 
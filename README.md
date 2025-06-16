# College Lab Match

**Find research labs that match your interests using AI-powered search**

A web application that helps students discover research opportunities by matching their interests with lab descriptions using semantic search technology.

## What is this?

College Lab Match uses AI to understand what you're interested in and finds research labs that align with your goals. Instead of manually browsing hundreds of lab websites, just describe your research interests and get personalized matches with similarity scores.

**Example**: Search for "machine learning computer vision" and get labs like Stanford AI Lab (85% match), MIT CSAIL (78% match), etc.

## Try it out

1. **Local Development**:
   ```bash
   git clone <repository-url>
   cd collegelabmatch.com
   pip install -r requirements.txt
   python run_server.py
   ```
   Open http://localhost:8000

2. **Using Docker**:
   ```bash
   docker compose up
   ```
   Open http://localhost:8090

## Setup

### Required Environment Variables

Create a `.env` file:
```env
PINECONE_API_KEY=your_api_key_here
HUGGINGFACE_API_KEY=your_hf_token_here
```

### Get API Keys

**Pinecone API Key**:
1. Sign up at [pinecone.io](https://pinecone.io)
2. Create a new project
3. Create an index named `collegelabmatch` with dimension `384` and cosine similarity
4. Copy your API key

**Hugging Face API Token**:
1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings > Access Tokens
3. Create a new token with "Read" permissions
4. Copy your token

### Add Lab Data
```bash
python sample_labs.py  # Populates database with sample labs
```

## How to Use

1. **Enter your interests**: "deep learning", "cancer research", "robotics", etc.
2. **Choose number of results**: 5, 10, or 20 labs
3. **Get matched labs** with similarity scores and contact info
4. **Browse results** and reach out to labs that interest you

## For Developers

**Tech Stack**: Python FastAPI + Vanilla JavaScript + Pinecone Vector DB + HuggingFace Inference API

**Key Files**:
- `backend/main.py` - FastAPI server
- `frontend/index.html` - Web interface
- `backend/services/` - AI and database logic

**API Endpoints**:
- `POST /api/search-labs` - Search for matching labs
- `GET /api/health` - Health check

## Deployment

The project includes automated deployment to AWS Lightsail via GitHub Actions.

**Required GitHub Secrets**:
- `DOCKERHUB_ACCESS_TOKEN`
- `LIGHTSAIL_SSH_KEY` 
- `PINECONE_API_KEY`

**Required GitHub Variables**:
- `DOCKERHUB_USERNAME`
- `LIGHTSAIL_PUBLIC_IP`
- `LIGHTSAIL_USERNAME`
- `DOMAIN_NAME`

Push to `main` branch to trigger automatic deployment.

## How it Works

1. **Text Processing**: Your interests are converted to vectors using HuggingFace Inference API
2. **Similarity Search**: Pinecone finds labs with similar vector representations  
3. **Ranking**: Results are ranked by similarity score (0-100%)
4. **Display**: Get lab details, professor info, and contact information

## Support

- Check that your `.env` file has the correct Pinecone API key
- Run `python sample_labs.py` if you get no search results
- Open an issue if you encounter bugs 
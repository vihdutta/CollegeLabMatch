import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8080))
    
    print("Starting College Lab Match Server...")
    print(f"Server will be available at: http://{host}:{port}")
    print("API documentation available at: http://localhost:8000/docs")


    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    ) 
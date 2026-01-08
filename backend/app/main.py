from dotenv import load_dotenv
import os

# Load environment variables immediately
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import router as v1_router

def create_app() -> FastAPI:
    browser = os.getenv("YOUTUBE_SOURCE_BROWSER")
    print(f"🔧 Config: Browser Source = '{browser}'")
    
    app = FastAPI(
        title="YouTube Transcript RAG API",
        description="Retrieval-Augmented Generation pipeline for YouTube transcripts",
        version="0.1.0",
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(v1_router, prefix="/api/v1")

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "version": "0.1.0"}

    return app

app = create_app()

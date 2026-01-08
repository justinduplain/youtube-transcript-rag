from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from app.services.yt_dlp_service import YtDlpService
from app.services.transcript_service import TranscriptService
from app.services.indexing_service import IndexingService
from app.services.retrieval_service import RetrievalService
import os

router = APIRouter()

# Initialize services
yt_service = YtDlpService()
transcript_service = TranscriptService()
indexing_service = IndexingService()
retrieval_service = RetrievalService(indexing_service)

class IngestRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    message: str

@router.post("/ingest")
async def ingest_url(request: IngestRequest, background_tasks: BackgroundTasks):
    """
    Ingests a YouTube URL (Video, Playlist, or Channel).
    Processing is done in the background.
    """
    video_ids = yt_service.get_video_ids(request.url)
    if not video_ids:
        raise HTTPException(status_code=400, detail="Could not extract video IDs from URL")
    
    # Define background task
    def process_videos(ids: List[str]):
        for vid in ids:
            try:
                metadata = yt_service.get_video_metadata(vid)
                transcript = transcript_service.get_transcript(vid)
                if transcript:
                    indexing_service.ingest_transcript(vid, transcript, metadata)
            except Exception as e:
                print(f"Failed to process video {vid}: {e}")

    background_tasks.add_task(process_videos, video_ids)
    
    return {
        "message": f"Started ingestion for {len(video_ids)} videos",
        "video_ids": video_ids
    }

@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Queries the indexed transcripts.
    """
    try:
        response = retrieval_service.query(request.message)
        
        # Format sources for frontend
        sources = []
        for node in response.source_nodes:
            metadata = node.node.metadata
            sources.append({
                "text": node.node.get_content(),
                "video_id": metadata.get("video_id"),
                "title": metadata.get("title"),
                "url": metadata.get("url"),
                "score": node.score
            })

        return {
            "answer": str(response),
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
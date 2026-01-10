from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from app.services.yt_dlp_service import YtDlpService
from app.services.transcript_service import TranscriptService
from app.services.indexing_service import IndexingService
from app.services.retrieval_service import RetrievalService
from llama_index.core.base.llms.types import ChatMessage, MessageRole
import re
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
yt_service = YtDlpService()
transcript_service = TranscriptService()
indexing_service = IndexingService()
retrieval_service = RetrievalService(indexing_service)

class IngestRequest(BaseModel):
    url: str

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []

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
        total = len(ids)
        logger.info(f"🚀 Starting batch ingestion for {total} videos: {ids}")
        
        for i, vid in enumerate(ids, 1):
            logger.info(f"--- Processing [{i}/{total}]: {vid} ---")
            try:
                # 1. Fetch Metadata
                try:
                    raw_metadata = yt_service.get_video_metadata(vid)
                    # Filter metadata to keep it small for vector storage
                    metadata = {
                        "video_id": raw_metadata.get("id"),
                        "title": raw_metadata.get("title"),
                        "uploader": raw_metadata.get("uploader"),
                        "upload_date": raw_metadata.get("upload_date"),
                        "view_count": raw_metadata.get("view_count"),
                        "url": raw_metadata.get("webpage_url") or f"https://www.youtube.com/watch?v={vid}"
                    }
                except Exception as e:
                    logger.warning(f"⚠️ Failed to fetch metadata for {vid}: {e}")
                    metadata = {} # Continue with minimal metadata

                # 2. Fetch Transcript
                try:
                    transcript = transcript_service.get_transcript(vid)
                except Exception as e:
                    logger.warning(f"⚠️ Failed to fetch transcript for {vid}: {e}")
                    transcript = []

                # 3. Index (only if transcript exists)
                if transcript:
                    logger.info(f"Indexing {len(transcript)} transcript segments...")
                    indexing_service.ingest_transcript(vid, transcript, metadata)
                    logger.info(f"✅ Successfully ingested: {vid}")
                else:
                    logger.info(f"⏭️ Skipping {vid}: No transcript available.")

            except Exception as e:
                # Catch-all for unexpected crashes in the indexing step
                logger.error(f"❌ Critical error processing {vid}: {e}", exc_info=True)
                continue # Explicitly continue to next video
        
        logger.info(f"🏁 Batch ingestion complete.")

    background_tasks.add_task(process_videos, video_ids)
    
    return {
        "message": f"Started ingestion for {len(video_ids)} videos",
        "video_ids": video_ids
    }

@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Queries the indexed transcripts with conversation context.
    """
    try:
        # Convert Pydantic messages to LlamaIndex ChatMessages
        chat_history = [
            ChatMessage(role=MessageRole.USER if m.role == 'user' else MessageRole.ASSISTANT, content=m.content)
            for m in request.history
        ]
        
        chat_engine = retrieval_service.get_chat_engine()
        response = chat_engine.chat(request.message, chat_history=chat_history)
        
        # Format sources for frontend with Timestamp extraction
        sources = []
        for node in response.source_nodes:
            metadata = node.node.metadata
            content = node.node.get_content()
            
            # Extract timestamp from content: "[123] text..."
            timestamp_match = re.search(r'\[(\d+)\]', content)
            timestamp_sec = int(timestamp_match.group(1)) if timestamp_match else 0
            
            # Format nicely [MM:SS]
            minutes = timestamp_sec // 60
            seconds = timestamp_sec % 60
            timestamp_label = f"[{minutes:02d}:{seconds:02d}]"
            
            # Append &t={sec} to URL
            base_url = metadata.get("url", "")
            deep_link = f"{base_url}&t={timestamp_sec}" if base_url else ""

            sources.append({
                "text": content,
                "video_id": metadata.get("video_id"),
                "title": f"{timestamp_label} {metadata.get('title')}",
                "url": deep_link,
                "score": node.score
            })

        return {
            "answer": str(response),
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

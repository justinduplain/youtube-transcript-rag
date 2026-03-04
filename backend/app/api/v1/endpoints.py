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
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory job status store
jobs: dict = {}

def parse_structured_response(raw_text: str) -> tuple:
    """
    Parses the LLM's structured output:
        ANSWER: <text>
        USED_VIDEOS: <id1,id2,...> or 'none'

    Returns (clean_answer, [video_id, ...]).
    Falls back to (raw_text, []) if format not followed.
    """
    answer_match = re.search(r'ANSWER:\s*(.*?)(?=USED_VIDEOS:|$)', raw_text, re.DOTALL | re.IGNORECASE)
    videos_match = re.search(r'USED_VIDEOS:\s*(.+)', raw_text, re.IGNORECASE)

    if answer_match:
        clean_answer = answer_match.group(1).strip()
    elif videos_match:
        # LLM skipped ANSWER: prefix but still appended USED_VIDEOS: — split on it
        clean_answer = raw_text[:videos_match.start()].strip()
    else:
        logger.warning("LLM did not follow structured output format. Using raw response.")
        return raw_text.strip(), []

    declared_ids: list = []
    if videos_match:
        raw_ids = videos_match.group(1).strip()
        if raw_ids.lower() != 'none':
            declared_ids = [vid.strip() for vid in raw_ids.split(',') if vid.strip()]

    return clean_answer, declared_ids

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
    Processing is done in the background. Poll /ingest/status/{job_id} for progress.
    """
    video_ids = yt_service.get_video_ids(request.url)
    if not video_ids:
        raise HTTPException(status_code=400, detail="Could not extract video IDs from URL")

    job_id = str(uuid.uuid4())
    total = len(video_ids)
    jobs[job_id] = {"status": "processing", "current": 0, "total": total}

    # Define background task
    def process_videos(ids: List[str], jid: str):
        logger.info(f"🚀 Starting batch ingestion for {total} videos: {ids}")

        for i, vid in enumerate(ids, 1):
            jobs[jid]["current"] = i
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

        jobs[jid]["status"] = "complete"
        logger.info(f"🏁 Batch ingestion complete.")

    background_tasks.add_task(process_videos, video_ids, job_id)

    return {
        "message": f"Started ingestion for {total} videos",
        "video_ids": video_ids,
        "job_id": job_id
    }

@router.get("/ingest/status/{job_id}")
async def ingest_status(job_id: str):
    """Returns the current status of a background ingestion job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

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
        
        clean_answer, declared_video_ids = parse_structured_response(str(response))
        declared_set = set(declared_video_ids)

        # Build sources only for video_ids the LLM declared it used
        raw_sources = []
        for node in response.source_nodes:
            metadata = node.node.metadata
            vid = metadata.get("video_id")

            if not declared_set or vid not in declared_set:
                continue

            content = node.node.get_content()
            timestamp_match = re.search(r'\[(\d+)\]', content)
            timestamp_sec = int(timestamp_match.group(1)) if timestamp_match else 0
            minutes = timestamp_sec // 60
            seconds = timestamp_sec % 60
            timestamp_label = f"[{minutes:02d}:{seconds:02d}]"

            base_url = metadata.get("url", "")
            deep_link = f"{base_url}&t={timestamp_sec}" if base_url else ""

            raw_sources.append({
                "text": content,
                "video_id": vid,
                "title": f"{timestamp_label} {metadata.get('title')}",
                "url": deep_link,
                "score": node.score or 0
            })

        # Deduplicate by video_id, preserve order, cap at 3
        seen_video_ids: set = set()
        sources = []
        for s in raw_sources:
            vid = s["video_id"]
            if vid not in seen_video_ids:
                seen_video_ids.add(vid)
                sources.append(s)
            if len(sources) == 3:
                break

        return {
            "answer": clean_answer,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

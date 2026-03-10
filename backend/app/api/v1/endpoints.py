from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal
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
    role: Literal["user", "assistant"]
    content: str = ""

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = Field(default_factory=list)

@router.post("/ingest")
async def ingest_url(request: IngestRequest, background_tasks: BackgroundTasks):
    """
    Ingests a YouTube URL (Video, Playlist, or Channel).
    Processing is done in the background. Poll /ingest/status/{job_id} for progress.
    """
    video_ids, source_title, source_type, video_titles = yt_service.get_video_ids(request.url)
    if not video_ids:
        raise HTTPException(status_code=400, detail="Could not extract video IDs from URL")

    video_ids = video_ids[:5]

    GLOBAL_VIDEO_LIMIT = 10
    already_indexed = indexing_service.get_indexed_video_ids()
    # Exclude already-indexed videos and enforce the global cap
    new_video_ids = [v for v in video_ids if v not in already_indexed]
    remaining_capacity = GLOBAL_VIDEO_LIMIT - len(already_indexed)
    if remaining_capacity <= 0:
        raise HTTPException(status_code=400, detail=f"Video limit reached ({GLOBAL_VIDEO_LIMIT} videos max). Clear existing sources to add more.")
    video_ids = new_video_ids[:remaining_capacity]
    if not video_ids:
        raise HTTPException(status_code=400, detail="All videos in this playlist are already indexed.")

    job_id = str(uuid.uuid4())
    total = len(video_ids)
    jobs[job_id] = {"status": "processing", "current": 0, "total": total}

    # Define background task
    def process_videos(ids: List[str], jid: str, src_url: str, src_title: str, src_type: str, video_titles: Dict[str, str]):
        logger.info(f"🚀 Starting batch ingestion for {total} videos: {ids}")

        for i, vid in enumerate(ids, 1):
            jobs[jid]["current"] = i
            logger.info(f"--- Processing [{i}/{total}]: {vid} ---")
            try:
                # 1. Build metadata from title map
                metadata = {
                    "video_id": vid,
                    "title": video_titles.get(vid, ""),
                    "url": f"https://www.youtube.com/watch?v={vid}",
                    "source_url": src_url,
                    "source_title": src_title,
                    "source_type": src_type,
                }

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

    background_tasks.add_task(process_videos, video_ids, job_id, request.url, source_title, source_type, video_titles)

    return {
        "message": f"Started ingestion for {total} videos",
        "video_ids": video_ids,
        "job_id": job_id,
        "source_title": source_title,
        "source_type": source_type,
    }

@router.get("/ingest/status/{job_id}")
async def ingest_status(job_id: str):
    """Returns the current status of a background ingestion job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@router.get("/sources")
async def list_sources():
    """Returns indexed sources grouped by original submitted URL."""
    result = indexing_service.chroma_collection.get(include=["metadatas"])
    seen: dict = {}
    for meta in result["metadatas"]:
        # Use source_url if stored, fall back to video URL for legacy entries
        source_url = meta.get("source_url") or meta.get("url", "")
        if not source_url:
            continue
        if source_url not in seen:
            seen[source_url] = {
                "source_url": source_url,
                "source_title": meta.get("source_title") or meta.get("title", source_url),
                "source_type": meta.get("source_type", "video"),
                "video_ids": set(),
            }
        vid = meta.get("video_id")
        if vid:
            seen[source_url]["video_ids"].add(vid)
    return [
        {
            "source_url": s["source_url"],
            "source_title": s["source_title"],
            "source_type": s["source_type"],
            "video_count": len(s["video_ids"]),
        }
        for s in seen.values()
    ]

@router.delete("/sources")
async def clear_sources():
    """Clears all indexed sources and resets job state."""
    indexing_service.clear_all()
    retrieval_service.vector_store = indexing_service.vector_store
    retrieval_service.docstore = indexing_service.docstore
    jobs.clear()
    return {"message": "All sources cleared."}

@router.post("/chat")
def chat(request: ChatRequest):
    """
    Queries the indexed transcripts with conversation context.
    """
    if indexing_service.chroma_collection.count() == 0:
        return {
            "answer": "No sources added, please ingest a youtube video URL or playlist URL to get started.",
            "sources": []
        }

    try:
        # Convert Pydantic messages to LlamaIndex ChatMessages
        chat_history = [
            ChatMessage(
                role=MessageRole.USER if m.role == "user" else MessageRole.ASSISTANT,
                content=m.content.strip(),
            )
            for m in request.history
            if m.content and m.content.strip()
        ]
        
        chat_engine = retrieval_service.get_chat_engine()
        response = chat_engine.chat(request.message, chat_history=chat_history)
        
        clean_answer, declared_video_ids = parse_structured_response(str(response))
        declared_set = set(declared_video_ids)

        # Build sources: filter by declared video_ids when available, otherwise show all retrieved nodes
        raw_sources = []
        for node in response.source_nodes:
            metadata = node.node.metadata
            vid = metadata.get("video_id")

            if declared_set and vid not in declared_set:
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

        # Sort by score descending
        raw_sources.sort(key=lambda s: s["score"], reverse=True)

        # Drop sources scoring below 70% of the top score (relative threshold)
        SCORE_THRESHOLD = 0.7
        if raw_sources:
            top_score = raw_sources[0]["score"]
            cutoff = top_score * SCORE_THRESHOLD
            raw_sources = [s for s in raw_sources if s["score"] >= cutoff]

        # Deduplicate by timestamp (video_id + timestamp_sec), cap at 5
        seen_timestamps: set = set()
        sources = []
        for s in raw_sources:
            key = (s["video_id"], s["url"])
            if key not in seen_timestamps:
                seen_timestamps.add(key)
                sources.append(s)
            if len(sources) == 5:
                break

        return {
            "answer": clean_answer,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

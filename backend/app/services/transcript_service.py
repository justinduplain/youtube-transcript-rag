from youtube_transcript_api import YouTubeTranscriptApi
from typing import List, Dict, Optional

class TranscriptService:
    def get_transcript(self, video_id: str, languages: List[str] = ['en']) -> List[Dict]:
        """
        Fetches the transcript for a given video ID.
        Returns a list of dicts with 'text', 'start', and 'duration'.
        """
        try:
            return YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
        except Exception as e:
            print(f"Error fetching transcript for {video_id}: {e}")
            # Try to fetch list of available transcripts to be more specific?
            return []

    def format_transcript_for_rag(self, transcript: List[Dict]) -> str:
        """
        Converts the raw transcript list into a single string with timestamps.
        Useful for simple RAG or debugging.
        """
        formatted = []
        for entry in transcript:
            start = entry['start']
            text = entry['text']
            # Convert start time to [MM:SS] format
            minutes = int(start // 60)
            seconds = int(start % 60)
            timestamp = f"[{minutes:02d}:{seconds:02d}]"
            formatted.append(f"{timestamp} {text}")
        
        return "\n".join(formatted)
from youtube_transcript_api import YouTubeTranscriptApi
from typing import List, Dict, Optional

class TranscriptService:
    def __init__(self):
        # Initialize the API client once
        self.api = YouTubeTranscriptApi()

    def get_transcript(self, video_id: str, languages: List[str] = ['en']) -> List[Dict]:
        """
        Fetches the transcript for a given video ID.
        Returns a list of dicts with 'text', 'start', and 'duration'.
        """
        try:
            # Use the instance method 'fetch' which returns the transcript list directly
            transcript_list = self.api.fetch(video_id, languages=languages)
            
            # Convert FetchedTranscriptSnippet objects to dictionaries
            return [
                {
                    'text': item.text,
                    'start': item.start,
                    'duration': item.duration
                }
                for item in transcript_list
            ]
        except Exception as e:
            print(f"Error fetching transcript for {video_id}: {e}")
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
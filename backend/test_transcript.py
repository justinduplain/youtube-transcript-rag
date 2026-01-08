from youtube_transcript_api import YouTubeTranscriptApi
import sys

print(f"Python executable: {sys.executable}")
print(f"YouTubeTranscriptApi: {YouTubeTranscriptApi}")
print(f"Has get_transcript: {hasattr(YouTubeTranscriptApi, 'get_transcript')}")

try:
    # Test with a known working video ID (the one you linked)
    transcript = YouTubeTranscriptApi.get_transcript("2XTSgRtcwh0", languages=['en'])
    print(f"Success! Got {len(transcript)} segments.")
except Exception as e:
    print(f"Failed: {e}")

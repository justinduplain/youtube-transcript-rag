from app.services.transcript_service import TranscriptService

service = TranscriptService()
try:
    print("Testing TranscriptService...")
    transcript = service.get_transcript("2XTSgRtcwh0")
    if transcript:
        print(f"Success! Got {len(transcript)} segments.")
        print(f"First segment: {transcript[0]}")
    else:
        print("Failed to get transcript (returned empty list).")
except Exception as e:
    print(f"Failed with error: {e}")

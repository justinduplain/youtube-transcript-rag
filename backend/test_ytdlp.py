from app.services.yt_dlp_service import YtDlpService
import os
from dotenv import load_dotenv

# Load env vars for this script
load_dotenv()

def test_playlist_access():
    print("Testing YtDlpService with Cookies...")
    print(f"BROWSER_SOURCE env var: {os.getenv('YOUTUBE_SOURCE_BROWSER')}")
    
    service = YtDlpService()
    
    # The playlist you were testing
    url = "https://www.youtube.com/watch?v=7rQYjitgg2A&list=PLwHdnejyLuk77SXwJNQtURBIA0R17mJIk&pp=gAQB"
    
    print(f"\nAttempting to fetch IDs from: {url}")
    ids = service.get_video_ids(url)
    
    if ids:
        print(f"✅ Success! Found {len(ids)} videos.")
        print(f"First few IDs: {ids[:3]}")
    else:
        print("❌ Failed to get video IDs.")

if __name__ == "__main__":
    test_playlist_access()

import yt_dlp
import os
from typing import List, Dict, Optional

class YtDlpService:
    def __init__(self, cookies_path: Optional[str] = None):
        self.cookies_path = cookies_path or os.getenv("YOUTUBE_COOKIES_PATH")
        self.source_browser = os.getenv("YOUTUBE_SOURCE_BROWSER") # e.g., 'chrome', 'firefox', 'safari'

    def get_video_ids(self, url: str) -> List[str]:
        """
        Extracts video IDs from a YouTube URL (Video, Playlist, or Channel).
        """
        process_playlist = 'list=' in url
        target_url = url

        # If it's a mixed URL (watch?v=...&list=...), strip the video part to force playlist extraction
        if process_playlist and 'v=' in url:
            from urllib.parse import urlparse, parse_qs, urlencode
            parsed = urlparse(url)
            query = parse_qs(parsed.query)
            if 'list' in query:
                # Reconstruct URL with only the list parameter
                target_url = f"https://www.youtube.com/playlist?list={query['list'][0]}"
                print(f"Detected mixed URL. Forcing playlist extraction: {target_url}")

        ydl_opts = {
            'extract_flat': True,
            'quiet': True,
            'no_warnings': True,
            'noplaylist': False,
        }
        
        # Priority 1: Direct Browser Access (e.g. 'chrome')
        if self.source_browser:
            print(f"🍪 Using cookies from browser: {self.source_browser}")
            # Correct format: Single tuple, NOT a list of tuples
            ydl_opts['cookiesfrombrowser'] = (self.source_browser, None, None, None)
        # Priority 2: Cookies File
        elif self.cookies_path and os.path.exists(self.cookies_path):
            print(f"🍪 Using cookies from file: {self.cookies_path}")
            ydl_opts['cookiefile'] = self.cookies_path

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info_dict = ydl.extract_info(target_url, download=False)
                if not info_dict:
                    return []
                
                # Check if it's a single video (no 'entries')
                if 'entries' not in info_dict:
                    return [info_dict.get('id')] if info_dict.get('id') else []
                
                # It's a playlist or channel
                return [entry['id'] for entry in info_dict['entries'] if entry and 'id' in entry]
            except Exception as e:
                # Log error here
                print(f"Error extracting video IDs: {e}")
                return []

    def get_video_metadata(self, video_id: str) -> Dict:
        """
        Fetches metadata for a single video.
        """
        url = f"https://www.youtube.com/watch?v={video_id}"
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }
        
        if self.cookies_path and os.path.exists(self.cookies_path):
            ydl_opts['cookiefile'] = self.cookies_path

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                return ydl.extract_info(url, download=False)
            except Exception as e:
                print(f"Error fetching metadata for {video_id}: {e}")
                return {}

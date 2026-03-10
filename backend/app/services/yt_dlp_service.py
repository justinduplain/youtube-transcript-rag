import yt_dlp
import os
import sys
import logging
from typing import List, Dict, Optional
from urllib.parse import urlparse, parse_qs

logger = logging.getLogger(__name__)

class YtDlpService:
    def __init__(self, cookies_path: Optional[str] = None):
        self.cookies_path = cookies_path or os.getenv("YOUTUBE_COOKIES_PATH")
        self.source_browser = os.getenv("YOUTUBE_SOURCE_BROWSER") # e.g., 'chrome', 'firefox', 'safari'

        proxy_user = os.getenv("WEBSHARE_PROXY_USERNAME")
        proxy_pass = os.getenv("WEBSHARE_PROXY_PASSWORD")
        if proxy_user and proxy_pass:
            self.proxy_url = f"http://{proxy_user}:{proxy_pass}@p.webshare.io:80"
        else:
            self.proxy_url = None

    def get_video_ids(self, url: str) -> tuple[List[str], str, str, Dict[str, str]]:
        """
        Extracts video IDs from a YouTube URL (Video, Playlist, or Channel).
        Returns (video_ids, source_title, source_type, title_map) where source_type is 'video' or 'playlist'
        and title_map is {video_id: title}.
        """
        process_playlist = 'list=' in url
        target_url = url

        # If it's a mixed URL (watch?v=...&list=...), strip the video part to force playlist extraction
        if process_playlist and 'v=' in url:
            parsed = urlparse(url)
            query = parse_qs(parsed.query)
            if 'list' in query:
                # Reconstruct URL with only the list parameter
                target_url = f"https://www.youtube.com/playlist?list={query['list'][0]}"
                logger.info(f"Detected mixed URL. Forcing playlist extraction: {target_url}")

        ydl_opts = {
            'extract_flat': True,
            'quiet': True,
            'no_warnings': True,
            'noplaylist': False,
        }
        
        # Priority 1: Direct Browser Access (e.g. 'chrome')
        if self.source_browser:
            logger.info(f"🍪 Using cookies from browser: {self.source_browser}")
            
            if sys.platform == 'darwin':
                logger.info("⚠️  A system dialog may appear asking for Keychain access. Please select 'Allow' to proceed.")
            elif sys.platform == 'win32':
                logger.info("⚠️  On Windows, you may need to close the browser to allow access to the cookie database.")

            # Correct format: Single tuple, NOT a list of tuples
            ydl_opts['cookiesfrombrowser'] = (self.source_browser, None, None, None)
        # Priority 2: Cookies File
        elif self.cookies_path and os.path.exists(self.cookies_path):
            logger.info(f"🍪 Using cookies from file: {self.cookies_path}")
            ydl_opts['cookiefile'] = self.cookies_path
        else:
            logger.info("ℹ️ No cookies configured. Accessing YouTube as a guest.")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info_dict = ydl.extract_info(target_url, download=False)
                if not info_dict:
                    return [], '', 'video', {}

                source_title = info_dict.get('title') or info_dict.get('playlist_title') or ''

                # Check if it's a single video (no 'entries')
                if 'entries' not in info_dict:
                    video_id = info_dict.get('id')
                    title_map = {video_id: info_dict.get('title', '')} if video_id else {}
                    return ([video_id] if video_id else []), source_title, 'video', title_map

                # It's a playlist or channel
                entries = [entry for entry in info_dict['entries'] if entry and 'id' in entry]
                ids = [entry['id'] for entry in entries]
                title_map = {entry['id']: entry.get('title', '') for entry in entries}
                return ids, source_title, 'playlist', title_map
            except Exception as e:
                # Log error here
                logger.error(f"Error extracting video IDs: {e}")
                return [], '', 'video', {}

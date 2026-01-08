import pytest
import shutil
import os
from dotenv import load_dotenv

# Load environment variables for tests
load_dotenv()

from app.services.indexing_service import IndexingService
from app.services.retrieval_service import RetrievalService
from app.services.transcript_service import TranscriptService
from app.services.yt_dlp_service import YtDlpService

@pytest.fixture(scope="function")
def indexing_service(tmp_path):
    """
    Creates a fresh IndexingService with a unique temporary database for each test.
    """
    # Create a unique path for this test run
    db_path = tmp_path / "chroma_db"
    
    service = IndexingService(db_path=str(db_path), collection_name="test_collection")
    yield service
    
    # No manual teardown needed; pytest handles tmp_path cleanup.

@pytest.fixture(scope="function")
def retrieval_service(indexing_service):
    return RetrievalService(indexing_service)

@pytest.fixture
def mock_transcript():
    """
    Returns a sample transcript for testing.
    """
    return [
        {'text': 'Hello and welcome to this tutorial on Python.', 'start': 0.0, 'duration': 5.0},
        {'text': 'Python is a versatile programming language.', 'start': 5.0, 'duration': 4.0},
        {'text': 'In this video we will cover lists and dictionaries.', 'start': 9.0, 'duration': 6.0},
        {'text': 'Lists are ordered collections of items.', 'start': 15.0, 'duration': 3.0},
        {'text': 'Dictionaries are key-value pairs.', 'start': 18.0, 'duration': 3.0}
    ]

@pytest.fixture
def mock_metadata():
    return {
        "video_id": "test_vid_123",
        "title": "Python Tutorial 101",
        "uploader": "Test Coder",
        "upload_date": "20230101",
        "view_count": 1000,
        "url": "https://youtube.com/watch?v=test_vid_123"
    }

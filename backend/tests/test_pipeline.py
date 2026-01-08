import pytest
from app.services.indexing_service import IndexingService
from app.services.retrieval_service import RetrievalService

def test_full_pipeline(indexing_service, retrieval_service, mock_transcript, mock_metadata):
    """
    Tests the entire flow: Ingestion -> Indexing -> Retrieval.
    """
    video_id = mock_metadata['video_id']
    
    # 1. Ingest Data
    print(f"Ingesting video {video_id}...")
    indexing_service.ingest_transcript(video_id, mock_transcript, mock_metadata)
    
    # 2. Verify Storage
    assert len(indexing_service.docstore.docs) > 0, "Docstore should not be empty"
    assert indexing_service.chroma_collection.count() > 0, "Vector store should not be empty"
    
    # 3. Test Retrieval (Exact Match)
    engine = retrieval_service.get_query_engine()
    response = engine.query("What is this video about?")
    
    print(f"Response: {response}")
    assert len(response.source_nodes) > 0, "Should retrieve at least one source node"
    assert "Python" in response.source_nodes[0].node.get_content(), "Should retrieve relevant content"

def test_retrieval_specific_fact(indexing_service, retrieval_service, mock_transcript, mock_metadata):
    """
    Tests if specific facts can be retrieved.
    """
    indexing_service.ingest_transcript(mock_metadata['video_id'], mock_transcript, mock_metadata)
    
    engine = retrieval_service.get_query_engine()
    response = engine.query("What are lists?")
    
    assert "ordered collections" in str(response) or "ordered collections" in response.source_nodes[0].node.get_content()

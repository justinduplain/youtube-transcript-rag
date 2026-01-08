import os
import chromadb
from typing import List, Dict, Any
from llama_index.core import Document, StorageContext, VectorStoreIndex, Settings
from llama_index.core.node_parser import HierarchicalNodeParser, get_leaf_nodes
from llama_index.core.storage.docstore import SimpleDocumentStore
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.indices.postprocessor import MetadataReplacementPostProcessor

class IndexingService:
    def __init__(self, db_path: str = "./chroma_db", collection_name: str = "youtube_transcripts"):
        self.db_path = db_path
        self.collection_name = collection_name
        
        # Initialize Chroma
        self.db = chromadb.PersistentClient(path=db_path)
        self.chroma_collection = self.db.get_or_create_collection(collection_name)
        self.vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        
        # Initialize DocStore (for parent nodes)
        # In a production app, this might be MongoDB or similar
        self.docstore_path = os.path.join(db_path, "docstore.json")
        if os.path.exists(self.docstore_path):
            self.docstore = SimpleDocumentStore.from_persist_path(self.docstore_path)
        else:
            self.docstore = SimpleDocumentStore()

    def create_nodes_from_transcript(self, video_id: str, transcript: List[Dict], metadata: Dict) -> List[Any]:
        """
        Parses transcript into hierarchical nodes (Parent-Child).
        """
        # Combine transcript into a single document with metadata
        # Embed timestamps directly in the text: "[start_seconds] text..."
        full_text = ""
        for entry in transcript:
            start_time = int(entry['start'])
            full_text += f"[{start_time}] {entry['text']} "
            
        doc = Document(
            text=full_text,
            metadata={
                "video_id": video_id,
                "title": metadata.get("title", ""),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                **metadata
            }
        )
        
        # Configure HierarchicalNodeParser
        # Parent: ~512 tokens, Child: ~128 tokens
        node_parser = HierarchicalNodeParser.from_defaults(
            chunk_sizes=[512, 128]
        )
        
        nodes = node_parser.get_nodes_from_documents([doc])
        return nodes

    def ingest_transcript(self, video_id: str, transcript: List[Dict], metadata: Dict):
        """
        Complete ingestion pipeline: parse, store in docstore, index in vectorstore.
        """
        nodes = self.create_nodes_from_transcript(video_id, transcript, metadata)
        leaf_nodes = get_leaf_nodes(nodes)
        
        # Store all nodes in docstore (so we can retrieve parents from child IDs)
        self.docstore.add_documents(nodes)
        
        # Create StorageContext
        storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store,
            docstore=self.docstore
        )
        
        # Index only leaf nodes in vector store
        # This allows high-precision search on small chunks
        index = VectorStoreIndex(
            leaf_nodes,
            storage_context=storage_context
        )
        
        # Persist docstore
        self.docstore.persist(self.docstore_path)
        
        return index

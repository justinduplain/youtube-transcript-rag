from typing import List
from llama_index.core import VectorStoreIndex, StorageContext, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.retrievers import VectorIndexRetriever, RecursiveRetriever
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.core.response_synthesizers import get_response_synthesizer
from app.services.indexing_service import IndexingService

class RetrievalService:
    def __init__(self, indexing_service: IndexingService):
        self.indexing_service = indexing_service
        self.vector_store = indexing_service.vector_store
        self.docstore = indexing_service.docstore
        
        # Configure global settings for cost-efficiency
        Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0.1)
        Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

    def get_query_engine(self):
        """
        Sets up the hybrid retrieval query engine with parent-child resolution.
        """
        # 1. Create the index from existing storage
        index = VectorStoreIndex.from_vector_store(
            self.vector_store, 
            docstore=self.docstore
        )
        
        # 2. Vector Retriever
        vector_retriever = index.as_retriever(similarity_top_k=5)
        
        # 3. BM25 Retriever
        # Note: BM25Retriever requires nodes. We can get them from docstore.
        all_nodes = list(self.docstore.docs.values())
        bm25_retriever = BM25Retriever.from_defaults(
            nodes=all_nodes, 
            similarity_top_k=5
        )
        
        # 4. Recursive Retriever for Parent-Child resolution
        # This will automatically fetch the parent node when a child (leaf) node is matched
        retriever = RecursiveRetriever(
            "vector",
            retriever_dict={
                "vector": vector_retriever,
                "bm25": bm25_retriever
            },
            # Combine them or use one for now? RecursiveRetriever usually starts from one.
            # For true Hybrid + RRF, we might need QueryFusionRetriever.
        )
        
        # Let's use QueryFusionRetriever for RRF as per roadmap
        from llama_index.core.retrievers import QueryFusionRetriever
        
        hybrid_retriever = QueryFusionRetriever(
            [vector_retriever, bm25_retriever],
            similarity_top_k=5,
            num_queries=1,  # set this to 1 to disable query generation if not needed
            mode="reciprocal_rerank",
            use_async=True,
        )
        
        # Now wrap the hybrid retriever in RecursiveRetriever to resolve parents
        # Actually, QueryFusionRetriever returns nodes. If those are leaf nodes, 
        # we need to ensure we get the parent context.
        
        final_retriever = RecursiveRetriever(
            "hybrid",
            retriever_dict={"hybrid": hybrid_retriever},
            docstore=self.docstore
        )
        
        # 5. Response Synthesizer
        response_synthesizer = get_response_synthesizer(
            response_mode="compact"
        )
        
        # 6. Query Engine
        query_engine = RetrieverQueryEngine(
            retriever=final_retriever,
            response_synthesizer=response_synthesizer,
            node_postprocessors=[
                SimilarityPostprocessor(similarity_cutoff=0.7)
            ]
        )
        
        return query_engine

    def query(self, message: str):
        engine = self.get_query_engine()
        return engine.query(message)

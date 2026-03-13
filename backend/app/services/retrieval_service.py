import os
from typing import List
from llama_index.core import VectorStoreIndex, StorageContext, Settings
from llama_index.core.base.llms.types import ChatMessage, MessageRole
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.retrievers import VectorIndexRetriever, AutoMergingRetriever
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.core.response_synthesizers import get_response_synthesizer
from llama_index.core.retrievers import QueryFusionRetriever
from app.services.indexing_service import IndexingService

class RetrievalService:
    def __init__(self, indexing_service: IndexingService):
        self.indexing_service = indexing_service
        self.vector_store = indexing_service.vector_store
        self.docstore = indexing_service.docstore
        
        # Configure global settings
        Settings.llm = GoogleGenAI(
            model="gemini-2.5-flash",
            temperature=0.1,
            api_key=os.getenv("GOOGLE_API_KEY"),
        )
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
        vector_retriever = index.as_retriever(similarity_top_k=10)

        # 3. BM25 Retriever
        # Note: BM25Retriever requires nodes. We can get them from docstore.
        all_nodes = list(self.docstore.docs.values())
        bm25_retriever = BM25Retriever.from_defaults(
            nodes=all_nodes,
            similarity_top_k=10
        )

        # 4. Hybrid Retriever (RRF)
        hybrid_retriever = QueryFusionRetriever(
            [vector_retriever, bm25_retriever],
            similarity_top_k=10,
            num_queries=1,
            mode="reciprocal_rerank",
            use_async=False,
        )
        
        # 5. Parent-Child Resolution (AutoMergingRetriever)
        storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store,
            docstore=self.docstore
        )
        
        final_retriever = AutoMergingRetriever(
            hybrid_retriever,
            storage_context=storage_context,
            verbose=True
        )
        
        # 6. Response Synthesizer
        response_synthesizer = get_response_synthesizer(
            response_mode="compact"
        )
        
        # 7. Query Engine
        query_engine = RetrieverQueryEngine(
            retriever=final_retriever,
            response_synthesizer=response_synthesizer,
            # node_postprocessors=[
            #     SimilarityPostprocessor(similarity_cutoff=0.5)
            # ]
        )
        
        return query_engine

    def query_with_citations(self, message: str, chat_history: list):
        """
        Retrieves context chunks, labels them with letters, calls the LLM
        directly, and returns the raw response plus the label-to-node mapping
        so the caller can remap citations after post-processing.
        """
        query_engine = self.get_query_engine()
        nodes = query_engine.retriever.retrieve(message)

        # Label each retrieved node: A, B, C, ...
        label_to_node = {}
        context_parts = []
        for i, node_with_score in enumerate(nodes):
            label = chr(65 + i)  # A-Z
            label_to_node[label] = node_with_score
            meta = node_with_score.node.metadata
            text = node_with_score.node.get_content()
            context_parts.append(
                f"[Source {label}] (video_id: {meta.get('video_id')}, "
                f"title: {meta.get('title')})\n{text}"
            )
        context_str = "\n\n".join(context_parts)

        system_prompt = (
            "You are a helpful YouTube assistant. "
            "Answer questions based ONLY on the provided context from video transcripts. "
            "If the answer is not in the context, say you don't know.\n\n"
            "CITATION RULES:\n"
            "- When you use information from a source, cite it inline using its label, "
            "e.g. [Source A], [Source B].\n"
            "- Place citations at the end of the sentence or claim they support.\n"
            "- You may cite multiple sources for one claim: [Source A][Source C]\n"
            "- Only cite sources you actually used.\n\n"
            "You MUST format your response EXACTLY as follows — no exceptions:\n"
            "ANSWER: <your answer with inline [Source X] citations>\n"
            "USED_VIDEOS: <comma-separated list of video_id values you actually used, or 'none'>\n\n"
            "Do not add any text before 'ANSWER:' or after the USED_VIDEOS line.\n\n"
            f"Context:\n{context_str}"
        )

        messages = [ChatMessage(role=MessageRole.SYSTEM, content=system_prompt)]
        messages.extend(chat_history)
        messages.append(ChatMessage(role=MessageRole.USER, content=message))

        response = Settings.llm.chat(messages)
        return str(response), label_to_node

    def query(self, message: str):
        engine = self.get_query_engine()
        return engine.query(message)

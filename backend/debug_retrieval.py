import os
from dotenv import load_dotenv
from app.services.indexing_service import IndexingService
from app.services.retrieval_service import RetrievalService
from llama_index.core import VectorStoreIndex

# Load env vars
load_dotenv()

def debug_retrieval():
    print("🔍 Debugging Retrieval Pipeline...")
    
    # 1. Initialize Services
    indexing_service = IndexingService()
    
    # 2. Check DocStore
    doc_count = len(indexing_service.docstore.docs)
    print(f"📄 DocStore Document Count: {doc_count}")
    if doc_count == 0:
        print("❌ DocStore is empty! Ingestion likely failed to persist.")
        return

    # 3. Check Vector Store (Chroma)
    try:
        count = indexing_service.chroma_collection.count()
        print(f"🔢 ChromaDB Collection Count: {count}")
        if count == 0:
            print("❌ Vector Store is empty!")
            return
    except Exception as e:
        print(f"⚠️ Could not check Chroma count: {e}")

    # 4. Test Basic Vector Retrieval
    print("\n🧪 Testing Vector Retrieval (Raw)...")
    try:
        index = VectorStoreIndex.from_vector_store(
            indexing_service.vector_store, 
            docstore=indexing_service.docstore
        )
        retriever = index.as_retriever(similarity_top_k=3)
        nodes = retriever.retrieve("yellow jackets") # Use a keyword known from previous logs
        print(f"   Found {len(nodes)} nodes via Vector Search.")
        for n in nodes:
            print(f"   - [{n.score:.2f}] {n.text[:50]}...")
    except Exception as e:
        print(f"❌ Vector Retrieval Failed: {e}")

    # 5. Test Chat Engine
    print("\n🧪 Testing Chat Engine...")
    try:
        retrieval_service = RetrievalService(indexing_service)
        chat_engine = retrieval_service.get_chat_engine()
        response = chat_engine.chat("How do I kill yellow jackets?")
        print(f"   Response: {response}")
        print(f"   Source Nodes: {len(response.source_nodes)}")
        
        # Test History
        print("   Testing History...")
        response2 = chat_engine.chat("What was the product you mentioned?")
        print(f"   Follow-up Response: {response2}")
        
    except Exception as e:
        print(f"❌ Chat Engine Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_retrieval()

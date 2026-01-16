# YouTube Transcript RAG Pipeline (in-progress project)

A Retrieval-Augmented Generation (RAG) system that allows you to "chat" with YouTube videos. It ingests transcripts, indexes them using a Hybrid Search (Vector + BM25) architecture, and provides answers with **time-referenced deep links** to the source video.

## 🌟 Key Features

*   **Playlist Ingestion:** Automatically handles single videos or full playlists.
*   **Hybrid Search:** Combines Vector Search (ChromaDB) and Keyword Search (BM25) for high precision.
*   **Time-Referenced Deep Links:** Citations link directly to the exact second in the video (e.g., `[04:23]`).
*   **Zero-Trust UI:** Built with tokenized USWDS and Tailwind CSS for accessibility and standard compliance.
*   **Chat History:** Context-aware conversations.

## 🛠️ Architecture

*   **Frontend:** React 18, Vite, TypeScript, USWDS, Tailwind CSS.
*   **Backend:** FastAPI, Python 3.12, Poetry.
*   **AI/RAG:** LlamaIndex, OpenAI (`gpt-4o-mini`), ChromaDB (Local Vector Store).

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python 3.12+ (managed via Poetry)
*   OpenAI API Key

### 1. Setup Backend
```bash
cd backend

# Install dependencies
curl -sSL https://install.python-poetry.org | python3 -
poetry install

# Configure Environment
# Create a .env file with your API keys
echo "OPENAI_API_KEY=sk-..." > .env
# (Optional) For private playlists, export cookies.txt to backend/cookies.txt
# OR set YOUTUBE_SOURCE_BROWSER=chrome in .env

# Run Server
poetry run uvicorn app.main:app --reload
```

### 2. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run Development Server
npm run dev
```

### 3. Usage
1.  Open `http://localhost:5173`.
2.  Paste a YouTube URL (Video or Playlist) into the Ingestion Form.
3.  Wait for the alert confirming ingestion started.
4.  Navigate to the **Chat** page.
5.  Ask questions! Click the timestamps in "Sources" to verify the answer.

## 🧪 Testing

The backend includes a `pytest` suite for the RAG pipeline.

```bash
cd backend
poetry run pytest
```

## 📂 Project Structure

*   `frontend/`: React application.
*   `backend/`: FastAPI application.
    *   `app/services/`: Core logic (Ingestion, Indexing, Retrieval).
    *   `app/api/`: REST Endpoints.
    *   `chroma_db/`: Local vector database (git-ignored).

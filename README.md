# YouTube Transcript RAG Pipeline & CMM Design System Study

A Retrieval-Augmented Generation (RAG) system that allows you to "chat" with YouTube videos. This project serves as both a functional search tool and an educational sandbox for the **Case Management Modernization (CMM)** design system, focusing on **USWDS compliance**, **Section 508 Accessibility**, and **Design Tokens**.

## 🌟 Key Features

*   **Zero-Trust Research:** Citations link directly to the exact second in the video (e.g., `[04:23]`), allowing for instant verification of AI-generated answers.
*   **Intelligent Ingestion:** Automatically handles single videos, playlists, or entire channels using `yt-dlp`.
*   **Hybrid Search Architecture:** Combines semantic Vector Search (ChromaDB) with keyword-based BM25 retrieval using **Reciprocal Rank Fusion (RRF)** for high-precision results.
*   **Parent-Child Indexing:** Uses a "Small-to-Big" retrieval strategy. Small chunks (child nodes) are used for precise matching, while larger context windows (parent nodes) are provided to the LLM for synthesis.
*   **Federal Design Standards:** Built with USWDS (@trussworks/react-uswds) and Tailwind CSS, featuring a tokenized styling architecture via **Style Dictionary**.

## 🛠️ Tech Stack

### Frontend
*   **Core:** React 19, Vite, TypeScript, React Router.
*   **Design:** USWDS, Tailwind CSS, Style Dictionary (v5).
*   **Performance:** React Virtual for list virtualization.
*   **Testing:** Vitest, Vitest-Axe (A11y testing), Storybook.

### Backend
*   **Core:** FastAPI, Python 3.12+, Poetry.
*   **Orchestration:** LlamaIndex.
*   **Vector Store:** ChromaDB (Local).
*   **Models:** OpenAI `gpt-4o-mini` (LLM) and `text-embedding-3-small` (Embeddings).
*   **Extraction:** `yt-dlp` and `youtube-transcript-api`.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python 3.12+ (managed via Poetry)
*   OpenAI API Key

### 1. Setup Backend
```bash
cd backend

# Install dependencies
poetry install

# Configure Environment
# Create a .env file
echo "OPENAI_API_KEY=your_key_here" > .env
# Optional: Set YOUTUBE_SOURCE_BROWSER=chrome to use local cookies for private content
```

### 2. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run Development Server
npm run dev

# Run Storybook
npm run storybook
```

### 3. Usage
1.  Open `http://localhost:5173`.
2.  **Ingest:** Paste a YouTube URL (Video/Playlist/Channel). Processing happens in the background.
3.  **Chat:** Navigate to the **Chat** page to ask questions.
4.  **Verify:** Click timestamps in the citations to open the video at the exact moment referenced.

## 📂 Project Structure

*   `frontend/`: React application.
    *   `src/tokens/`: 3-tier Design Tokens (Base, Semantic, Component).
    *   `src/components/`: USWDS-compliant UI components + Storybook stories.
    *   `src/pages/`: Main application views (Ingestion, Chat, Virtual List).
*   `backend/`: FastAPI application.
    *   `app/api/v1/`: API endpoints for Ingestion and Chat.
    *   `app/services/`: Core logic for `yt-dlp`, transcript fetching, and LlamaIndex orchestration.
    *   `chroma_db/`: Local vector database storage.

## 🧪 Testing

```bash
# Backend tests
cd backend && poetry run pytest

# Frontend tests & A11y
cd frontend && npm test
```

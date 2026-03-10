# YouTube Transcript RAG Pipeline & CMM Design System Study

A Retrieval-Augmented Generation (RAG) system that allows you to "chat" with YouTube videos. This project serves as both a functional search tool and an educational sandbox for the **U.S. Web Design System (USWDS)**, focusing on **USWDS compliance**, **Section 508 Accessibility**, and **Design Tokens**.

## Key Features

- **Zero-Trust Research:** Citations link directly to the exact second in the video (e.g., `[04:23]`), allowing for instant verification of AI-generated answers.
- **Intelligent Ingestion:** Automatically handles single videos, playlists, or entire channels using `yt-dlp`.
- **Hybrid Search Architecture:** Combines semantic Vector Search (ChromaDB) with keyword-based BM25 retrieval using **Reciprocal Rank Fusion (RRF)** for high-precision results.
- **Parent-Child Indexing:** Uses a "Small-to-Big" retrieval strategy. Small chunks (child nodes) are used for precise matching, while larger context windows (parent nodes) are provided to the LLM for synthesis.
- **Federal Design Standards:** Built with USWDS (@trussworks/react-uswds) and Tailwind CSS, featuring a tokenized styling architecture via **Style Dictionary**.

## Tech Stack

### Frontend
- **Core:** React 19, Vite, TypeScript, React Router
- **Design:** USWDS, Tailwind CSS, Style Dictionary (v5)
- **Performance:** React Virtual for list virtualization
- **Testing:** Vitest, Vitest-Axe (A11y testing), Storybook

### Backend
- **Core:** FastAPI, Python 3.12+, Poetry
- **Orchestration:** LlamaIndex
- **Vector Store:** ChromaDB (local)
- **Models:** Google Gemini `gemini-2.5-flash` (LLM) and OpenAI `text-embedding-3-small` (Embeddings)
- **Extraction:** `yt-dlp` and `youtube-transcript-api`

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.12+ with [Poetry](https://python-poetry.org/)
- OpenAI API Key (embeddings)
- Google API Key (LLM) — get one at [Google AI Studio](https://aistudio.google.com/)
- **Webshare rotating residential proxy** — required to fetch transcripts without being IP-blocked by YouTube. Purchase a "Residential" package (not "Proxy Server" or "Static Residential") at [Webshare](https://www.webshare.io/). See the [youtube-transcript-api docs](https://github.com/jdepoix/youtube-transcript-api#working-around-ip-bans) for background on why this is necessary*. 
  - *Adittionally, `youtube-transcript-api` can be configured to be used without a proxy, see the above docs for details.
- **Google Chrome** — required for ingesting private or age-restricted videos (the backend uses your local browser cookies for authentication)

### 1. Setup Backend

```bash
cd backend

# Install dependencies
poetry install

# Copy the example env file and fill in your values
cp .env-example .env
```

Edit `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key

# Optional: use local browser cookies to access age-restricted or private content
YOUTUBE_SOURCE_BROWSER=chrome

# Optional but recommended for cloud deployments — see Proxy section below
WEBSHARE_PROXY_USERNAME=
WEBSHARE_PROXY_PASSWORD=
```

Lock down file permissions so only your user can read the file:

```bash
chmod 600 backend/.env
```

Start the backend:

```bash
cd backend
poetry run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run Storybook
npm run storybook
```

### 3. Usage

1. Open `http://localhost:5173`.
2. **Ingest:** Paste a YouTube URL (video, playlist, or channel). Processing runs in the background — up to 10 videos per batch.
3. **Chat:** Ask questions about the ingested content.
4. **Verify:** Click timestamps in citations to jump to the exact moment in the video.

## Working Around IP Bans (Cloud Deployments)

YouTube blocks most cloud provider IPs (AWS, GCP, Azure, etc.). If you're running this on a server or seeing `RequestBlocked` / `IpBlocked` errors, you need a rotating residential proxy.

### Webshare Setup

1. Create an account at [Webshare](https://www.webshare.io/) and purchase a **Residential** proxy package (not "Proxy Server" or "Static Residential").
2. Go to [Proxy Settings](https://proxy2.webshare.io/proxy/settings) to retrieve your **Proxy Username** and **Proxy Password**.
3. Add them to `backend/.env`:

```env
WEBSHARE_PROXY_USERNAME=your_proxy_username
WEBSHARE_PROXY_PASSWORD=your_proxy_password
```

When both values are set, the backend will automatically route all transcript fetches through Webshare's rotating residential proxy pool. No other configuration is needed.

If the variables are absent or empty, the backend falls back to direct requests (fine for local development).

## Project Structure

```
.
├── frontend/               # React application
│   └── src/
│       ├── tokens/         # 3-tier design tokens (Base, Semantic, Component)
│       ├── components/     # USWDS-compliant UI components + Storybook stories
│       └── pages/          # Main views (Ingestion, Chat)
└── backend/                # FastAPI application
    ├── .env-example        # Environment variable template
    └── app/
        ├── api/v1/         # REST endpoints (ingest, chat, status, clear)
        └── services/       # Core logic
            ├── yt_dlp_service.py       # Video/playlist/channel URL resolution
            ├── transcript_service.py   # Transcript fetching + proxy config
            ├── indexing_service.py     # ChromaDB ingestion + parent-child chunking
            └── retrieval_service.py    # Hybrid BM25 + vector search with RRF
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/ingest` | Start background ingestion of a YouTube URL |
| `GET` | `/api/v1/ingest/status/{job_id}` | Poll ingestion job progress |
| `POST` | `/api/v1/chat` | Query indexed transcripts with conversation history |
| `GET` | `/api/v1/sources` | List all indexed video sources |
| `DELETE` | `/api/v1/sources` | Clear all indexed data |
| `GET` | `/health` | Health check |

## Testing

```bash
# Backend
cd backend && poetry run pytest

# Frontend + accessibility
cd frontend && npm test
```

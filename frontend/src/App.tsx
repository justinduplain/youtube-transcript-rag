import { useState, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { UrlIngestionForm } from './components/forms/UrlIngestionForm';
import { TestTranscriptCardPage } from './pages/TestTranscriptCardPage';
import { VirtualTranscriptPage } from './pages/VirtualTranscriptPage';
import { ChatPage } from './pages/ChatPage';

function App() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleIngest = async (url: string) => {
    console.log('Ingesting:', url);
    if (pollRef.current) clearInterval(pollRef.current);
    setLoading(true);
    setStatusMessage('Uploading...');

    try {
      const response = await fetch('http://localhost:8000/api/v1/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Ingestion failed');
      }

      const data = await response.json();
      const total: number = data.video_ids?.length ?? 0;
      const jobId: string = data.job_id;

      setStatusMessage(`Processing video 1/${total}...`);

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`http://localhost:8000/api/v1/ingest/status/${jobId}`);
          if (!statusRes.ok) return;
          const status = await statusRes.json();

          if (status.status === 'complete') {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setStatusMessage(`Done. ${total} video${total !== 1 ? 's' : ''} ingested.`);
            setLoading(false);
          } else {
            setStatusMessage(`Processing video ${status.current}/${total}...`);
          }
        } catch {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setStatusMessage('Lost connection to backend.');
          setLoading(false);
        }
      }, 1500);

    } catch (error) {
      console.error('Ingestion error:', error);
      setStatusMessage('Failed to start ingestion. Make sure the backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-uswds-color-gray-5">
      <header className="usa-header usa-header--basic bg-white border-bottom border-base-lighter">
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <div className="usa-logo">
              <em className="usa-logo__text text-ink font-heading-lg">
                <Link to="/" title="Home" aria-label="Home">
                  YouTube RAG Pipeline
                </Link>
              </em>
            </div>
            <nav aria-label="Primary navigation" className="usa-nav">
              <ul className="usa-nav__primary usa-accordion">
                <li className="usa-nav__primary-item">
                  <Link className="usa-nav__link" to="/">
                    <span>Ingestion</span>
                  </Link>
                </li>
                <li className="usa-nav__primary-item">
                  <Link className="usa-nav__link" to="/chat">
                    <span>Chat</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <Routes>
        <Route 
          path="/" 
          element={
            <main className="grid-container padding-y-4">
              <div className="bg-white padding-4 radius-lg border border-base-lighter shadow-1">
                <h1 className="font-heading-xl margin-top-0">Data Ingestion</h1>
                <p className="usa-intro text-base-dark">
                  1) Embed: Enter a YouTube Video URL or Playlist URL to extract the transcripts and generate embeddings for the vector store.
                </p>
                <p className="usa-intro text-base-dark">
                  2) Chat: Once they are processed, ask any questions about the videos in the video/playlist and get answers with time stamps. 
                </p>
                <p className="text-base-dark sm">
                  **To use private playlists, you must be using chrome browser and be signed in to your google account.
                </p>
                <div className="margin-top-4">
                  <UrlIngestionForm onSubmit={handleIngest} isLoading={loading} statusMessage={statusMessage} />
                </div>
              </div>
            </main>
          } 
        />
        <Route 
          path="/chat" 
          element={<ChatPage />} 
        />
        <Route 
          path="/transcript" 
          element={<TestTranscriptCardPage />} 
        />
        <Route 
          path="/virtual-transcript" 
          element={<VirtualTranscriptPage />} 
        />
      </Routes>
    </div>
  );
}

export default App;
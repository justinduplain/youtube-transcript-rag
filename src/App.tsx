import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { UrlIngestionForm } from './components/forms/UrlIngestionForm';
import { TestTranscriptCardPage } from './pages/TestTranscriptCardPage';

function App() {
  const [loading, setLoading] = useState(false);

  const handleIngest = (url: string) => {
    console.log('Ingesting:', url);
    setLoading(true);
    
    // Simulate API call to Python backend
    setTimeout(() => {
      setLoading(false);
      alert(`Ingestion started for: ${url}`);
    }, 2000);
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
                  <Link className="usa-nav__link" to="/transcript">
                    <span>Transcript Test</span>
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
                  Enter a YouTube video URL to extract the transcript and generate embeddings for the vector store.
                </p>
                <div className="margin-top-4">
                  <UrlIngestionForm onSubmit={handleIngest} isLoading={loading} />
                </div>
              </div>
            </main>
          } 
        />
        <Route 
          path="/transcript" 
          element={<TestTranscriptCardPage />} 
        />
      </Routes>
    </div>
  );
}

export default App;
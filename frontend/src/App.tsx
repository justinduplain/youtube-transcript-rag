import { Routes, Route, Link } from 'react-router-dom';
import { WorkspacePage } from './pages/WorkspacePage';
import { TestTranscriptCardPage } from './pages/TestTranscriptCardPage';
import { VirtualTranscriptPage } from './pages/VirtualTranscriptPage';

function App() {
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
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<WorkspacePage />} />
        <Route path="/transcript" element={<TestTranscriptCardPage />} />
        <Route path="/virtual-transcript" element={<VirtualTranscriptPage />} />
      </Routes>
    </div>
  );
}

export default App;

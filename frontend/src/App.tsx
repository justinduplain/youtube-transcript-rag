import { Routes, Route, Link } from 'react-router-dom';
import { Icon } from '@trussworks/react-uswds';
import { WorkspacePage } from './pages/WorkspacePage';
import { TestTranscriptCardPage } from './pages/TestTranscriptCardPage';
import { VirtualTranscriptPage } from './pages/VirtualTranscriptPage';
import { PlayButtonRobotIcon } from './components/icons/PlayButtonRobotIcon';

function App() {
  return (
    <div className="min-h-screen bg-uswds-color-gray-5">
      <header className="usa-header usa-header--basic bg-white border-bottom border-base-lighter" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="usa-nav-container" style={{ maxWidth: '100%', margin: 0, padding: '0 1rem' }}>
          <div className="usa-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="usa-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlayButtonRobotIcon size={28} />
              <em className="usa-logo__text text-ink font-heading-lg" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)', whiteSpace: 'nowrap' }}>
                <Link to="/" title="Home" aria-label="Home">
                  YouTube RAG Pipeline
                </Link>
              </em>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
              <a
                href="https://github.com/justinduplain/youtube-transcript-rag"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                style={{ color: 'inherit', display: 'flex' }}
              >
                <Icon.Github size={3} role="presentation" />
              </a>
              <a
                href="https://justinduplain.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                style={{ color: 'inherit', display: 'flex' }}
              >
                <Icon.Language size={3} role="presentation" />
              </a>
              <a
                href="https://linkedin.com/in/justinduplain"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{ color: 'inherit', display: 'flex' }}
              >
                <Icon.LinkedIn size={3} role="presentation" />
              </a>
            </nav>
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

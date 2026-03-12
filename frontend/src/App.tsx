import { useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  Icon,
  Modal,
  ModalHeading,
  ModalFooter,
  ModalToggleButton,
} from '@trussworks/react-uswds';
import type { ModalRef } from '@trussworks/react-uswds';
import { WorkspacePage } from './pages/WorkspacePage';
import { TestTranscriptCardPage } from './pages/TestTranscriptCardPage';
import { VirtualTranscriptPage } from './pages/VirtualTranscriptPage';
import { PlayButtonRobotIcon } from './components/icons/PlayButtonRobotIcon';

function App() {
  const aboutModalRef = useRef<ModalRef>(null);

  return (
    <div className="min-h-screen bg-uswds-color-gray-5">
      <header className="usa-header usa-header--basic bg-white border-bottom border-base-lighter" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="usa-nav-container" style={{ maxWidth: '100%', margin: 0, padding: '0 1rem' }}>
          <div className="usa-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="usa-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlayButtonRobotIcon size={28} />
              <div>
                <em className="usa-logo__text text-ink font-heading-lg" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)', whiteSpace: 'nowrap' }}>
                  <Link to="/" title="Home" aria-label="Home">
                    YouTube RAG Pipeline
                  </Link>
                </em>
                <a
                  href="https://justinduplain.com"
                  className="display-flex flex-align-center text-base-dark font-body-3xs text-no-underline"
                  style={{ gap: '0.15rem', marginTop: '0.25rem' }}
                >
                  <Icon.ArrowBack size={3} role="presentation" style={{ width: '0.75rem', height: '0.75rem' }} />
                  back to justinduplain.com
                </a>
              </div>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
              <ModalToggleButton
                modalRef={aboutModalRef}
                opener
                unstyled
                aria-label="About this project"
                style={{ color: 'inherit', display: 'flex', cursor: 'pointer' }}
              >
                <Icon.InfoOutline size={3} role="presentation" />
              </ModalToggleButton>
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

      <Modal
        ref={aboutModalRef}
        id="about-modal"
        aria-labelledby="about-modal-heading"
        isLarge
      >
        <ModalHeading id="about-modal-heading">About YouTube RAG Pipeline</ModalHeading>

        <div className="usa-prose">
          <p>
            Paste a YouTube video or playlist URL, and this app will pull the transcript, index it,
            and let you ask questions about it. Every answer includes clickable timestamps that jump
            to the exact moment in the video, so you can verify anything the AI tells you.
          </p>

          <h4>How it works</h4>
          <p>
            When you submit a URL, the backend fetches the transcript and splits it into
            overlapping chunks at two levels: small pieces for accurate search, and larger
            surrounding context for the AI to read. Your questions are searched against both
            a keyword index and a meaning-based index at the same time, and the best results
            from both are combined before the AI writes its answer.
          </p>

          <h4>Why timestamps matter</h4>
          <p>
            Each citation links to the exact second in the source video. Click any timestamp
            in an answer to watch the original moment yourself. This is what makes it a
            research tool instead of just another chatbot.
          </p>

          <h4>Built with</h4>
          <p>
            <strong>Frontend:</strong> React 19, TypeScript, USWDS (U.S. Web Design System)<br />
            <strong>Backend:</strong> FastAPI, Python, LlamaIndex, ChromaDB<br />
            <strong>AI:</strong> Google Gemini (answers), OpenAI (search embeddings)<br />
            <strong>Deployed on:</strong> AWS EC2 with nginx
          </p>
        </div>

        <ModalFooter>
          <ModalToggleButton modalRef={aboutModalRef} closer>
            Close
          </ModalToggleButton>
        </ModalFooter>
      </Modal>

      <Routes>
        <Route path="/" element={<WorkspacePage />} />
        <Route path="/transcript" element={<TestTranscriptCardPage />} />
        <Route path="/virtual-transcript" element={<VirtualTranscriptPage />} />
      </Routes>
    </div>
  );
}

export default App;

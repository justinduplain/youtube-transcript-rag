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

      <Modal ref={aboutModalRef} id="about-modal" isLarge>
        <ModalHeading>About YouTube RAG Pipeline</ModalHeading>

        <div className="usa-prose">
          <p>
            A Retrieval-Augmented Generation (RAG) system that lets you chat with YouTube videos.
            Paste a video or playlist URL, and ask questions with answers cited to the exact second.
          </p>

          <h4>Ingestion</h4>
          <p>
            <strong>yt-dlp</strong> resolves video and playlist URLs.{' '}
            <strong>youtube-transcript-api</strong> fetches transcripts, with rotating residential proxy
            support for cloud deployments where YouTube blocks datacenter IPs.
          </p>

          <h4>Indexing</h4>
          <p>
            Transcripts are split using a <strong>parent-child chunking</strong> strategy: small chunks
            (256 tokens) for precise matching, larger parent chunks (1,024 tokens) for LLM context.
            Embeddings are generated with OpenAI <code>text-embedding-3-small</code> and stored
            in <strong>ChromaDB</strong>.
          </p>

          <h4>Retrieval</h4>
          <p>
            Queries run through <strong>hybrid search</strong>: semantic vector search plus BM25 keyword
            search, fused via <strong>Reciprocal Rank Fusion (RRF)</strong> for high-precision results.
          </p>

          <h4>Generation</h4>
          <p>
            Google <strong>Gemini 2.5 Flash</strong> synthesizes answers from retrieved context, with
            timestamped citations that link directly to the source video.
          </p>

          <h4>Tech Stack</h4>
          <p>
            <strong>Frontend:</strong> React, Vite, TypeScript, USWDS (U.S. Web Design System)<br />
            <strong>Backend:</strong> FastAPI, LlamaIndex, ChromaDB, Python<br />
            <strong>Models:</strong> OpenAI (embeddings), Google Gemini (LLM)
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

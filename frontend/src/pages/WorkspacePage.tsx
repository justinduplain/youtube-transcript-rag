import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@trussworks/react-uswds';
import { SourcesSidebar } from '../components/sidebar/SourcesSidebar';
import { ChatInterface } from '../components/chat/ChatInterface';

export interface IngestionSource {
  url: string;
  label: string;
  videoCount: number;
  status: 'processing' | 'complete' | 'error';
  type: 'video' | 'playlist';
}

export const WorkspacePage = () => {
  const [sources, setSources] = useState<IngestionSource[]>([]);
  const [isAddingMore, setIsAddingMore] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [statusIsError, setStatusIsError] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('/api/v1/sources')
      .then((res) => res.json())
      .then((data: Array<{ source_url: string; source_title: string; source_type: string; video_count: number }>) => {
        if (data.length > 0) {
          setSources(
            data.map((s) => ({
              url: s.source_url,
              label: s.source_title || s.source_url,
              videoCount: s.video_count,
              status: 'complete',
              type: s.source_type === 'playlist' ? 'playlist' : 'video',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleIngest = async (url: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setIngestLoading(true);
    setStatusMessage('Uploading...');
    setStatusIsError(false);

    const newSource: IngestionSource = {
      url,
      label: url.length > 40 ? url.slice(0, 37) + '...' : url,
      videoCount: 0,
      status: 'processing',
      type: 'video',
    };
    setSources((prev) => [...prev, newSource]);

    try {
      const response = await fetch('/api/v1/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail ?? '';
        const isDuplicate = detail.includes('already indexed');
        throw Object.assign(new Error(detail || 'Ingestion failed'), { isDuplicate });
      }

      const data = await response.json();
      const total: number = data.video_ids?.length ?? 0;
      const jobId: string = data.job_id;
      const resolvedLabel = data.source_title || (url.length > 40 ? url.slice(0, 37) + '...' : url);
      const resolvedType: 'video' | 'playlist' = data.source_type === 'playlist' ? 'playlist' : 'video';
      setSources((prev) =>
        prev.map((s) => (s.url === url ? { ...s, label: resolvedLabel, type: resolvedType } : s))
      );

      setStatusMessage(`Processing video 1/${total}...`);

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/v1/ingest/status/${jobId}`);
          if (!statusRes.ok) return;
          const status = await statusRes.json();

          if (status.status === 'complete') {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setStatusMessage(`Done. ${total} video${total !== 1 ? 's' : ''} ingested.`);
            setIngestLoading(false);
            setIsAddingMore(false);
            setSources((prev) =>
              prev.map((s) =>
                s.url === url ? { ...s, status: 'complete', videoCount: total } : s
              )
            );
          } else {
            setStatusMessage(`Processing video ${status.current}/${total}...`);
          }
        } catch {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setStatusMessage('Lost connection to backend.');
          setIngestLoading(false);
          setSources((prev) =>
            prev.map((s) => (s.url === url ? { ...s, status: 'error' } : s))
          );
        }
      }, 1500);
    } catch (error) {
      console.error('Ingestion error:', error);
      const isDuplicate = error instanceof Error && (error as Error & { isDuplicate?: boolean }).isDuplicate;
      setStatusIsError(true);
      if (isDuplicate) {
        alert('Import cancelled: playlist/video source already exists.');
        setStatusMessage('Import cancelled: playlist/video source already exists.');
        setSources((prev) => prev.filter((s) => !(s.url === url && s.status === 'processing')));
      } else {
        setStatusMessage('Failed to start ingestion. Make sure the backend is running.');
        setSources((prev) =>
          prev.map((s) => (s.url === url && s.status === 'processing' ? { ...s, status: 'error' } : s))
        );
      }
      setIngestLoading(false);
    }
  };

  const handleClearAll = async () => {
    await fetch('/api/v1/sources', { method: 'DELETE' });
    setSources([]);
    setStatusMessage(undefined);
    setIsAddingMore(false);
    setChatKey((k) => k + 1);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIngestLoading(false);
  };

  return (
    <main style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {sidebarOpen && (
        <SourcesSidebar
          sources={sources}
          isAddingMore={isAddingMore || sources.length === 0}
          onAddMore={() => setIsAddingMore(true)}
          onIngest={handleIngest}
          ingestLoading={ingestLoading}
          statusMessage={statusMessage}
          statusIsError={statusIsError}
          onClearAll={handleClearAll}
          onCollapse={toggleSidebar}
        />
      )}
      <div className="flex-1 display-flex flex-column overflow-hidden padding-4">
        {!sidebarOpen && (
          <button
            className="usa-button usa-button--unstyled font-body-sm text-bold text-uppercase text-base-dark margin-bottom-1 display-flex flex-align-center"
            onClick={toggleSidebar}
            style={{ alignSelf: 'flex-start' }}
            title="Show sources"
          >
            <Icon.ExpandLess size={3} role="presentation" />
            Sources
          </button>
        )}
        <ChatInterface key={chatKey} />
      </div>
    </main>
  );
};

import { useState, useRef, useEffect } from 'react';
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
  const [chatKey, setChatKey] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      if (!response.ok) throw new Error('Ingestion failed');

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
      setStatusMessage('Failed to start ingestion. Make sure the backend is running.');
      setIngestLoading(false);
      setSources((prev) =>
        prev.map((s) => (s.url === url ? { ...s, status: 'error' } : s))
      );
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
      <SourcesSidebar
        sources={sources}
        isAddingMore={isAddingMore || sources.length === 0}
        onAddMore={() => setIsAddingMore(true)}
        onIngest={handleIngest}
        ingestLoading={ingestLoading}
        statusMessage={statusMessage}
        onClearAll={handleClearAll}
      />
      <div className="flex-1 display-flex flex-column overflow-hidden padding-4">
        <ChatInterface key={chatKey} />
      </div>
    </main>
  );
};

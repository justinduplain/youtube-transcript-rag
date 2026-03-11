import React, { useState } from 'react';
import { CmmUrlInput } from '../inputs/CmmUrlInput';
import { CmmButton } from '../buttons/CmmButton';

interface UrlIngestionFormProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  statusMessage?: string;
  statusIsError?: boolean;
  compact?: boolean;
}

export const UrlIngestionForm = ({ onSubmit, isLoading = false, statusMessage, statusIsError = false, compact = false }: UrlIngestionFormProps) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid YouTube URL.');
      return;
    }
    setError(undefined);
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="usa-form max-w-2xl">
      <div className="grid-row grid-gap">
        <div className="grid-col-fill">
          <CmmUrlInput
            id="youtube-url"
            label={compact ? '' : 'YouTube Source (playlist/video)'}
            placeholder={compact ? 'Paste YouTube URL...' : 'https://www.youtube.com/watch?v=...'}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={error}
            disabled={isLoading}
          />
        </div>
        <div className="grid-col-auto display-flex flex-align-end">
          <CmmButton
            type="submit"
            variant="gold"
            disabled={isLoading}
            className="margin-top-0"
          >
            Ingest
          </CmmButton>
        </div>
      </div>
      {statusMessage && (
        <p
          className={`${statusIsError ? 'usa-error-message' : 'text-base'} font-body-sm margin-top-1 margin-bottom-0`}
        >
          {statusMessage}
        </p>
      )}
    </form>
  );
};

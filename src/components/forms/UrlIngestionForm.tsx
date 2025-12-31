import React, { useState } from 'react';
import { CmmUrlInput } from '../inputs/CmmUrlInput';
import { CmmButton } from '../buttons/CmmButton';

interface UrlIngestionFormProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export const UrlIngestionForm = ({ onSubmit, isLoading = false }: UrlIngestionFormProps) => {
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
            label="YouTube Source"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={error}
            disabled={isLoading}
          />
        </div>
        <div className="grid-col-auto display-flex flex-align-end padding-bottom-1">
          <CmmButton 
            type="submit" 
            variant="gold"
            disabled={isLoading}
            className="margin-top-0"
          >
            {isLoading ? 'Processing...' : 'Ingest'}
          </CmmButton>
        </div>
      </div>
    </form>
  );
};
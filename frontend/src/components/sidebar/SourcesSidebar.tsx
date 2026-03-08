import type { IngestionSource } from '../../pages/WorkspacePage';
import { UrlIngestionForm } from '../forms/UrlIngestionForm';

interface SourcesSidebarProps {
  sources: IngestionSource[];
  isAddingMore: boolean;
  onAddMore: () => void;
  onIngest: (url: string) => void;
  ingestLoading: boolean;
  statusMessage?: string;
  onClearAll: () => void;
}

const statusLabel = (status: IngestionSource['status']) => {
  if (status === 'processing') return 'Processing...';
  if (status === 'complete') return 'Ready';
  return 'Error';
};

const statusClass = (status: IngestionSource['status']) => {
  if (status === 'processing') return 'text-base-dark';
  if (status === 'complete') return 'text-green';
  return 'text-red';
};

export const SourcesSidebar = ({
  sources,
  isAddingMore,
  onAddMore,
  onIngest,
  ingestLoading,
  statusMessage,
  onClearAll,
}: SourcesSidebarProps) => {
  return (
    <aside
      style={{ width: '280px', flexShrink: 0 }}
      className="border-right border-base-lighter padding-2 overflow-y-auto"
    >
      <div className="display-flex flex-align-center flex-justify margin-bottom-2 margin-top-1">
        <p className="font-body-sm text-bold text-uppercase text-base margin-0">
          Sources
        </p>
        {sources.length > 0 && (
          <button
            className="usa-button usa-button--unstyled font-body-3xs text-secondary"
            onClick={onClearAll}
          >
            Clear all
          </button>
        )}
      </div>

      {sources.length === 0 ? (
        <UrlIngestionForm
          onSubmit={onIngest}
          isLoading={ingestLoading}
          statusMessage={statusMessage}
          compact
        />
      ) : (
        <>
          <ul className="usa-list usa-list--unstyled margin-bottom-2">
            {sources.map((source) => (
              <li
                key={source.url}
                className="padding-y-1 border-bottom border-base-lighter"
              >
                <p className="font-body-xs margin-0 text-ink" title={source.url}>
                  {source.label}
                </p>
                <p className="font-body-xs margin-0 text-base">
                  {source.videoCount > 0 && `${source.videoCount} video${source.videoCount !== 1 ? 's' : ''} · `}
                  <span className={statusClass(source.status)}>
                    {statusLabel(source.status)}
                  </span>
                </p>
              </li>
            ))}
          </ul>

          {isAddingMore ? (
            <UrlIngestionForm
              onSubmit={onIngest}
              isLoading={ingestLoading}
              statusMessage={statusMessage}
              compact
            />
          ) : (
            <button
              className="usa-button usa-button--unstyled font-body-xs"
              onClick={onAddMore}
            >
              + Add more
            </button>
          )}
        </>
      )}
    </aside>
  );
};

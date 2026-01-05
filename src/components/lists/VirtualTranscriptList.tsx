import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CmmTranscriptCard } from '../cards/CmmTranscriptCard';

export interface TranscriptItem {
  id: string | number;
  timestamp: string;
  speaker: string;
  text: string;
}

export interface VirtualTranscriptListProps {
  items: TranscriptItem[];
  height?: string | number;
  className?: string;
}

export const VirtualTranscriptList = ({
  items,
  height = '600px',
  className = '',
}: VirtualTranscriptListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimate row height
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto border border-uswds-color-gray-10 rounded-lg bg-uswds-color-gray-5 ${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
                padding: '0.5rem', 
              }}
            >
              <CmmTranscriptCard
                timestamp={item.timestamp}
                speaker={item.speaker}
                text={item.text}
                className="h-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

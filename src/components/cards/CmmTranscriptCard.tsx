import React from 'react';

export interface CmmTranscriptCardProps {
  /** The timestamp of the transcript segment (e.g., "00:23.123") */
  timestamp: string;
  /** The name of the speaker */
  speaker: string;
  /** The transcript text content */
  text: string;
  /** Additional classes for custom styling */
  className?: string;
}

export const CmmTranscriptCard = ({
  timestamp,
  speaker,
  text,
  className = '',
}: CmmTranscriptCardProps) => {
  return (
    <div
      className={`
        bg-white border border-uswds-color-gray-10 rounded-lg p-4 
        shadow-sm hover:shadow-md transition-shadow duration-200 
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm text-uswds-color-gray-50">
          [{timestamp}]
        </span>
        <span className="font-sans font-semibold text-sm text-uswds-color-gray-90">
          {speaker}
        </span>
      </div>
      <p className="font-sans text-base text-uswds-color-gray-70 m-0">
        {text}
      </p>
    </div>
  );
};
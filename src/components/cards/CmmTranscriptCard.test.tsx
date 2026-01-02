import { render } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import { toHaveNoViolations } from 'vitest-axe';
import { CmmTranscriptCard } from './CmmTranscriptCard';

// Extend Vitest's expect with axe-core matchers
expect.extend(toHaveNoViolations);

describe('CmmTranscriptCard', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(
      <CmmTranscriptCard
        timestamp="00:05.123"
        speaker="Interviewer"
        text="This is a sample transcript segment to test accessibility."
      />
    );
    await expect(container).toHaveNoViolations();
  });

  it('should render with provided props', () => {
    const { getByText } = render(
      <CmmTranscriptCard
        timestamp="00:10.000"
        speaker="Speaker 1"
        text="Hello world, this is a test."
      />
    );

    expect(getByText('[00:10.000]')).toBeInTheDocument();
    expect(getByText('Speaker 1')).toBeInTheDocument();
    expect(getByText('Hello world, this is a test.')).toBeInTheDocument();
  });
});
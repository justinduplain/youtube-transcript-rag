import type { Meta, StoryObj } from '@storybook/react';
import { CmmTranscriptCard } from './CmmTranscriptCard';

const meta = {
  title: 'Design System/Cards/CmmTranscriptCard',
  component: CmmTranscriptCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A "high-density" card component designed to display a single segment of a transcript. It includes a timestamp, speaker, and the transcript text, styled using the project\'s typography tokens. This component is a building block for displaying transcript feeds in a case management system context.',
      },
    },
  },
  argTypes: {
    timestamp: { control: 'text' },
    speaker: { control: 'text' },
    text: { control: 'text' },
  },
} satisfies Meta<typeof CmmTranscriptCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    timestamp: '01:45.321',
    speaker: 'Speaker 1',
    text: 'This is a sample transcript segment. It demonstrates the default appearance of the transcript card component.',
  },
  parameters: {
    docs: {
      description: {
        story: 'The default view of a single transcript card with a standard length of text.',
      },
    },
  },
};

export const LongText: Story = {
  args: {
    timestamp: '02:10.555',
    speaker: 'Speaker 2',
    text: 'This is a much longer transcript segment to demonstrate how the card handles larger amounts of text. The content should wrap naturally within the card\'s boundaries, and the layout should remain consistent and readable even with multiple lines of text flowing in the main content area.',
  },
  parameters: {
    docs: {
      description: {
        story: 'A transcript card with a longer text block to demonstrate how content wraps within the component.',
      },
    },
  },
};

export const HighDensity: Story = {
    render: (args) => (
        <div className="max-w-xl">
            <h2 className="font-heading-lg mb-2">Transcript Feed</h2>
            <div className="flex flex-col gap-2">
                <CmmTranscriptCard 
                    timestamp="00:05.123"
                    speaker="Interviewer"
                    text="Welcome to the show. Can you tell us about your recent work?"
                />
                <CmmTranscriptCard 
                    timestamp="00:08.456"
                    speaker="Guest"
                    text="Absolutely. We\'ve been focusing on improving the user experience by leveraging real-time data streams."
                />
                <CmmTranscriptCard 
                    timestamp="00:12.789"
                    speaker="Interviewer"
                    text="That sounds fascinating. What kind of challenges did you face?"
                />
            </div>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'A demonstration of multiple transcript cards stacked in a feed, as they might appear in the application. This shows how the cards look in a "high-density" list view.',
            },
        },
    },
}

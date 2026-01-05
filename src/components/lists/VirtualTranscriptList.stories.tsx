import type { Meta, StoryObj } from '@storybook/react';
import { VirtualTranscriptList } from './VirtualTranscriptList';
import largeDataset from '../../data/large-transcript-dataset.json';

const meta: Meta<typeof VirtualTranscriptList> = {
  title: 'Lists/VirtualTranscriptList',
  component: VirtualTranscriptList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VirtualTranscriptList>;

export const Default: Story = {
  args: {
    items: largeDataset.slice(0, 100), // Smaller subset for default view
    height: '400px',
  },
};

export const LargeDataset: Story = {
  args: {
    items: largeDataset.slice(0, 1000),
    height: '600px',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story renders 1,000 items using virtualization. (Reduced from 10,000 for Storybook stability).',
      },
    },
  },
};

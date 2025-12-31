import type { Meta, StoryObj } from '@storybook/react';
import { CmmUrlInput } from './CmmUrlInput';

const meta = {
  title: 'Design System/Inputs/UrlInput',
  component: CmmUrlInput,
  tags: ['autodocs'],
  args: {
    id: 'youtube-url',
    label: 'YouTube Channel or Video URL',
    placeholder: 'https://youtube.com/...',
  },
} satisfies Meta<typeof CmmUrlInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default State
export const Default: Story = {};

// 2. With Helper Text
export const WithHint: Story = {
  args: {
    hint: 'Paste the full URL to begin ingestion.',
  },
};

// 3. Error State
export const ErrorState: Story = {
  args: {
    hint: 'Paste the full URL to begin ingestion.',
    error: 'Invalid URL format. Please start with https://.',
    defaultValue: 'htp://bad-url.com',
  },
};
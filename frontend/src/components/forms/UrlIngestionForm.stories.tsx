import type { Meta, StoryObj } from '@storybook/react';
import { UrlIngestionForm } from './UrlIngestionForm';

const meta = {
  title: 'Design System/Forms/UrlIngestionForm',
  component: UrlIngestionForm,
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submit' },
    isLoading: { control: 'boolean' },
  },
} satisfies Meta<typeof UrlIngestionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
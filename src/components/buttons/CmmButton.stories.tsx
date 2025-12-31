import type { Meta, StoryObj } from '@storybook/react';
// Import is now simple because they are siblings
import { CmmButton } from '../buttons/CmmButton';

const meta = {
  // Update the title to reflect the folder structure in the Storybook Sidebar
  title: 'Design System/Buttons/CmmButton',
  component: CmmButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'gold'],
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof CmmButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Submit Primary',
  },
};

export const Gold: Story = {
  args: {
    variant: 'gold',
    children: 'Submit Gold',
  },
};
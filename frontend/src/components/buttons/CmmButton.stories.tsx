import type { Meta, StoryObj } from '@storybook/react';
// Import is now simple because they are siblings
import { CmmButton } from '../buttons/CmmButton';

const meta = {
  // Update the title to reflect the folder structure in the Storybook Sidebar
  title: 'Design System/Buttons/CmmButton',
  component: CmmButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A wrapper around the base USWDS Button component to provide CMM-specific variants and styling. This component leverages the custom CMM layer in the CSS architecture to override default USWDS styles for specific variants like "gold".',
      },
    },
  },
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
    children: 'Primary Action',
    variant: 'primary',
    type: 'button',
  },
  parameters: {
    docs: {
      description: {
        story: 'The primary button variant, which uses the default USWDS blue style. This is the standard call-to-action button.',
      },
    },
  },
};

export const Gold: Story = {
  args: {
    variant: 'gold',
    children: 'Submit Gold',
    type: 'button',
  },
  parameters: {
    docs: {
      description: {
        story: 'The "gold" variant, which demonstrates a custom CMM-specific style override. The background color for this button is defined in the `cmm` CSS layer, which takes precedence over the default USWDS styles.',
      },
    },
  },
};
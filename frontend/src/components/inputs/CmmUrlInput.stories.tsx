import type { Meta, StoryObj } from '@storybook/react';
import { CmmUrlInput } from './CmmUrlInput';

const meta = {
  title: 'Design System/Inputs/UrlInput',
  component: CmmUrlInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A 508-compliant URL input field built by composing `FormGroup`, `Label`, `ErrorMessage`, and `TextInput` from `@trussworks/react-uswds`. It demonstrates how to build accessible, application-specific form controls from USWDS primitives.',
      },
    },
  },
  args: {
    id: 'youtube-url',
    label: 'YouTube Channel or Video URL',
    placeholder: 'https://youtube.com/...',
  },
} satisfies Meta<typeof CmmUrlInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default State
export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: 'The default appearance of the URL input field with a label and placeholder text.'
            }
        }
    }
};

// 2. With Helper Text
export const WithHint: Story = {
  args: {
    hint: 'Paste the full URL to begin ingestion.',
  },
  parameters: {
    docs: {
        description: {
            story: 'The input field with an additional hint text to provide users with more context or instruction.'
        }
    }
  }
};

// 3. Error State
export const ErrorState: Story = {
  args: {
    hint: 'Paste the full URL to begin ingestion.',
    error: 'Invalid URL format. Please start with https://.',
    defaultValue: 'htp://bad-url.com',
  },
  parameters: {
    docs: {
        description: {
            story: 'The input field in an error state. The `FormGroup` component automatically applies the red border and the `ErrorMessage` component displays the error text when the `error` prop is provided.'
        }
    }
  }
};
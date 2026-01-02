import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TestTranscriptCardPage } from './TestTranscriptCardPage';

const meta = {
  title: 'Design System/Pages/TestTranscriptCardPage',
  component: TestTranscriptCardPage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A page component designed to display a paginated list of `CmmTranscriptCard` components. It handles URL-based pagination using `react-router-dom` and integrates the accessible USWDS `Pagination` component. This page serves as a demonstration and testing ground for the `CmmTranscriptCard` in an application context.',
      },
    },
    reactRouter: {
      routePath: '/transcript',
      routeParams: { page: '1' },
    },
  },
  decorators: [
    (Story, { parameters }) => {
      // Get route from story parameters
      const { routePath, routeParams } = parameters.reactRouter;
      const initialEntries = [`${routePath}?${new URLSearchParams(routeParams)}`];
      
      return (
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            {/* The story will be rendered at the route path */}
            <Route path={routePath} element={<Story />} />
          </Routes>
        </MemoryRouter>
      );
    },
  ],
} satisfies Meta<typeof TestTranscriptCardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Each story can override the default parameters
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Displays the first page of the transcript card list. This is the default view when no specific page number is provided in the URL, or when the URL parameter defaults to 1.',
      },
    },
    reactRouter: {
      routePath: '/transcript',
      routeParams: { page: '1' },
    },
  },
};

export const PageTwo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Displays the second page of the transcript card list. This demonstrates navigation to a valid subsequent page.',
      },
    },
    reactRouter: {
      routePath: '/transcript',
      routeParams: { page: '2' },
    },
  },
};

export const PageInvalid: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Displays the state when an invalid page number (e.g., beyond the total pages, or a non-numeric value) is provided in the URL. The component should show a "Page Not Found or Invalid" message.',
      },
    },
    reactRouter: {
      routePath: '/transcript',
      routeParams: { page: '999' }, // Test invalid page number
    },
  },
};
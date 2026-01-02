import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TestTranscriptCardPage } from './TestTranscriptCardPage';

const meta = {
  title: 'Design System/Pages/TestTranscriptCardPage',
  component: TestTranscriptCardPage,
  tags: ['autodocs'],
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
  parameters: {
    // Set a default route for all stories in this file
    reactRouter: {
      routePath: '/transcript',
      routeParams: { page: '1' },
    },
  },
} satisfies Meta<typeof TestTranscriptCardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Each story can override the default parameters
export const Default: Story = {
  args: {},
  parameters: {
    reactRouter: {
      routePath: '/transcript',
      routeParams: { page: '1' },
    },
  },
};

export const PageTwo: Story = {
  args: {},
  parameters: {
    reactRouter: {
      routePath: '/transcript',
      routeParams: { page: '2' },
    },
  },
};

export const PageInvalid: Story = {
  args: {},
  parameters: {
    reactRouter: {
      routePath: '/transcript',
      routeParams: { page: '999' }, // Test invalid page number
    },
  },
};
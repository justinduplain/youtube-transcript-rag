import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';

export const ChatPage: React.FC = () => {
  return (
    <main className="grid-container padding-y-4">
      <div className="bg-white padding-4 radius-lg border border-base-lighter shadow-1">
        <h1 className="font-heading-xl margin-top-0">Chat with Videos</h1>
        <p className="usa-intro text-base-dark">
          Ask questions about the content of the YouTube videos you've ingested.
        </p>
        <div className="margin-top-4">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
};

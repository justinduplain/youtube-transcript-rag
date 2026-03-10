import React, { useState, useEffect, useRef } from 'react';
import { Button, TextInput, FormGroup, Label } from '@trussworks/react-uswds';

interface Source {
  title: string;
  url: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface ChatApiResponse {
  answer?: string;
  sources?: Source[];
  detail?: unknown;
}

const sanitizeHistory = (history: Message[]) =>
  history
    .filter((m) => typeof m.content === 'string' && m.content.trim().length > 0)
    .map(({ role, content }) => ({ role, content }));

const extractErrorDetail = (detail: unknown): string => {
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (first && typeof first === 'object' && 'msg' in first && typeof first.msg === 'string') {
      return first.msg;
    }
  }
  return '';
};

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMsg: Message = { role: 'user', content: trimmedInput };
    const newHistory = [...messages, userMsg]; // Current history + new message
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      // Send message AND history to backend
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          history: sanitizeHistory(messages)
        }),
      });

      const data: ChatApiResponse = await response.json();
      if (!response.ok) {
        const detail = extractErrorDetail(data.detail);
        throw new Error(detail || `Request failed with status ${response.status}`);
      }
      if (typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('Assistant returned an empty response.');
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer,
        sources: Array.isArray(data.sources) ? data.sources : []
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="display-flex flex-column height-tablet-lg">
      <div className="flex-1 overflow-y-auto padding-2 bg-gray-5 border radius-md margin-bottom-2" style={{ maxHeight: '500px' }}>
        {messages.length === 0 && (
          <div>
            <p className="usa-intro text-base-dark">
              1) Embed: Enter a YouTube Video URL or Playlist URL to extract the transcripts and generate embeddings for the vector store.
            </p>
            <p className="usa-intro text-base-dark">
              2) Chat: Once they are processed, ask any questions about the videos in the video/playlist and get verified answers with time stamps. 
            </p>
            <p className="text-base-dark sm">
              **To use private playlists, you must be using chrome browser and be signed in to your google account.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`margin-bottom-2 display-flex ${m.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`padding-2 radius-lg maxw-tablet ${m.role === 'user' ? 'bg-primary-dark text-white' : 'bg-white border'}`}>
              <div className="font-sans-xs margin-bottom-1 text-bold">
                {m.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="line-height-sans-4">{m.content}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="margin-top-2 border-top padding-top-1 font-sans-3xs text-base-dark">
                  <div className="text-bold">Sources:</div>
                  <ul className="margin-0 padding-left-2">
                    {m.sources.map((s, si) => (
                      <li key={si}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-base-dark font-sans-xs">Assistant is thinking...</div>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend}>
        <FormGroup>
          <Label htmlFor="chat-input" className="usa-sr-only">Message</Label>
          <div className="display-flex">
            <TextInput
              id="chat-input"
              name="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Type your question..."
              className="flex-1 margin-right-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </FormGroup>
      </form>
    </div>
  );
};

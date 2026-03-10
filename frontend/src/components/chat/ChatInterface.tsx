import React, { useState, useRef, useEffect } from 'react';
import { Button, TextInput, FormGroup, Label } from '@trussworks/react-uswds';
import ReactMarkdown from 'react-markdown';

const CopyLinkButton: React.FC<{ href: string }> = ({ href }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(href).then(() => setCopied(true));
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = href;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          setCopied(true);
        }
      }}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
    >
      {copied ? '✅ URL copied' : 'Copy Playlist URL'}
    </button>
  );
};

const markdownComponents = {
  a({ href, children }) {
    const label = typeof children === 'string' ? children : '';
    if (label === 'Copy Playlist URL' && href) {
      return <CopyLinkButton href={href} />;
    }
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  },
};

interface Source {
  title: string;
  url: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isWelcome?: boolean;
}

interface ChatApiResponse {
  answer?: string;
  sources?: Source[];
  detail?: unknown;
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  isWelcome: true,
  content: `## Welcome to YouTube Transcript RAG!

### Getting Started

1. **Embed:** Paste a YouTube video or playlist URL in the sidebar to extract transcripts and build the vector store.
2. **Chat:** Once processing is complete, ask questions about the content and get cited answers with timestamps.

> **Private/unlisted playlists:** Only supported when running locally (\`http://localhost\`). Requires Chrome with your Google account signed in. Not available on the hosted version.
> **Limits:** Up to 5 videos per playlist, 10 videos total.

---

### Recommended Playlists to Try

**1. LlamaIndex — by Prompt Engineering**
[Copy Playlist URL](https://www.youtube.com/playlist?list=PLVEEucA9MYhNrD8TBI5UqM6WHPUlVv89w)
- What are vector stores?
- What are some good prompting techniques for LLMs?
- How do embeddings work in RAG?

**2. Pest Management** *(Ants, Yellow Jackets, Cockroaches)*
[Copy Playlist URL](https://www.youtube.com/watch?v=2XTSgRtcwh0&list=PLwHdnejyLuk6K_KLoAxgwcmmngB_Rouu8)
- What's the best way to get rid of Yellow Jackets?
- What's the best product to kill cockroaches?
- How do I stop ants in the kitchen?

**3. Heart Health**
[Copy Playlist URL](https://www.youtube.com/watch?v=jrcGb8BbjYQ&list=PLwHdnejyLuk6wGT_ryNMCpkSIGKISW0mM)
- What is the best exercise for heart health?
- What is some practical guidance to stay heart healthy?
- What does recent research say is the most effective way to maintain heart health?`,
};

const sanitizeHistory = (history: Message[]) =>
  history
    .filter((m) => !m.isWelcome && typeof m.content === 'string' && m.content.trim().length > 0)
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
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMsgRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const msgTop = lastMsgRef.current.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
      const scrollTarget = container.scrollTop + (msgTop - containerTop) - 15;
      container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMsg: Message = { role: 'user', content: trimmedInput };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat', {
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
    <div className="display-flex flex-column" style={{ height: '100%' }}>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto padding-2 bg-gray-5 border radius-md margin-bottom-2">
        {messages.map((m, i) => (
          <div key={i} ref={i === messages.length - 1 ? lastMsgRef : null} className={`margin-bottom-2 display-flex ${m.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`padding-2 radius-lg maxw-tablet ${m.role === 'user' ? 'bg-primary-dark text-white' : 'bg-white border'}`}>
              <div className="font-sans-xs margin-bottom-1 text-bold">
                {m.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="line-height-sans-4">
                {m.role === 'assistant'
                  ? <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>
                  : m.content}
              </div>
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

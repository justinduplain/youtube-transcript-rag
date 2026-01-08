import React, { useState } from 'react';
import { Button, TextInput, FormGroup, Label } from '@trussworks/react-uswds';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
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
          message: input,
          history: messages // Send previous messages as context
        }),
      });

      const data = await response.json();
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: data.answer,
        sources: data.sources
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="display-flex flex-column height-tablet-lg">
      <div className="flex-1 overflow-y-auto padding-2 bg-gray-5 border radius-md margin-bottom-2" style={{ maxHeight: '500px' }}>
        {messages.length === 0 && (
          <p className="text-center text-base-dark margin-top-4">
            Ask a question about the indexed YouTube videos.
          </p>
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
                    {m.sources.slice(0, 3).map((s, si) => (
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

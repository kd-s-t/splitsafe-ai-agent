import { Message } from '@/modules/agent/types';
import { useEffect, useRef } from 'react';
import AiModeHeader from './AiModeHeader';
import AiModeInput from './AiModeInput';
import AiModeLoading from './AiModeLoading';
import AiModeMessage from './AiModeMessage';

interface AiModeChatInterfaceProps {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  userName?: string;
  onInputChange: (value: string) => void;
  onSendMessage: (content: string) => void;
}

export default function AiModeChatInterface({
  messages,
  inputValue,
  isLoading,
  userName,
  onInputChange,
  onSendMessage,
}: AiModeChatInterfaceProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        onSendMessage(inputValue);
      }
    }
  };

  return (
    <div className="h-screen w-full bg-[#0D0D0D] flex flex-col">
      <AiModeHeader />

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-6 max-w-4xl mx-auto w-full"
      >
        {messages.map((message) => (
          <AiModeMessage key={message.id} message={message} userName={userName} />
        ))}
        {isLoading && <AiModeLoading />}
      </div>

      <AiModeInput
        value={inputValue}
        onChange={onInputChange}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        isLoading={isLoading}
      />
    </div>
  );
}


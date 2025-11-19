'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { scrollToBottomOnOpen, smoothScrollToBottom } from '@/lib/integrations/openai';
import { ChatInterfaceProps } from '@/modules/agent/types';
import { BotMessageSquare, Send, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export function AgentChatInterface({ messages, onSendMessage, onClearChat, isLoading }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      smoothScrollToBottom(messagesContainerRef);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when component mounts (chat opens)
  useEffect(() => {
    scrollToBottomOnOpen(messagesContainerRef);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {/* Clear History Button */}
        {messages.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Button
              onClick={onClearChat}
              variant="ghost"
              size="sm"
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border border-[#FEB64D] rounded-lg"
              title="Clear chat history"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role !== 'user' && (
              <div className="rounded-full bg-[#FEB64D] self-start p-1">
                <BotMessageSquare />
              </div>
            )}
            <div
              className={`rounded-lg p-3 overflow-hidden ${message.role === 'user'
                ? 'bg-[#FEB64D] text-black max-w-[70%]'
                : 'bg-[#2a2a2a] text-white w-full'
                }`}
            >
              <div className="whitespace-pre-wrap text-sm break-all overflow-hidden" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>{message.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] text-white rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 pb-4">
        <form onSubmit={handleSubmit} className="flex items-center border border-[#FEB64D] rounded-xl overflow-hidden">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk with SplitSafe AI"
            className='bg-transparent border-0 !focus:border-0 resize-none min-h-[40px] max-h-[120px]'
            disabled={isLoading}
            rows={1}
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={!inputValue.trim() || isLoading}
            className="disabled:opacity-50 px-3 border-0 !border-0 bg-transparent hover:bg-transparent"
          >
            <Send size={14} color="#FEB64D" />
          </Button>
        </form>
      </div>
    </div>
  );
}

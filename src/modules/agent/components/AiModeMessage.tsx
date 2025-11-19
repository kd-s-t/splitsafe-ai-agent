import { Message } from '@/modules/agent/types';
import { BotMessageSquare } from 'lucide-react';

interface AiModeMessageProps {
  message: Message;
  userName?: string;
}

export default function AiModeMessage({ message, userName }: AiModeMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="rounded-full bg-[#FEB64D] self-start p-2 flex-shrink-0">
          <BotMessageSquare size={20} className="text-black" />
        </div>
      )}
      <div
        className={`rounded-lg p-4 max-w-[80%] ${
          isUser
            ? 'bg-[#FEB64D] text-black'
            : 'bg-[#1A1A1A] text-white border border-[#303333]'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
          {message.content}
        </div>
      </div>
      {isUser && (
        <div className="rounded-full bg-[#2B2B2B] self-start p-2 flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <span className="text-[#FEB64D] text-sm font-semibold">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      )}
    </div>
  );
}


// Agent module types
// Import and re-export shared types for backward compatibility
import type { Message } from '../shared.types';
export type { Message };

export interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
}

export interface RightSidebarProps {
  onToggle: () => void;
}

export interface ChatMessageProps {
  message: import('../shared.types').ChatMessage;
  currentUser?: string;
  className?: string;
}

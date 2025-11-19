import { Message } from '@/modules/agent/types';

const STORAGE_KEY = 'splitsafe_chat_messages';

export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
}

export function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const messages = JSON.parse(stored) as Message[];
      // Convert timestamp strings back to Date objects
      return messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
  }
  return [];
}

export function clearMessages(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear messages from localStorage:', error);
  }
}

// Auto-scroll utility function
export function scrollToBottom(containerRef: React.RefObject<HTMLElement | null>): void {
  if (containerRef.current) {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }
}

// Smooth scroll to bottom utility function
export function smoothScrollToBottom(containerRef: React.RefObject<HTMLElement | null>): void {
  if (containerRef.current) {
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }
}

// Auto-scroll to bottom when chat opens
export function scrollToBottomOnOpen(containerRef: React.RefObject<HTMLElement | null>): void {
  // Use setTimeout to ensure the chat is fully rendered before scrolling
  setTimeout(() => {
    smoothScrollToBottom(containerRef);
  }, 100);
} 
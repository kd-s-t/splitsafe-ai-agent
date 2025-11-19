// Global chat state that persists across page navigation
let globalChatState = {
  isOpen: false,
  messages: [] as Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  }>
};

export function getGlobalChatState() {
  return globalChatState;
}

export function setGlobalChatState(newState: typeof globalChatState) {
  globalChatState = newState;
}

export function updateGlobalChatOpen(isOpen: boolean) {
  globalChatState.isOpen = isOpen;
}

export function addGlobalChatMessage(message: {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}) {
  globalChatState.messages.push(message);
}

export function clearGlobalChatMessages() {
  globalChatState.messages = [];
} 
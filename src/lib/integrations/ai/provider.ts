import { AIProvider } from './index';

const AI_PROVIDER_KEY = 'splitsafe-ai-provider';

export function getAIProvider(): AIProvider {
  if (typeof window === 'undefined') return 'openai';
  return (localStorage.getItem(AI_PROVIDER_KEY) as AIProvider) || 'openai';
}

export function setAIProvider(provider: AIProvider): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AI_PROVIDER_KEY, provider);
}
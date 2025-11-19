'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getAIProvider, setAIProvider, AIProvider } from '@/lib/integrations/ai/provider';
import { useState, useEffect } from 'react';

export function AIProviderToggle() {
  const [provider, setProviderState] = useState<AIProvider>('openai');

  useEffect(() => {
    setProviderState(getAIProvider());
  }, []);

  const handleToggle = (checked: boolean) => {
    const newProvider: AIProvider = checked ? 'amazonq' : 'openai';
    setAIProvider(newProvider);
    setProviderState(newProvider);
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="ai-provider" className="text-sm font-medium">
        AI Provider: {provider === 'openai' ? 'OpenAI' : 'Amazon Q'}
      </Label>
      <Switch
        id="ai-provider"
        checked={provider === 'amazonq'}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
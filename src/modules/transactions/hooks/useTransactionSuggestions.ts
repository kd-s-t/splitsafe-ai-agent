import { populateTransactionSuggestions } from '@/lib/integrations/openai';
import { useEffect, useState } from 'react';

export interface UseTransactionSuggestionsReturn {
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
}

export function useTransactionSuggestions(): UseTransactionSuggestionsReturn {
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Check for chat-triggered suggestions
    populateTransactionSuggestions();
    
    const shouldShow = sessionStorage.getItem('splitsafe_show_approval_suggestions');
    
    if (shouldShow) {
      setShowSuggestions(true);
      // Keep the flag for longer to ensure it's read
      setTimeout(() => {
        sessionStorage.removeItem('splitsafe_show_approval_suggestions');
        sessionStorage.removeItem('splitsafe_approval_timestamp');
      }, 3000);
    }

    const handleRefresh = () => {
      setShowSuggestions(true);
    };

    const handleForceShow = () => {
      setShowSuggestions(true);
    };

    window.addEventListener('refresh-approval-suggestions', handleRefresh);
    window.addEventListener('force-show-suggestions', handleForceShow);
    
    // Add interval check for the flag
    const interval = setInterval(() => {
      const flag = sessionStorage.getItem('splitsafe_show_approval_suggestions');
      if (flag && !showSuggestions) {
        setShowSuggestions(true);
        sessionStorage.removeItem('splitsafe_show_approval_suggestions');
        sessionStorage.removeItem('splitsafe_approval_timestamp');
      }
    }, 500);
    
    return () => {
      window.removeEventListener('refresh-approval-suggestions', handleRefresh);
      window.removeEventListener('force-show-suggestions', handleForceShow);
      clearInterval(interval);
    };
  }, [showSuggestions]);

  return {
    showSuggestions,
    setShowSuggestions,
  };
}

"use client"

import type { ApprovalSuggestionsProps } from "@/modules/shared.types";
import { useEffect } from 'react';

export function ApprovalSuggestions({ transactions }: ApprovalSuggestionsProps) {
  useEffect(() => {
    const generateSuggestions = () => {
      const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
      
      const newSuggestions = pendingTransactions.map(tx => {
        // Check if percentages are equally split
        const percentages = tx.to.map(r => Number(r.percentage));
        const isEquallySplit = percentages.every(p => p === percentages[0]);
        
        if (isEquallySplit) {
          return {
            transactionId: tx.id,
            suggestion: 'approve' as const,
            reason: 'Equal split detected - safe to approve'
          };
        } else {
          return {
            transactionId: tx.id,
            suggestion: 'review' as const,
            reason: 'Uneven split - review carefully'
          };
        }
      });
      
      return newSuggestions;
    };
    
    // Check if we should show suggestions (triggered by chat)
    const shouldShow = sessionStorage.getItem('splitsafe_show_approval_suggestions');
    
    if (shouldShow) {
      sessionStorage.removeItem('splitsafe_show_approval_suggestions');
      generateSuggestions();
      // You can handle the suggestions here as needed
    }
    
    // Listen for refresh events from chat
    const handleRefresh = () => {
      generateSuggestions();
      // You can handle the suggestions here as needed
    };
    
    window.addEventListener('refresh-approval-suggestions', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-approval-suggestions', handleRefresh);
    };
  }, [transactions]);

  // Don't render anything - we'll handle suggestions inline in the transaction rows
  return null;
}

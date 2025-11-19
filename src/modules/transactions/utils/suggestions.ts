import type { NormalizedTransaction } from '../../shared.types';

/**
 * Gets AI suggestion for a transaction based on user's share and transaction details
 */
export function getTransactionSuggestion(tx: NormalizedTransaction, principal: string | null): string | null {
  if (tx.status !== 'pending') {
    return null;
  }

  // Find the current user's share in this transaction
  const userShare = tx.to.find(r => String(r.principal) === String(principal));
  
  // If user is not a recipient, provide general suggestion
  if (!userShare) {
    const totalRecipients = tx.to.length;
    const totalAmount = tx.to.reduce((sum, r) => sum + Number(r.amount), 0) / 1e8;
    return `AI suggests: Review - ${totalRecipients} recipient${totalRecipients > 1 ? 's' : ''} for ${totalAmount.toFixed(8)} BTC`;
  }

  const userPercentage = Number(userShare.percentage);
  const totalRecipients = tx.to.length;

  // If user is getting a high percentage, suggest approve
  if (userPercentage >= 50) {
    return `AI suggests: Approve - You're getting ${userPercentage}% (great deal!)`;
  }
  
  // If user is getting a low percentage but it's a fair split among many people
  if (userPercentage >= (100 / totalRecipients) * 0.8) {
    return `AI suggests: Approve - Fair split among ${totalRecipients} recipients`;
  }
  
  // If user is getting a very low percentage, suggest review
  if (userPercentage < 20) {
    return `AI suggests: Review - You're only getting ${userPercentage}%`;
  }
  
  // Default case
  return `AI suggests: Review - You're getting ${userPercentage}%`;
}

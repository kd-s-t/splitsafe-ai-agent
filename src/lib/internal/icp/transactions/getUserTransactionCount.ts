import { Principal } from '@dfinity/principal';
import { getTransactionsPaginated } from './getTransactionsPaginated';

/**
 * Get user transaction count for feedback modal logic
 */
export async function getUserTransactionCount(principal: Principal): Promise<number> {
  try {
    const result = await getTransactionsPaginated(principal, 0, 1000); // Get up to 1000 transactions
    
    console.log({
      totalCount: result.totalCount,
      transactionCount: result.transactions.length
    });
    
    return result.totalCount;
  } catch {
    return 0;
  }
}


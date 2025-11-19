import { Principal } from '@dfinity/principal';
import { getTransactionsPaginated } from './getTransactionsPaginated';

/**
 * Get all transactions for a user (with default pagination)
 */
export async function getAllTransactions(principal: Principal): Promise<Record<string, unknown>[]> {
  try {
    const result = await getTransactionsPaginated(principal, 0, 100);
    return result.transactions;
  } catch {
    return [];
  }
}


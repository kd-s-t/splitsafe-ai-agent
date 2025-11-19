import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp';
import type { PaginatedTransactions } from '../types';
import { CanisterPaginatedResult, CanisterTransaction } from '../types';
import { serializeBigInts } from './serializeBigInts';

/**
 * Get paginated transactions for a user
 */
export async function getTransactionsPaginated(
  principal: Principal,
  page: number = 0,
  pageSize: number = 100
): Promise<PaginatedTransactions> {
  try {
    const actor = await createAnonymousActorNew();
    
    let result: CanisterPaginatedResult;
    try {
      result = await actor.getTransactionsPaginated(principal, page, pageSize) as CanisterPaginatedResult;
    } catch {
      return {
        transactions: [],
        totalCount: 0,
        totalPages: 0
      };
    }
    
    if (!result || typeof result !== 'object') {
      return {
        transactions: [],
        totalCount: 0,
        totalPages: 0
      };
    }
    
    
    const validTransactions = (result.transactions || []).filter((transaction: CanisterTransaction) => {
      return transaction && 
             typeof transaction.id === 'string' && 
             transaction.status !== undefined &&
             typeof transaction.title === 'string';
    });
    
    
    const serializedTransactions = validTransactions.map((transaction: CanisterTransaction) => {
      try {
        return serializeBigInts(transaction);
      } catch {
        return {
          id: transaction.id || 'unknown',
          status: transaction.status || 'unknown',
          title: transaction.title || 'Unknown Transaction',
          from: (transaction as unknown as { from?: string }).from || 'unknown',
          amount: '0',
          createdAt: (transaction as unknown as { createdAt?: string }).createdAt || '0',
          to: []
        };
      }
    });
    
    
    return { 
      transactions: serializedTransactions as Record<string, unknown>[],
      totalCount: Number(result.totalCount),
      totalPages: Number(result.totalPages)
    };
  } catch {
    
    return {
      transactions: [],
      totalCount: 0,
      totalPages: 0
    };
  }
}


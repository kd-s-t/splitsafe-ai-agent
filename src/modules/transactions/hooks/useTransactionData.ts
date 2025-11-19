import { getTransactionsPaginated } from '@/lib/internal/icp';
import { clearTransactions, setTransactions } from '@/lib/redux';
import { Principal } from '@dfinity/principal';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { NormalizedTransaction } from '../../shared.types';
import { convertToNormalizedTransactions } from '../utils';

export interface UseTransactionDataReturn {
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
  fetchTransactions: () => Promise<void>;
}

export function useTransactionData(
  principal: Principal | null,
  existingTransactions: NormalizedTransaction[]
): UseTransactionDataReturn {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!principal) return;

    setRefreshing(true);
    setError(null);
    setIsLoading(true);

    try {
      // Clear existing transactions first to remove any non-serializable data
      dispatch(clearTransactions());

      const result = await getTransactionsPaginated(principal, 0, 100);
      const normalizedTxs = convertToNormalizedTransactions(result.transactions);
      dispatch(setTransactions(normalizedTxs));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setError(`Failed to load transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      toast.error('Error', { description: "Failed to refresh transactions" });
    } finally {
      setRefreshing(false);
    }
  }, [principal, dispatch]);

  useEffect(() => {
    // Initial fetch of transactions only if we don't have any
    if (principal && existingTransactions.length === 0) {
      fetchTransactions();
    } else if (existingTransactions.length > 0) {
      // If we already have transactions, stop loading
      setIsLoading(false);
    }
  }, [principal, existingTransactions.length, fetchTransactions]);

  return {
    isLoading,
    error,
    refreshing,
    fetchTransactions,
  };
}

import { Principal } from '@dfinity/principal';
import { useMemo, useState } from 'react';
import type { NormalizedTransaction } from '../../shared.types';
import { getTransactionCategory } from '../utils/helpers';

export interface TransactionFilters {
  searchTerm: string;
  statusFilter: string;
  transactionsFilter: string;
}

export interface UseTransactionFiltersReturn {
  filters: TransactionFilters;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setTransactionsFilter: (filter: string) => void;
  clearFilters: () => void;
  filteredTransactions: NormalizedTransaction[];
  availableCategories: string[];
  availableStatuses: string[];
}

export function useTransactionFilters(
  transactions: NormalizedTransaction[],
  principal: Principal | null
): UseTransactionFiltersReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactionsFilter, setTransactionsFilter] = useState('all');

  const availableCategories = useMemo(() => 
    Array.from(new Set(transactions.map(tx => getTransactionCategory(tx, principal)))), 
    [transactions, principal]
  );

  const availableStatuses = useMemo(() => 
    Array.from(new Set(transactions.map(tx => tx.status))), 
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchesTransaction = transactionsFilter === 'all' || getTransactionCategory(tx, principal) === transactionsFilter;

      return matchesSearch && matchesStatus && matchesTransaction;
    });
  }, [transactions, searchTerm, statusFilter, transactionsFilter, principal]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTransactionsFilter('all');
  };

  return {
    filters: {
      searchTerm,
      statusFilter,
      transactionsFilter,
    },
    setSearchTerm,
    setStatusFilter,
    setTransactionsFilter,
    clearFilters,
    filteredTransactions,
    availableCategories,
    availableStatuses,
  };
}

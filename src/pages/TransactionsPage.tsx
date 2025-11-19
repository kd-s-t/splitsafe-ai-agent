import { useAuth } from "@/contexts/auth-context";
import { markTransactionAsRead, setSubtitle, setTitle } from "@/lib/redux";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { ApprovalSuggestions, TransactionCount, TransactionFilters, TransactionList } from "@/modules/transactions/components";
import { useTransactions } from "@/modules/transactions/hooks";
import { useTransactionData } from "@/modules/transactions/hooks/useTransactionData";
import { useTransactionFilters } from "@/modules/transactions/hooks/useTransactionFilters";
import { useTransactionSuggestions } from "@/modules/transactions/hooks/useTransactionSuggestions";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function TransactionsPage() {
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  
  const [localTransactions, setLocalTransactions] = useState<NormalizedTransaction[]>([]);

  const { isLoading, error, refreshing, fetchTransactions } = useTransactionData(principal, transactions);
  const { showSuggestions } = useTransactionSuggestions();
  const {
    filters,
    setSearchTerm,
    setStatusFilter,
    setTransactionsFilter,
    clearFilters,
    filteredTransactions,
    availableCategories,
    availableStatuses,
  } = useTransactionFilters(localTransactions, principal);

  useEffect(() => {
    dispatch(setTitle('Transaction history'));
    dispatch(setSubtitle('View all your escrow transactions'));
  }, [dispatch]);

  useEffect(() => {
    const sorted = [...transactions].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    setLocalTransactions(sorted);
  }, [transactions]);

  const handleRowClick = (tx: NormalizedTransaction | { type: string; id: string }) => {
    if (!principal) return;
    
    if ('type' in tx && tx.type === 'payment_gateway') {
      navigate(`/direct-transfers/${tx.id}`);
    } else if ('status' in tx) {
      dispatch(markTransactionAsRead(tx as NormalizedTransaction));
      navigate(`/transactions/${tx.id}`);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <ApprovalSuggestions transactions={localTransactions} />
      <div className="space-y-3">
        <TransactionFilters
          searchTerm={filters.searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={setStatusFilter}
          transactionsFilter={filters.transactionsFilter}
          onTransactionsFilterChange={setTransactionsFilter}
          availableCategories={availableCategories}
          availableStatuses={availableStatuses}
          onRefresh={fetchTransactions}
          refreshing={refreshing}
        />
        <TransactionCount
          filteredCount={filteredTransactions.length}
          totalCount={localTransactions.length}
        />
      </div>
      <TransactionList
        transactions={localTransactions}
        filteredTransactions={filteredTransactions}
        isLoading={isLoading}
        error={error}
        principal={principal}
        showSuggestions={showSuggestions}
        onRowClick={handleRowClick}
        onRetry={fetchTransactions}
        onClearFilters={clearFilters}
      />
    </div>
  );
}


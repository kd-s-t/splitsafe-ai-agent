"use client";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty-state";
import { TransactionsLoadingSkeleton } from "@/components/ui/transactions-loading-skeleton";
import type { NormalizedTransaction, UnifiedTransaction } from "@/modules/shared.types";
import { Principal } from "@dfinity/principal";
import { FileText, Plus } from "lucide-react";
// Image component removed - use <img> tags instead
import { setIsChooseEscrowTypeDialogOpen } from "@/lib/redux/store/dialogSlice";
import { useDispatch } from "react-redux";
import { TransactionCard } from "./TransactionCard";

export interface TransactionListProps {
  transactions: NormalizedTransaction[];
  filteredTransactions: NormalizedTransaction[];
  unifiedTransactions?: UnifiedTransaction[];
  isLoading: boolean;
  error: string | null;
  principal: Principal | null;
  showSuggestions: boolean;
  onRowClick: (tx: NormalizedTransaction | UnifiedTransaction) => void;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function TransactionList({
  transactions,
  filteredTransactions,
  unifiedTransactions,
  isLoading,
  error,
  principal,
  showSuggestions,
  onRowClick,
  onRetry,
  onClearFilters,
}: TransactionListProps) {
  const dispatch = useDispatch();

  // Loading State
  if (isLoading) {
    return <TransactionsLoadingSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty State - No transactions at all
  if (transactions.length === 0) {
    return (
      <Empty className='!bg-[#191A1A] !border border-[#424747] !rounded-[10px]'>
        <EmptyHeader className='!max-w-full !text-white'>
          <EmptyMedia variant="icon" className='w-[94px]'>
            <img src="/task-empty.svg" alt="Empty state" width={94} height={94} />
          </EmptyMedia>
          <EmptyTitle className="!font-semibold mt-8">No transactions yet? Let’s fix that.</EmptyTitle>
          <EmptyDescription>
            Your transaction history will show up here after you create or receive an escrow. Get started by creating your first one.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="default" size="lg" onClick={() => dispatch(setIsChooseEscrowTypeDialogOpen(true))}>
            <Plus /> Start a new escrow
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Empty State - No matching transactions after filtering
  if (filteredTransactions.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="w-10 h-10 text-gray-400" />
          </EmptyMedia>
          <EmptyTitle className="!text-2xl !font-semibold">No matching transactions</EmptyTitle>
          <EmptyDescription className="text-gray-600 !text-base">
            No transactions match your current filters. Try adjusting your search or filter criteria.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="default" size="lg" onClick={onClearFilters}>
            Clear filters
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Use unified transactions if available, otherwise fall back to filtered transactions
  const transactionsToRender = unifiedTransactions || filteredTransactions;

  // Transactions List
  return (
    <div className="space-y-6">
      {transactionsToRender.map((tx, index) => (
        <TransactionCard
          key={`${tx.id}-${index}`}
          transaction={tx}
          principal={principal}
          showSuggestions={showSuggestions}
          index={index}
          onRowClick={onRowClick}
        />
      ))}
    </div>
  );
}

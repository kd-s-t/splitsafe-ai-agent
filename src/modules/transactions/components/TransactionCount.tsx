"use client";

export interface TransactionCountProps {
  filteredCount: number;
  totalCount: number;
}

export function TransactionCount({ filteredCount, totalCount }: TransactionCountProps) {
  return (
    <p className="text-[#BCBCBC] text-sm">
      Showing {filteredCount} of {totalCount} transactions
    </p>
  );
}

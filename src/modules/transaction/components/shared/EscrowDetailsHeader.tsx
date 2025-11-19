"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { isMilestoneTransaction } from "@/modules/shared.types";
import TimeRemaining from "./TimeRemaining";

export interface EscrowDetailsHeaderProps {
  escrow: NormalizedTransaction;
  isLoading: boolean | string | null;
  onBackClick: () => void;
}

export function EscrowDetailsHeader({ 
  escrow, 
  isLoading, 
  onBackClick 
}: EscrowDetailsHeaderProps) {
  
  const statusKey = escrow.status || "unknown";
  // Show time remaining for pending and confirmed transactions, but NOT for milestone transactions
  const showTimeRemaining = (statusKey === "pending" || statusKey === "confirmed") && !isMilestoneTransaction(escrow);

  return (
    <div className="flex flex-col gap-4">
      {/* Top row with back button and time remaining */}
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onBackClick}
          className="self-start hover:-translate-x-1 transition-all duration-200 group"
          disabled={!!isLoading}
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform duration-200" /> 
          Back to dashboard
        </Button>
        {showTimeRemaining && (
          <TimeRemaining createdAt={escrow.createdAt} status={statusKey} />
        )}
      </div>
      
    </div>
  );
}

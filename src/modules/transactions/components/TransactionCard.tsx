"use client";

import MilestoneStatusBadge from "@/components/MilestoneStatusBadge";
import TransactionStatusBadge from "@/components/TransactionStatusBadge";
import { Button } from "@/components/ui/button";
import type { NormalizedTransaction, UnifiedTransaction } from "@/modules/shared.types";
import { isMilestoneTransaction, isPaymentGatewayTransaction } from "@/modules/shared.types";
import { Principal } from "@dfinity/principal";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Bitcoin, Calendar, Eye, Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  formatTransactionDate,
  getTransactionCategory,
  getTransactionTotalAmount,
  getUserShareAmount,
  getUserSharePercentage,
  hasUserApproved,
  hasUserDeclined,
  isSentByUser
} from "../utils/helpers";
import { getTransactionSuggestion } from "../utils/suggestions";

export interface TransactionCardProps {
  transaction: NormalizedTransaction | UnifiedTransaction;
  principal: Principal | null;
  showSuggestions: boolean;
  index: number;
  onRowClick: (tx: NormalizedTransaction | UnifiedTransaction) => void;
}

export function TransactionCard({
  transaction: tx,
  principal,
  showSuggestions,
  index,
  onRowClick,
}: TransactionCardProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if this is a payment gateway transaction
  const isPaymentGateway = 'type' in tx && isPaymentGatewayTransaction(tx);
  
  // For payment gateway transactions, use simplified logic
  const isSent = isPaymentGateway ? tx.from === principal?.toString() : isSentByUser(tx as NormalizedTransaction, principal);
  const category = isPaymentGateway ? (isSent ? "sent" : "receiving") : getTransactionCategory(tx as NormalizedTransaction, principal);
  const userApproved = isPaymentGateway ? false : hasUserApproved(tx as NormalizedTransaction, principal);
  const userDeclined = isPaymentGateway ? false : hasUserDeclined(tx as NormalizedTransaction, principal);
  
  const isRowClickable = isPaymentGateway ? true : (!isSent || (tx.status !== "completed" && tx.status !== "pending"));

  const handleCardClick = () => {
    if (isRowClickable) {
      onRowClick(tx);
    }
  };

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Use window.location for SPA mode to avoid RSC fetch errors
      const targetPath = isPaymentGateway 
        ? `/direct-transfers/${tx.id}`
        : `/transactions/${tx.id}`;
      
      // Use React Router for navigation
      navigate(targetPath);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to window.location if router fails
      const targetPath = isPaymentGateway 
        ? `/direct-transfers/${tx.id}`
        : `/transactions/${tx.id}`;
      window.location.href = targetPath;
    } finally {
      // Reset loading state after navigation completes
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const suggestion = isPaymentGateway ? null : getTransactionSuggestion(tx as NormalizedTransaction, principal?.toString() || null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`bg-[#222222] rounded-[20px] p-4 md:p-5 border-0 w-full ${
        isRowClickable ? 'hover:bg-[#2a2a2a] transition-colors cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold text-white truncate">{tx.title}</h3>
            {isPaymentGateway ? (
              <TransactionStatusBadge status={tx.status} />
            ) : isMilestoneTransaction(tx as NormalizedTransaction) ? (
              <MilestoneStatusBadge status={tx.status} transaction={tx as NormalizedTransaction} />
            ) : (
              <TransactionStatusBadge status={tx.status} />
            )}
            {isPaymentGateway ? (
              <div className="flex items-center space-x-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                <Bitcoin size={12} />
                <span>Direct Transfer</span>
              </div>
            ) : isMilestoneTransaction(tx as NormalizedTransaction) && (
              <div className="flex items-center space-x-1 bg-[#FEB64D]/10 text-[#FEB64D] px-2 py-1 rounded-full text-xs font-medium">
                <Calendar size={12} />
                <span>Milestone</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-[#BCBCBC]">
            <span>{formatTransactionDate(tx.createdAt)}</span>
            {category === "sent" ? (
              <div className="flex items-center space-x-1 text-[#007AFF]">
                <ArrowUpRight size={14} />
                <span>Sent</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-[#00C287]">
                <ArrowDownLeft size={14} />
                <span>Receiving</span>
              </div>
            )}
            {((tx.status === 'pending' || tx.status === 'confirmed') &&
              !isSent && userApproved) && (
                <span>• You approved</span>
              )}
            {((tx.status === 'pending' || tx.status === 'confirmed' || tx.status === 'declined') &&
              !isSent && userDeclined) && (
                <span>• You declined</span>
              )}
          </div>
        </div>

        <div className="flex-shrink-0 ml-4">
          {isPaymentGateway ? (
            <Button
              variant="outline"
              size="sm"
              className="border-[#7A7A7A] text-white whitespace-nowrap hover:bg-[#2A2A2A] transition-colors"
              onClick={handleButtonClick}
            >
              <Eye className="w-4 h-4 mr-2" />
              View transfer
            </Button>
          ) : category === "sent" ? (
            <Button
              variant="outline"
              size="sm"
              className="border-[#7A7A7A] text-white whitespace-nowrap hover:bg-[#2A2A2A] transition-colors"
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Manage escrow
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-[#7A7A7A] text-white whitespace-nowrap hover:bg-[#2A2A2A] transition-colors"
              onClick={handleButtonClick}
            >
              <Eye className="w-4 h-4 mr-2" />
              View escrow
            </Button>
          )}
        </div>
      </div>

      {/* Transaction Details Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 rounded-[10px] md:grid-cols-2">
        <div>
          <p className="text-[#BCBCBC] text-sm mb-1">Amount</p>
          <div className="flex items-center space-x-2">
            <Bitcoin size={20} className="text-[#F97415]" />
            <span className="font-semibold text-white">
              {isPaymentGateway ? (
                `${(parseFloat(tx.amount) / 100_000_000).toFixed(8)} BTC`
              ) : isSent ? (
                `${getTransactionTotalAmount(tx as NormalizedTransaction).toFixed(8)} BTC`
              ) : (
                `${getUserShareAmount(tx as NormalizedTransaction, principal).toFixed(8)} BTC`
              )}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[#BCBCBC] text-sm mb-1">
            {isPaymentGateway ? (
              isSent ? "To" : "From"
            ) : isSent ? "To" : "Your Share"}
          </p>
          <p className="font-semibold text-white">
            {isPaymentGateway ? (
              isSent ? (
                tx.merchantId || "Merchant"
              ) : (
                "Payment Gateway"
              )
            ) : isSent ? (
              `${(tx as NormalizedTransaction).to.length} recipient${(tx as NormalizedTransaction).to.length !== 1 ? "s" : ""}`
            ) : (
              getUserSharePercentage(tx as NormalizedTransaction, principal)
            )}
          </p>
        </div>

      </div>

      {/* AI Suggestion */}
      {showSuggestions && suggestion && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <div className="mr-2">
              {suggestion}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

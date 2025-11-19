'use client'

import { NormalizedTransaction } from "@/modules/shared.types";
import { Principal } from '@dfinity/principal';
import { AnimatePresence } from 'framer-motion';
import { getCurrentStep, hasUserActioned, isCurrentUserSender } from "../../utils/transactionDetailsHelpers";
import { EscrowCompletedBanner } from '../shared/EscrowCompletedBanner';
import { BasicLifecycle } from './BasicLifecycle';
import { BasicOverview } from './BasicOverview';
import BasicTimeRemaining from './BasicTimeRemaining';

export interface BasicDetailsLayoutProps {
  escrow: NormalizedTransaction;
  principal: Principal | null;
  isLoading: boolean | string | null;
  onBackClick: () => void;
  onRelease: () => Promise<void>;
  onRefund: () => Promise<void>;
  onApprove: () => Promise<void>;
  onDecline: () => Promise<void>;
  onCancel: () => Promise<void>;
  onEdit: () => void;
}

export function BasicDetailsLayout({
  escrow,
  principal,
  isLoading,
  onBackClick,
  onRelease,
  onRefund,
  onApprove,
  onDecline,
  onCancel,
  onEdit,
}: BasicDetailsLayoutProps) {
  const statusKey = escrow.status || "unknown";
  const currentStep = getCurrentStep(statusKey);
  
  // Determine if current user is sender or recipient
  const isSender = isCurrentUserSender(escrow, principal);
  const hasActioned = hasUserActioned(escrow, principal);

  return (
    <div className="flex flex-col gap-6">
      {/* Header with back button and time remaining */}
      <div className="flex flex-col gap-4">
        {/* Top row with back button and time remaining */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onBackClick}
            className="self-start hover:-translate-x-1 transition-all duration-200 group text-white hover:text-[#FEB64D]"
            disabled={!!isLoading}
          >
            <span className="flex items-center space-x-2">
              <span>←</span>
              <span>Back to dashboard</span>
            </span>
          </button>
          {(statusKey === "pending" || statusKey === "confirmed") && (
            <BasicTimeRemaining 
              createdAt={escrow.createdAt} 
              status={statusKey}
            />
          )}
        </div>
      </div>

      {/* Completed banner */}
      <AnimatePresence>
        <EscrowCompletedBanner escrow={escrow} />
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 md:flex-[2]">
          {/* Basic Overview */}
          <BasicOverview 
            transaction={escrow}
            currentUserPrincipal={principal?.toString()}
          />

          {/* Action buttons based on status and user role */}
          {statusKey === "pending" && (
            <div className="mt-6 space-y-4">
              {isSender ? (
                // Sender actions: Cancel and Edit
                <div className="flex flex-col sm:flex-row gap-3">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      disabled={!!isLoading || isLoading === "edit"}
                      className="flex-1 bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {isLoading === "edit" ? "Editing..." : "Edit Escrow"}
                    </button>
                  )}
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      disabled={!!isLoading || isLoading === "cancel"}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {isLoading === "cancel" ? "Cancelling..." : "Cancel Escrow"}
                    </button>
                  )}
                </div>
              ) : (
                // Recipient actions: Approve and Decline
                <div className="flex flex-col sm:flex-row gap-3">
                  {onApprove && !hasActioned && (
                    <button
                      onClick={onApprove}
                      disabled={!!isLoading || isLoading === "approve"}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {isLoading === "approve" ? "Approving..." : "Approve Escrow"}
                    </button>
                  )}
                  {onDecline && !hasActioned && (
                    <button
                      onClick={onDecline}
                      disabled={!!isLoading || isLoading === "decline"}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {isLoading === "decline" ? "Declining..." : "Decline"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {statusKey === "confirmed" && (
            <div className="mt-6 space-y-4">
              {isSender ? (
                // Sender actions: Release and Refund
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onRelease}
                    disabled={!!isLoading || isLoading === "release"}
                    className="flex-1 bg-[#FEB64D] hover:bg-[#EBAF2D] text-black px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLoading === "release" ? "Releasing..." : "Release Escrow"}
                  </button>
                  <button
                    onClick={onRefund}
                    disabled={!!isLoading || isLoading === "refund"}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLoading === "refund" ? "Refunding..." : "Refund"}
                  </button>
                </div>
              ) : (
                // Recipient waiting message
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    Waiting for sender to release or refund the escrow.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar with basic lifecycle */}
        <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6 w-full md:flex-1 md:max-w-[400px]">
          <BasicLifecycle currentStep={currentStep} status={statusKey} />
        </div>
      </div>
    </div>
  );
}

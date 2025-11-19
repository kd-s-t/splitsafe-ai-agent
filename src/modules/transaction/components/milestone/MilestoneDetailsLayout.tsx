'use client'

import { NormalizedTransaction } from "@/modules/shared.types";
import { Principal } from '@dfinity/principal';
import { AnimatePresence } from 'framer-motion';
import { getCurrentStep } from "../../utils/transactionDetailsHelpers";
import { EscrowCompletedBanner } from '../shared/EscrowCompletedBanner';
import { MilestoneLifecycle } from './MilestoneLifecycle';
import { MilestoneOverview } from './MilestoneOverview';

export interface MilestoneDetailsLayoutProps {
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

export function MilestoneDetailsLayout({
  escrow,
  principal,
  isLoading,
  onBackClick,
  onRelease,
  onRefund,
  onApprove,
  onDecline,
}: MilestoneDetailsLayoutProps) {
  const statusKey = escrow.status || "unknown";
  
  // Debug: Log the escrow data before calling getCurrentStep
  console.log("🔍 [DEBUG] MilestoneDetailsLayout - escrow data:", {
    id: escrow.id,
    status: escrow.status,
    hasMilestoneData: !!escrow.milestoneData,
    milestoneDataKeys: escrow.milestoneData ? Object.keys(escrow.milestoneData) : 'no milestoneData',
    milestoneDataRecipients: escrow.milestoneData?.recipients,
    milestoneDataMilestones: escrow.milestoneData?.milestones,
    fullEscrow: escrow
  });
  
  const currentStep = getCurrentStep(statusKey, escrow);

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
        </div>
      </div>

      {/* Completed banner */}
      <AnimatePresence>
        <EscrowCompletedBanner escrow={escrow} />
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 md:flex-[2]">
          {/* Milestone Overview */}
          <MilestoneOverview 
            transaction={escrow}
            currentUserPrincipal={principal ? String(principal) : undefined}
          />

          {/* Action buttons based on status */}
          {statusKey === "pending" && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onApprove}
                  disabled={!!isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Approve Milestone
                </button>
                <button
                  onClick={onDecline}
                  disabled={!!isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {statusKey === "confirmed" && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onRelease}
                  disabled={!!isLoading}
                  className="flex-1 bg-[#FEB64D] hover:bg-[#EBAF2D] text-black px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Release Milestone
                </button>
                <button
                  onClick={onRefund}
                  disabled={!!isLoading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Refund
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with milestone lifecycle */}
        <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6 w-full md:flex-1 md:max-w-[400px]">
          <MilestoneLifecycle currentStep={currentStep} status={statusKey} />
        </div>
      </div>
    </div>
  );
}

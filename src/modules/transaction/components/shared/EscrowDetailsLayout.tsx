"use client";

import { getTransaction, serializeBigInts } from "@/lib/internal/icp/transactions";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { isMilestoneTransaction } from "@/modules/shared.types";
import { Principal } from "@dfinity/principal";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect } from "react";
import { convertToNormalizedTransactions } from "../../../transactions/utils";
import { getCurrentStep } from "../../utils/transactionDetailsHelpers";
import { BasicLifecycle } from "../basic/BasicLifecycle";
import { MilestoneLifecycle } from "../milestone/MilestoneLifecycle";
import { ConstellationHashes } from "./ConstellationHashes";
import { EscrowChatSection } from "./EscrowChatSection";
import { EscrowCompletedBanner } from "./EscrowCompletedBanner";
import { EscrowDetailsContent } from "./EscrowDetailsContent";
import { EscrowDetailsHeader } from "./EscrowDetailsHeader";
import { StoryLinks } from "./StoryLinks";

export interface EscrowDetailsLayoutProps {
  escrow: NormalizedTransaction;
  principal: Principal | null;
  isLoading: boolean | string | null;
  initiatorNickname: string;
  onBackClick: () => void;
  onRelease: (id: unknown) => Promise<void>;
  onRefund: () => Promise<void>;
  onApprove: () => Promise<void>;
  onDecline: () => Promise<void>;
  onCancel: () => Promise<void>;
  onEdit: () => void;
  onEscrowUpdate?: (updatedEscrow: NormalizedTransaction) => void;
}

export function EscrowDetailsLayout({
  escrow,
  principal,
  isLoading,
  initiatorNickname,
  onBackClick,
  onRelease,
  onRefund,
  onApprove,
  onDecline,
  onCancel,
  onEdit,
  onEscrowUpdate,
}: EscrowDetailsLayoutProps) {
  const statusKey = escrow.status || "unknown";
  
  
  const currentStep = getCurrentStep(statusKey, escrow);

  // Function to instantly replace transaction data (no refresh, no loading states)
  const refreshTransactionData = useCallback(async () => {
    if (!principal || !escrow.id) return;
    
    try {
      console.log('🔄 [MILESTONE_EVENT] Instantly replacing transaction data for:', escrow.id);
      
      // Fetch new data in background without showing loading states
      const result = await getTransaction(principal, escrow.id);
      if (!result) {
        console.warn('🔄 [MILESTONE_EVENT] No transaction data received');
        return;
      }

      // Handle the case where to might be in basicData
      let recipients = result.to || [];
      if (result.basicData && Array.isArray(result.basicData) && result.basicData.length > 0) {
        const basicData = result.basicData[0] as Record<string, unknown>;
        if (basicData.to && Array.isArray(basicData.to)) {
          recipients = basicData.to;
        }
      }

      const escrowTransaction = {
        id: result.id,
        from: typeof result.from === 'string' ? result.from : String(result.from),
        to: recipients.map((entry: unknown) => {
          if (typeof entry === 'object' && entry !== null) {
            const recipient = entry as Record<string, unknown>;
            return {
              principal: typeof recipient.principal === 'string' ? recipient.principal : String(recipient.principal),
              percentage: typeof recipient.percentage === 'bigint' ? Number(recipient.percentage) : recipient.percentage,
              name: recipient.name || 'Unknown',
              readAt: recipient.readAt ? String(recipient.readAt) : undefined,
            };
          }
          return entry;
        }),
        amount: typeof result.amount === 'bigint' ? result.amount : 
                typeof result.funds_allocated === 'bigint' ? result.funds_allocated : 
                BigInt(result.amount || result.funds_allocated || 0),
        readAt: result.readAt ? String(result.readAt) : undefined,
        status: result.status as 'pending' | 'confirmed' | 'released' | 'cancelled' | 'refund' | 'declined',
        title: result.title,
        kind: result.kind,
        createdAt: String(result.createdAt),
        releasedAt: result.releasedAt ? String(result.releasedAt) : undefined,
        chatId: result.chatId ? String(result.chatId) : undefined,
        constellationHashes: Array.isArray(result.constellationHashes)
          ? result.constellationHashes.map((h: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              action: String(h.action),
              hash: String(h.hash),
              timestamp: String(h.timestamp),
            }))
          : undefined,
        storyIpAssetId: Array.isArray(result.storyIpAssetId) && result.storyIpAssetId.length > 0
          ? [String(result.storyIpAssetId[0])]
          : undefined,
        storyTxs: Array.isArray(result.storyTxs)
          ? result.storyTxs.map((t: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              action: String(t.action),
              txHash: String(t.txHash),
              timestamp: String(t.timestamp),
            }))
          : undefined,
        milestoneData: result.milestoneData as unknown
      };

      const normalizedTxs = convertToNormalizedTransactions([escrowTransaction]);
      const updatedEscrow = normalizedTxs[0];
      
      // Serialize for Redux compatibility
      const serializedEscrow = serializeBigInts(updatedEscrow) as NormalizedTransaction;
      
      console.log('✅ [MILESTONE_EVENT] Transaction data instantly replaced - no refresh needed');
      
      // Instantly replace the escrow data via the callback (no loading states)
      if (onEscrowUpdate) {
        onEscrowUpdate(serializedEscrow);
      }
      
    } catch (error) {
      console.error('❌ [MILESTONE_EVENT] Failed to replace transaction data:', error);
    }
  }, [principal, escrow.id, onEscrowUpdate]);

  // Also listen for direct escrow updates (when onEscrowUpdate is called directly)
  useEffect(() => {
    if (onEscrowUpdate) {
    }
  }, [onEscrowUpdate]);

  // Listen to milestone events for this specific transaction
  useEffect(() => {
    if (!isMilestoneTransaction(escrow)) return;

    const handleMilestoneEvent = (event: CustomEvent) => {
      const eventData = event.detail;
      console.log('🎯 [MILESTONE_EVENT] Received milestone event:', eventData);
      console.log('🎯 [MILESTONE_EVENT] Current escrow ID:', escrow.id);
      console.log('🎯 [MILESTONE_EVENT] Event transaction ID:', eventData.transactionId);
      console.log('🎯 [MILESTONE_EVENT] Event milestone ID:', eventData.milestoneId);
      
      // Check if this event is for our transaction
      if (eventData.transactionId === escrow.id || eventData.milestoneId === escrow.id) {
        console.log('🎯 [MILESTONE_EVENT] Event matches our transaction, instantly replacing data...');
        // Instantly replace data without any loading states or refresh
        refreshTransactionData();
      } else {
        console.log('🎯 [MILESTONE_EVENT] Event does not match our transaction, ignoring...');
      }
    };

    // Add event listener for milestone events
    window.addEventListener('milestone-event', handleMilestoneEvent as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('milestone-event', handleMilestoneEvent as EventListener);
    };
  }, [escrow, refreshTransactionData]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header with back button and time remaining */}
      <EscrowDetailsHeader
        escrow={escrow}
        isLoading={isLoading}
        onBackClick={onBackClick}
      />


      {/* Completed banner */}
      <AnimatePresence>
        <EscrowCompletedBanner escrow={escrow} />
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 md:flex-[2]">
          {/* principal should always be available here due to guard in TransactionDetailsView */}
          <EscrowDetailsContent
            escrow={escrow}
            principal={principal}
            isLoading={isLoading}
            onRelease={onRelease}
            onRefund={onRefund}
            onApprove={onApprove}
            onDecline={onDecline}
            onCancel={onCancel}
            onEdit={onEdit}
            onEscrowUpdate={onEscrowUpdate}
          />
          <ConstellationHashes escrow={escrow} />
          <StoryLinks escrow={escrow} />
          {!isMilestoneTransaction(escrow) && (
            <div className="mt-6">
              <EscrowChatSection
                escrow={escrow}
                principal={principal}
                initiatorNickname={initiatorNickname}
              />
            </div>
          )}
        </div>

        {/* Sidebar with lifecycle - hide for payment gateway transactions */}
        {!escrow.title?.includes('Payment Gateway') && (
          <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6 w-full md:flex-1 md:max-w-[400px]">
            {isMilestoneTransaction(escrow) ? (
              <MilestoneLifecycle currentStep={currentStep} status={statusKey} />
            ) : (
              <BasicLifecycle currentStep={currentStep} status={statusKey} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

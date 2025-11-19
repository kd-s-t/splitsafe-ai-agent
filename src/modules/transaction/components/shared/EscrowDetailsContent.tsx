"use client";

import type { NormalizedTransaction } from "@/modules/shared.types";
import { isMilestoneTransaction } from "@/modules/shared.types";
import { Principal } from "@dfinity/principal";
import { hasUserActioned, isCurrentUserSender } from "../../utils/transactionDetailsHelpers";
import { MilestoneDetailsContent } from "../milestone/MilestoneDetailsContent";
import CancelledEscrowDetails from "./CancelledEscrowDetails";
import ConfirmedEscrowActions from "./ConfirmedEscrowActions";
import EditEscrowDetails from "./EditEscrowDetails";
import PendingEscrowDetails from "./PendingEscrowDetails";
import RefundedEscrowDetails from "./RefundedEscrowDetails";
import ReleasedEscrowDetails from "./ReleasedEscrowDetails";

export interface EscrowDetailsContentProps {
  escrow: NormalizedTransaction;
  principal: Principal | null;
  isLoading: boolean | string | null;
  onRelease: (id: unknown) => Promise<void>;
  onRefund: () => Promise<void>;
  onApprove: () => Promise<void>;
  onDecline: () => Promise<void>;
  onCancel: () => Promise<void>;
  onEdit: () => void;
  onEscrowUpdate?: (updatedEscrow: NormalizedTransaction) => void;
}

export function EscrowDetailsContent({
  escrow,
  principal,
  isLoading,
  onRelease,
  onRefund,
  onApprove,
  onDecline,
  onCancel,
  onEdit,
  onEscrowUpdate,
}: EscrowDetailsContentProps) {
  // Use status directly since we simplified to generic statuses
  const getStatusKey = (status: string) => {
    return status;
  };
  
  const statusKey = getStatusKey(escrow.status || "unknown");


  // Transform escrow data for components that expect specific format
  const transformEscrowData = (escrow: NormalizedTransaction) => {
    return {
      id: escrow.id,
      status: escrow.status as string,
      title: escrow.title,
      from: escrow.from,
      createdAt: escrow.createdAt,
      to: escrow.to.map((toEntry) => {
        // Safely convert amount to BigInt with fallback
        let amountValue: bigint;
        try {
          const amountStr = toEntry.amount;
          if (amountStr !== undefined && amountStr !== null && amountStr !== '' && String(amountStr).trim() !== '') {
            const parsed = String(amountStr).trim();
            // Validate it's a valid number string before converting
            if (/^\d+$/.test(parsed)) {
              amountValue = BigInt(parsed);
            } else {
              amountValue = BigInt(0);
            }
          } else {
            amountValue = BigInt(0);
          }
        } catch {
          amountValue = BigInt(0);
        }

        // Safely convert percentage to number with fallback
        let percentageValue: number;
        try {
          const percentageStr = toEntry.percentage;
          if (percentageStr !== undefined && percentageStr !== null && percentageStr !== '' && String(percentageStr).trim() !== '') {
            const parsed = Number(String(percentageStr).trim());
            percentageValue = isNaN(parsed) ? 0 : parsed;
          } else {
            percentageValue = 0;
          }
        } catch {
          percentageValue = 0;
        }
        
        return {
          principal: toEntry.principal,
          amount: amountValue,
          percentage: percentageValue,
          status: toEntry.status as { [key: string]: null },
          name: toEntry.name,
          approvedAt: toEntry.approvedAt ? String(toEntry.approvedAt) : undefined,
          declinedAt: toEntry.declinedAt ? String(toEntry.declinedAt) : undefined,
          readAt: toEntry.readAt ? String(toEntry.readAt) : undefined,
        };
      }),
      releasedAt: escrow.releasedAt,
    };
  };

  const escrowData = transformEscrowData(escrow);


  if (statusKey === "released") {
    // Handle milestone transactions separately
    if (isMilestoneTransaction(escrow)) {
      return (
        <MilestoneDetailsContent
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
      );
    }
    
    return (
      <div className="space-y-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ReleasedEscrowDetails transaction={escrowData as unknown as any} />
      </div>
    );
  }

  if (statusKey === "pending") {

    // Handle milestone transactions separately
    if (isMilestoneTransaction(escrow)) {
      return (
        <MilestoneDetailsContent
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
      );
    }

    // Handle basic escrow transactions
    const isSender = isCurrentUserSender(escrow, principal);
    const hasActioned = hasUserActioned(escrow, principal);

    // Use different components for senders vs recipients
    if (isSender) {
      // Senders see Edit and Cancel buttons (NO approve/decline buttons)
      return (
        <div className="space-y-6">
          <EditEscrowDetails
            transaction={escrow as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            onCancel={onCancel}
            onEdit={onEdit}
            isLoading={isLoading}
          />
        </div>
      );
    } else {
      // Recipients see Approve and Decline buttons (only for recipients, not senders)
      // CRITICAL: Double-check that user is NOT the sender before showing approve/decline
      // Only show approve/decline if user hasn't already actioned AND is not the sender
      
      console.log('[EscrowDetailsContent] Recipient path - Decision logic:', {
        isSender,
        hasActioned,
        principalText: principal?.toText(),
        escrowFrom: escrow.from,
        principalExists: !!principal,
        escrowFromExists: !!escrow.from,
      });
      
      const isDefinitelyNotSender = !isSender && principal && escrow.from && 
        String(principal.toText()).trim() !== String(escrow.from).trim();
      
      const showApproveDecline = !hasActioned && isDefinitelyNotSender;
      
      console.log('[EscrowDetailsContent] Final decision:', {
        isDefinitelyNotSender,
        showApproveDecline,
        willShowApprove: showApproveDecline && !!onApprove,
        willShowDecline: showApproveDecline && !!onDecline,
        onApproveExists: !!onApprove,
        onDeclineExists: !!onDecline,
      });
      
      return (
        <div className="space-y-6">
          <PendingEscrowDetails
            transaction={escrow as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            escrow={escrowData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            currentUserPrincipal={principal?.toText()}
            onApprove={showApproveDecline ? onApprove : undefined}
            onDecline={showApproveDecline ? onDecline : undefined}
            isLoading={isLoading}
            hideOverview={false}
          />
        </div>
      );
    }
  }

  if (statusKey === "cancelled" || statusKey === "declined") {
    // Only show overview for basic escrows, not milestone escrows
    if (!isMilestoneTransaction(escrow)) {
      return (
        <div className="space-y-6">
          <CancelledEscrowDetails transaction={escrow as any} escrow={escrowData as any} /> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
        </div>
      );
    }
    return (
      <div>
        <CancelledEscrowDetails transaction={escrow as any} escrow={escrowData as any} /> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
      </div>
    );
  }

  if (statusKey === "refund" || statusKey === "refunded") {
    // Only show overview for basic escrows, not milestone escrows
    if (!isMilestoneTransaction(escrow)) {
      return (
        <div className="space-y-6">
          <RefundedEscrowDetails transaction={escrow as any} escrow={escrowData as any} /> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
        </div>
      );
    }
    return (
      <div>
        <RefundedEscrowDetails transaction={escrow as any} escrow={escrowData as any} /> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
      </div>
    );
  }

  if (statusKey === "confirmed") {
    // Handle milestone transactions separately
    if (isMilestoneTransaction(escrow)) {
      return (
        <MilestoneDetailsContent
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
      );
    }

    // Handle basic escrow transactions
    const isSender = isCurrentUserSender(escrow, principal);

    if (isSender) {
      return (
        <div className="space-y-6">
          <ConfirmedEscrowActions
            transaction={escrow as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            escrow={escrow as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            isLoading={isLoading}
            onRelease={onRelease}
            onRefund={onRefund}
          />
        </div>
      );
    } else {
      // Show waiting message for basic escrow recipients
      return (
        <div className="space-y-6">
          <PendingEscrowDetails
            transaction={escrow as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            escrow={escrowData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            currentUserPrincipal={principal?.toText()}
            onCancel={undefined}
            onApprove={undefined}
            onDecline={undefined}
            isLoading={isLoading}
            hideOverview={true}
          />
        </div>
      );
    }
  }

  return null;
}

"use client";

import { clientApprovedSignedContract, recipientSignContract } from "@/lib/internal/icp/milestone";
import { getTransaction } from "@/lib/internal/icp/transactions";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { convertToNormalizedTransactions } from "../../../transactions/utils";
import { hasUserActioned, isCurrentUserSender } from "../../utils/transactionDetailsHelpers";
import MilestonePendingDetails from "./MilestonePendingDetails";

export interface MilestoneDetailsContentProps {
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

export function MilestoneDetailsContent({
  escrow,
  principal,
  isLoading,
  onApprove,
  onDecline,
  onCancel,
  onEscrowUpdate,
}: MilestoneDetailsContentProps) {
  const statusKey = escrow.status || "unknown";
  const [currentTransaction, setCurrentTransaction] = useState(escrow);

  // Sync currentTransaction with escrow prop changes
  useEffect(() => {
    setCurrentTransaction(escrow);
  }, [escrow]);

  // Function to refresh transaction data from backend
  const refreshTransactionData = useCallback(async () => {
    if (!principal) return;

    try {
      console.log('🔄 [FRONTEND] Refreshing transaction data from backend...');
      const updatedTransaction = await getTransaction(principal, escrow.id);
      if (updatedTransaction) {
        const normalizedTransactions = convertToNormalizedTransactions([updatedTransaction]);
        if (normalizedTransactions.length > 0) {
          setCurrentTransaction(normalizedTransactions[0]);
          console.log('✅ [FRONTEND] Transaction data refreshed successfully');
        }
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Failed to refresh transaction data:', error);
    }
  }, [principal, escrow.id]);

  // Auto-refresh transaction data on component mount
  useEffect(() => {
    refreshTransactionData();
  }, [principal, escrow.id, refreshTransactionData]);

  // Function to handle signed contract upload
  const handleUploadSignedContract = async (milestoneId: string, recipientId: string): Promise<void> => {
    if (!principal) {
      toast.error("Error", { description: "Please connect your wallet first" });
      return;
    }

    return new Promise((resolve, reject) => {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve();
          return;
        }

        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          // Extract base64 data from data URL
          const base64String = dataUrl.split(',')[1] || dataUrl;

          try {
            const result = await recipientSignContract(escrow.id, milestoneId, recipientId, principal, base64String);

            if ('ok' in result) {
              toast.success("Success", { description: "Signed contract uploaded successfully!" });
              // Refresh transaction data
              if (principal) {
                try {
                  const updatedTransaction = await getTransaction(principal, escrow.id);
                  if (updatedTransaction) {
                    const normalizedTransaction = {
                      ...updatedTransaction,
                      amount: (updatedTransaction as any).funds_allocated?.toString() || '0' // eslint-disable-line @typescript-eslint/no-explicit-any
                    };
                    setCurrentTransaction(normalizedTransaction as any); // eslint-disable-line @typescript-eslint/no-explicit-any

                    // Notify parent component of the update
                    if (onEscrowUpdate) {
                      onEscrowUpdate(normalizedTransaction as any); // eslint-disable-line @typescript-eslint/no-explicit-any
                    }
                  }
                } catch (refreshError) {
                  console.error("❌ Failed to refresh transaction data:", refreshError);
                  toast.error("Failed to refresh transaction data", { description: "Contract uploaded but failed to refresh data. Please reload the page." });
                }
              }
              resolve();
            } else {
              console.error("❌ Backend returned error:", result.err);
              toast.error("Failed to upload signed contract", { description: result.err });
              reject(new Error(result.err));
            }
          } catch (error) {
            console.error("❌ :", error);
            toast.error("Contract upload error", { description: "Failed to upload signed contract" });
            reject(error);
          }
        };
        reader.readAsDataURL(file);
      };

      // Handle cancellation
      input.oncancel = () => {
        resolve();
      };

      // Trigger file selection
      input.click();
    });
  };

  // Function to handle client approval of signed contract
  const handleClientApproveSignedContract = async (transactionId: string, milestoneId: string, recipientId: string) => {
    if (!principal) {
      toast.error("Error", { description: "Please connect your wallet first" });
      return;
    }

    try {
      const result = await clientApprovedSignedContract(transactionId, milestoneId, recipientId, principal);

      if ('ok' in result) {
        toast.success("Success", { description: "Client approved signed contract successfully!" });
        // Refresh transaction data
        if (principal) {
          try {
            const updatedTransaction = await getTransaction(principal, escrow.id);
            if (updatedTransaction) {
              const normalizedTransaction = {
                ...updatedTransaction,
                amount: (updatedTransaction as any).funds_allocated?.toString() || '0' // eslint-disable-line @typescript-eslint/no-explicit-any
              };
              setCurrentTransaction(normalizedTransaction as any); // eslint-disable-line @typescript-eslint/no-explicit-any

              // Notify parent component of the update
              if (onEscrowUpdate) {
                onEscrowUpdate(normalizedTransaction as any); // eslint-disable-line @typescript-eslint/no-explicit-any
              }
            }
          } catch (refreshError) {
            console.error("❌ Failed to refresh transaction data:", refreshError);
            toast.error("Failed to refresh transaction data", { description: "Approval successful but failed to refresh data. Please reload the page." });
          }
        }
      } else {
        toast.error("Failed to approve signed contract", { description: result.err });
      }
    } catch (error) {
      toast.error("Approval error", { description: "Failed to approve signed contract" });
      console.error("Approval error:", error);
    }
  };

  // Transform escrow data for components that expect specific format
  const transformEscrowData = (escrow: NormalizedTransaction) => {
    return {
      id: escrow.id,
      status: escrow.status as string,
      title: escrow.title,
      from: escrow.from,
      createdAt: escrow.createdAt,
      to: escrow.to.map((toEntry) => ({
        principal: toEntry.principal,
        amount: BigInt(toEntry.amount !== undefined && toEntry.amount !== null ? String(toEntry.amount) : '0'),
        percentage: Number(toEntry.percentage !== undefined && toEntry.percentage !== null ? String(toEntry.percentage) : '0'),
        status: toEntry.status as { [key: string]: null },
        name: toEntry.name,
        approvedAt: toEntry.approvedAt ? String(toEntry.approvedAt) : undefined,
        declinedAt: toEntry.declinedAt ? String(toEntry.declinedAt) : undefined,
        readAt: toEntry.readAt ? String(toEntry.readAt) : undefined,
      })),
      releasedAt: escrow.releasedAt,
    };
  };

  const escrowData = transformEscrowData(escrow);


  if (statusKey === "pending") {
    const isSender = isCurrentUserSender(escrow, principal);
    const hasActioned = hasUserActioned(escrow, principal);

    if (isSender) {
      // For milestone transactions, use MilestonePendingDetails even for senders

      return (
        <div className="space-y-6">
          <MilestonePendingDetails
            transaction={currentTransaction as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            escrow={escrowData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            currentUserPrincipal={principal?.toText()}
            onCancel={onCancel}
            onApprove={undefined}
            onDecline={undefined}
            isLoading={isLoading}
            onUploadSignedContract={handleUploadSignedContract}
            onClientApproveSignedContract={handleClientApproveSignedContract}
            onTransactionUpdate={onEscrowUpdate}
          />
        </div>
      );
    } else {
      // For milestone recipients
      return (
        <div className="space-y-6">
          <MilestonePendingDetails
            transaction={currentTransaction as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            escrow={escrowData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            currentUserPrincipal={principal?.toText()}
            onCancel={undefined}
            onApprove={hasActioned ? undefined : onApprove}
            onDecline={hasActioned ? undefined : onDecline}
            isLoading={isLoading}
            onUploadSignedContract={handleUploadSignedContract}
            onClientApproveSignedContract={handleClientApproveSignedContract}
            onTransactionUpdate={onEscrowUpdate}
          />
        </div>
      );
    }
  }

  if (statusKey === "confirmed") {
    const isSender = isCurrentUserSender(escrow, principal);

    if (isSender) {
      // For milestone senders in confirmed state - show release/refund actions
      return (
        <div className="space-y-6">
          <MilestonePendingDetails
            transaction={currentTransaction as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            escrow={escrowData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            currentUserPrincipal={principal?.toText()}
            onCancel={undefined}
            onApprove={undefined}
            onDecline={undefined}
            isLoading={isLoading}
            onUploadSignedContract={handleUploadSignedContract}
            onClientApproveSignedContract={handleClientApproveSignedContract}
            onTransactionUpdate={onEscrowUpdate}
          />
        </div>
      );
    } else {
      // Show waiting message for recipients
      return (
        <div className="space-y-6">
          <MilestonePendingDetails
            transaction={escrow as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            escrow={escrowData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            currentUserPrincipal={principal?.toText()}
            onCancel={undefined}
            onApprove={undefined}
            onDecline={undefined}
            isLoading={isLoading}
            onTransactionUpdate={onEscrowUpdate}
          />
        </div>
      );
    }
  }

  if (statusKey === "released") {
    // For released milestone transactions, show the milestone details with completed status
    return (
      <div className="space-y-6">
        <MilestonePendingDetails
          transaction={currentTransaction as any} // eslint-disable-line @typescript-eslint/no-explicit-any
          escrow={escrowData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
          currentUserPrincipal={principal?.toText()}
          onCancel={undefined}
          onApprove={undefined}
          onDecline={undefined}
          isLoading={isLoading}
          onUploadSignedContract={handleUploadSignedContract}
          onClientApproveSignedContract={handleClientApproveSignedContract}
          onTransactionUpdate={onEscrowUpdate}
        />
      </div>
    );
  }

  // For other statuses (cancelled, declined, refund), 
  // we can add specific milestone components later if needed
  // For now, return null to let the parent handle these cases
  return null;
}

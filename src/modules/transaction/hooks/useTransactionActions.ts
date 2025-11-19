import {
  sendEscrowApprovedNotification,
  sendEscrowCancelNotification,
  sendEscrowDeclineNotification,
  sendEscrowRefundNotification,
  sendEscrowReleaseNotification
} from '@/lib/internal/auth';
import {
  approveEscrow,
  cancelEscrow,
  declineEscrow,
  getTransaction,
  getTransactionsPaginated,
  refundEscrow,
  releaseEscrow
} from '@/lib/internal/icp';
import { markTransactionAsRead, setTransactions } from '@/lib/redux';
import { Principal } from '@dfinity/principal';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { NormalizedTransaction } from '../../shared.types';
import { convertToNormalizedTransactions } from '../../transactions/utils';
import { getPrincipalAsString, serializeApiEscrow, serializeEscrowForRedux } from '../utils/transactionDetailsHelpers';

export type LoadingState = "release" | "refund" | "approve" | "decline" | "cancel" | null;

export interface UseEscrowActionsReturn {
  isLoading: LoadingState;
  handleRelease: (id: unknown) => Promise<void>;
  handleCancel: () => Promise<void>;
  handleRefund: () => Promise<void>;
  handleApprove: () => Promise<void>;
  handleDecline: () => Promise<void>;
  handleEdit: () => void;
}

export function useEscrowActions(
  escrow: NormalizedTransaction | null,
  principal: Principal | null,
  escrowIdString: string,
  onEscrowUpdate: (updatedEscrow: NormalizedTransaction) => void
): UseEscrowActionsReturn {
  const [isLoading, setIsLoading] = useState<LoadingState>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRelease = useCallback(async (id: unknown) => {
    if (!principal) return;

    setIsLoading("release");
    // Add 1 second delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await releaseEscrow(principal, String(id));

      // Send notifications
      try {
        if (escrow) {
          for (const recipient of escrow.to) {
            const recipientPrincipal = getPrincipalAsString(recipient.principal);
            const amountInBTC = recipient.amount ? (Number(recipient.amount) / 1e8).toFixed(8) : '0';

            await sendEscrowReleaseNotification({
              recipientPrincipal,
              escrowData: {
                id: escrow.id,
                from: escrow.from,
                title: escrow.title || 'Escrow Request',
                amount: amountInBTC,
                releasedBy: principal?.toText() || 'Unknown',
                releaseAmount: amountInBTC
              }
            });
          }
        }
      } catch (notificationError) {
        console.error('🔔 Failed to send release notifications:', notificationError);
      }

      // Fetch updated escrow with retry logic
      let updated = null;
      let retries = 0;
      const maxRetries = 3;

      while (!updated && retries < maxRetries) {
        // Add a small delay to ensure backend has processed the release
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          updated = await getTransaction(principal, escrowIdString);
        } catch (fetchError) {
          console.warn(` Attempt ${retries + 1} failed to fetch escrow after release:`, fetchError);
        }
        retries++;
      }

      if (updated) {
        const serializedUpdated = serializeApiEscrow(updated);
        onEscrowUpdate(serializedUpdated as NormalizedTransaction);

        // Also update the global transaction list in Redux
        try {
          const updatedTransaction = await getTransaction(principal, escrowIdString);
          if (updatedTransaction) {
            const normalizedTx = convertToNormalizedTransactions([updatedTransaction])[0];
            // Update the specific transaction in Redux store
            dispatch(markTransactionAsRead(normalizedTx));
            console.log('✅ Global transaction list updated after release');
          }
        } catch (refreshError) {
          console.warn(' Failed to refresh global transaction list:', refreshError);
        }
      } else {
        console.warn(' Failed to fetch updated escrow after release, using optimistic update');
        // Create an optimistic update with released status
        const optimisticUpdate = {
          ...escrow,
          status: 'released',
          releasedAt: new Date().toISOString()
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);

        // Also update the global transaction list optimistically
        try {
          const updatedTransaction = await getTransaction(principal, escrowIdString);
          if (updatedTransaction) {
            const normalizedTx = convertToNormalizedTransactions([updatedTransaction])[0];
            // Update the specific transaction in Redux store
            dispatch(markTransactionAsRead(normalizedTx));
            console.log('✅ Global transaction list updated optimistically after release');
          }
        } catch (refreshError) {
          console.warn(' Failed to refresh global transaction list optimistically:', refreshError);
        }
      }
    } catch (err) {
      console.error("Release error:", err);
      toast.error("Error", { description: "Failed to release escrow" });
      // Even if there's an error, try to update the UI optimistically
      if (escrow) {
        const optimisticUpdate = {
          ...escrow,
          status: 'released',
          releasedAt: new Date().toISOString()
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } finally {
      setIsLoading(null);
    }
  }, [principal, escrow, onEscrowUpdate, escrowIdString, dispatch]);

  const handleCancel = useCallback(async () => {
    if (!escrow || !principal) return;

    setIsLoading("cancel");
    try {
      await cancelEscrow(
        Principal.fromText(getPrincipalAsString(escrow.from)),
        escrow.id
      );

      // Send notifications
      try {
        if (escrow) {
          for (const recipient of escrow.to) {
            const recipientPrincipal = getPrincipalAsString(recipient.principal);

            await sendEscrowCancelNotification({
              recipientPrincipal,
              escrowData: {
                id: escrow.id,
                from: escrow.from,
                title: escrow.title || 'Escrow Request',
                amount: '0',
                cancelledBy: principal?.toText() || 'Unknown',
                reason: 'Cancelled by sender'
              }
            });
          }
        }
      } catch (notificationError) {
        console.error('🔔 Failed to send cancel notifications:', notificationError);
      }

      // Refresh escrow data with retry logic
      let updated = null;
      let retries = 0;
      const maxRetries = 3;

      while (!updated && retries < maxRetries) {
        // Add a small delay to ensure backend has processed the cancel
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          updated = await getTransaction(principal, escrowIdString);
        } catch (fetchError) {
          console.warn(` Attempt ${retries + 1} failed to fetch escrow after cancel:`, fetchError);
        }
        retries++;
      }

      if (updated) {
        const serializedUpdated = serializeApiEscrow(updated);
        onEscrowUpdate(serializedUpdated as NormalizedTransaction);
      } else {
        console.warn(' Failed to fetch updated escrow after cancel, using optimistic update');
        // Create an optimistic update with cancelled status
        const optimisticUpdate = {
          ...escrow,
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      // Even if there's an error, try to update the UI optimistically
      if (escrow) {
        const optimisticUpdate = {
          ...escrow,
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } finally {
      setIsLoading(null);
    }
  }, [escrow, principal, escrowIdString, onEscrowUpdate]);

  const handleRefund = useCallback(async () => {
    if (!escrow || !principal) return;

    setIsLoading("refund");
    try {
      await refundEscrow(
        Principal.fromText(getPrincipalAsString(escrow.from)),
        Number(escrow.id)
      );

      // Send notifications
      try {
        if (escrow) {
          for (const recipient of escrow.to) {
            const recipientPrincipal = getPrincipalAsString(recipient.principal);

            await sendEscrowRefundNotification({
              recipientPrincipal,
              escrowData: {
                id: escrow.id,
                from: escrow.from,
                title: escrow.title || 'Escrow Request',
                amount: '0',
                refundedBy: principal?.toText() || 'Unknown',
                refundAmount: '0',
                reason: 'Refunded by sender'
              }
            });
          }
        }
      } catch (notificationError) {
        console.error('🔔 Failed to send refund notifications:', notificationError);
      }

      // Refresh escrow data with retry logic
      let updated = null;
      let retries = 0;
      const maxRetries = 3;

      while (!updated && retries < maxRetries) {
        // Add a small delay to ensure backend has processed the refund
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          updated = await getTransaction(principal, escrowIdString);
        } catch (fetchError) {
          console.warn(` Attempt ${retries + 1} failed to fetch escrow after refund:`, fetchError);
        }
        retries++;
      }

      if (updated) {
        const serializedUpdated = serializeApiEscrow(updated);
        onEscrowUpdate(serializedUpdated as NormalizedTransaction);
      } else {
        console.warn(' Failed to fetch updated escrow after refund, using optimistic update');
        // Create an optimistic update with refunded status
        const optimisticUpdate = {
          ...escrow,
          status: 'refund',
          refundedAt: new Date().toISOString()
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } catch (err) {
      console.error("Refund error:", err);
      toast.error("Error", { description: "Failed to refund escrow" });
      // Even if there's an error, try to update the UI optimistically
      if (escrow) {
        const optimisticUpdate = {
          ...escrow,
          status: 'refund',
          refundedAt: new Date().toISOString()
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } finally {
      setIsLoading(null);
    }
  }, [escrow, principal, escrowIdString, onEscrowUpdate]);

  const handleApprove = useCallback(async () => {
    if (!escrow || !principal) return;

    setIsLoading("approve");
    // Add 1 second delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const senderPrincipal = Principal.fromText(getPrincipalAsString(escrow.from));
      const principalStr = getPrincipalAsString(principal);

      console.log('🔍 Approve Debug:', {
        principalStr,
        escrowTo: escrow.to,
        escrowToLength: escrow.to.length,
        recipientEntries: escrow.to.map(entry => ({
          principal: entry.principal,
          principalType: typeof entry.principal,
          principalString: String(entry.principal),
          matches: String(entry.principal) === principalStr
        }))
      });

      const recipientEntry = escrow.to.find((entry) => String(entry.principal) === principalStr);

      if (!recipientEntry) {
        console.error('❌ Recipient entry not found:', {
          principalStr,
          availablePrincipals: escrow.to.map(entry => String(entry.principal))
        });
        toast.error('Error', { description: "Recipient entry not found." });
        setIsLoading(null);
        return;
      }

      const recipientPrincipal = Principal.fromText(getPrincipalAsString(recipientEntry.principal));
      await approveEscrow(senderPrincipal, escrow.id, recipientPrincipal);

      // Send notification
      try {
        const totalRecipients = escrow.to.length;
        const approvedRecipients = escrow.to.filter(entry =>
          entry.status && Object.keys(entry.status)[0] === 'approved'
        ).length + 1; // +1 because we just approved

        const isReadyForRelease = approvedRecipients >= totalRecipients;

        const notificationData = {
          recipientPrincipal: senderPrincipal.toText(),
          escrowData: {
            id: escrow.id,
            status: isReadyForRelease ? 'ready_for_release' : 'approved',
            recipient: principalStr,
            title: escrow.title || 'Escrow Request',
            amount: recipientEntry.amount ? String(recipientEntry.amount) : '0',
            approvalProgress: `${approvedRecipients}/${totalRecipients}`,
            totalRecipients,
            approvedCount: approvedRecipients,
            readyForRelease: isReadyForRelease
          }
        };

        await sendEscrowApprovedNotification(notificationData);
      } catch (notificationError) {
        console.error('🔔 Failed to send approval notification:', notificationError);
      }

      // Fetch updated escrow with retry logic
      let updated = null;
      let retries = 0;
      const maxRetries = 3;

      while (!updated && retries < maxRetries) {
        // Add a small delay to ensure backend has processed the approval
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          updated = await getTransaction(principal, escrowIdString);
        } catch (fetchError) {
          console.warn(` Attempt ${retries + 1} failed to fetch escrow after approval:`, fetchError);
        }
        retries++;
      }

      if (updated) {
        const serializedUpdated = serializeApiEscrow(updated);
        onEscrowUpdate(serializedUpdated as NormalizedTransaction);

        // Update Redux store
        const allEscrows = await getTransactionsPaginated(principal, 0, 100);
        const normalizedEscrows = allEscrows.transactions.map((escrow: unknown) => serializeEscrowForRedux(escrow));
        dispatch(setTransactions(normalizedEscrows));
      } else {
        console.warn(' Failed to fetch updated escrow after approval, using optimistic update');
        // Create an optimistic update with approved status
        const optimisticUpdate = {
          ...escrow,
          // Note: For approval, we don't change the main status, just the recipient status
          // The status will be updated when all recipients approve
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Error", { description: "Failed to approve escrow" });
      // Even if there's an error, try to update the UI optimistically
      if (escrow) {
        const optimisticUpdate = {
          ...escrow,
          // Note: For approval, we don't change the main status, just the recipient status
          // The status will be updated when all recipients approve
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } finally {
      setIsLoading(null);
    }
  }, [escrow, principal, onEscrowUpdate, dispatch, escrowIdString]);

  const handleDecline = useCallback(async () => {
    if (!escrow || !principal) return;

    setIsLoading("decline");
    try {
      const senderPrincipal = Principal.fromText(getPrincipalAsString(escrow.from));
      const principalStr = getPrincipalAsString(principal);

      console.log('🔍 Decline Debug:', {
        principalStr,
        escrowTo: escrow.to,
        escrowToLength: escrow.to.length,
        recipientEntries: escrow.to.map(entry => ({
          principal: entry.principal,
          principalType: typeof entry.principal,
          principalString: String(entry.principal),
          matches: String(entry.principal) === principalStr
        }))
      });

      const recipientEntry = escrow.to.find((entry) => String(entry.principal) === principalStr);

      if (!recipientEntry) {
        console.error('❌ Recipient entry not found in decline:', {
          principalStr,
          availablePrincipals: escrow.to.map(entry => String(entry.principal))
        });
        toast.error('Error', { description: "Recipient entry not found." });
        return;
      }

      const recipientPrincipal = Principal.fromText(getPrincipalAsString(recipientEntry.principal));

      // Get the sender's escrows to find the correct index
      const senderPrincipalStr = getPrincipalAsString(escrow.from);
      const escrows = await getTransactionsPaginated(Principal.fromText(senderPrincipalStr), 0, 100);
      const escrowIndex = escrows.transactions.findIndex((e: unknown) => (e as { id: string }).id === escrow.id);

      if (escrowIndex === -1) {
        toast.error('Error', { description: "Escrow not found." });
        return;
      }

      const declineResult = await declineEscrow(senderPrincipal, escrowIndex, recipientPrincipal);

      if (!declineResult) {
        toast.error('Error', { description: "Failed to decline escrow" });
        return;
      }

      // Send notification
      try {
        await sendEscrowDeclineNotification({
          recipientPrincipal: senderPrincipal.toText(),
          escrowData: {
            id: escrow.id,
            from: escrow.from,
            title: escrow.title || 'Escrow Request',
            amount: recipientEntry.amount ? String(recipientEntry.amount) : '0',
            declinedBy: principalStr,
            reason: 'Declined by recipient'
          }
        });
      } catch (notificationError) {
        console.error('🔔 Failed to send decline notification:', notificationError);
      }

      // Fetch updated escrow with retry logic
      let updated = null;
      let retries = 0;
      const maxRetries = 3;

      while (!updated && retries < maxRetries) {
        // Add a small delay to ensure backend has processed the decline
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          updated = await getTransaction(principal, escrowIdString);
        } catch (fetchError) {
          console.warn(` Attempt ${retries + 1} failed to fetch escrow after decline:`, fetchError);
        }
        retries++;
      }

      if (updated) {
        const serializedUpdated = serializeApiEscrow(updated);
        onEscrowUpdate(serializedUpdated as NormalizedTransaction);
      } else {
        console.warn(' Failed to fetch updated escrow after decline, using optimistic update');
        // Create an optimistic update with declined status
        const optimisticUpdate = {
          ...escrow,
          status: 'declined',
          declinedAt: new Date().toISOString()
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } catch (err) {
      console.error("Decline error:", err);
      toast.error("Error", { description: "Failed to decline escrow" });
      // Even if there's an error, try to update the UI optimistically
      if (escrow) {
        const optimisticUpdate = {
          ...escrow,
          status: 'declined',
          declinedAt: new Date().toISOString()
        } as NormalizedTransaction;
        onEscrowUpdate(optimisticUpdate);
      }
    } finally {
      setIsLoading(null);
    }
  }, [escrow, principal, onEscrowUpdate, escrowIdString]);

  const handleEdit = useCallback(() => {
    navigate(`/escrow?edit=${escrow?.id}`);
  }, [navigate, escrow?.id]);

  return {
    isLoading,
    handleRelease,
    handleCancel,
    handleRefund,
    handleApprove,
    handleDecline,
    handleEdit,
  };
}


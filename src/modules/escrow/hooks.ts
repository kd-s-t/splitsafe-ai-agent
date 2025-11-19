
import { sendEscrowInitiatedNotification } from "@/lib/internal/auth";
import {
    createSplitDappActor,
    getTransaction,
    getTransactionsPaginated
} from "@/lib/internal/icp";
import { createBasicEscrow } from "@/lib/internal/icp/transaction";
import type { ParticipantShare } from "@/lib/internal/icp/types";
import { setNewTxId } from "@/lib/redux/store/escrowSlice";
import { setTransactions } from "@/lib/redux/store/transactionsSlice";
import { setCkbtcBalance } from "@/lib/redux/store/userSlice";
import { convertToNormalizedTransactions } from "@/modules/transactions/utils";
import { Principal } from "@dfinity/principal";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useUserWithAuth } from "../shared.hooks";


type Recipient = {
  id: string;
  name: string;
  principal: string;
  percentage: number;
};

type FormData = {
  btcAmount: string;
  seiAmount?: string;
  tokenType: 'btc' | 'sei';
  recipients: Recipient[];
  title?: string;
  useSeiAcceleration?: boolean;
};

export function useEscrowActions(editTxId?: string) {
  const { principal, authClient } = useUserWithAuth();
  const dispatch = useDispatch();

  const updateBalance = useCallback(async () => {
    if (principal && authClient) {
      try {
        const principalObj = Principal.fromText(principal?.toText() || '');

        // Get real cKBTC balance from canister
        try {
          const { createAnonymousActorNew } = await import('@/lib/internal/icp/splitDapp/splitDappNew');
          const anonymousActor = await createAnonymousActorNew();
          if (anonymousActor && typeof anonymousActor.getUserBitcoinBalance === 'function') {
            const balanceResult = await anonymousActor.getUserBitcoinBalance(principalObj) as bigint;
            const balanceInSatoshis = Number(balanceResult);
            const balanceInBTC = (balanceInSatoshis / 1e8).toFixed(8);
            console.log('✅ [ESCROW] Real cKBTC balance fetched:', balanceInBTC, 'BTC');
            dispatch(setCkbtcBalance(balanceInBTC));
          } else {
            console.warn('🔄 [ESCROW] cKBTC balance method not available on actor');
            dispatch(setCkbtcBalance('0.00000000'));
          }
        } catch (error) {
          console.error('❌ [ESCROW] Error fetching cKBTC balance:', error);
          dispatch(setCkbtcBalance('0.00000000'));
        }

      } catch (error) {
        console.error('Error updating balances:', error);
        dispatch(setCkbtcBalance(null));
      }
    }
  }, [principal, authClient, dispatch]);

  const fetchAndStoreTransactions = useCallback(async () => {
    if (!principal) return;
    if (!authClient) return;

    const principalObj = Principal.fromText(principal.toText());
    const result = await getTransactionsPaginated(
      principalObj,
      0,
      50
    );

    // Use the proper conversion function that handles the new schema
    const normalizedTxs = convertToNormalizedTransactions(result.transactions);
    dispatch(setTransactions(normalizedTxs));
  }, [principal, authClient, dispatch]);



  // const getBitcoinAddressForPrincipal = useCallback(async (principalText: string): Promise<string> => {
  //   try {
  //     const actor = await createSplitDappActor();
  //     const principalObj = Principal.fromText(principalText);
  //     const address = await actor.getBitcoinAddress(principalObj);

  //     if (!address || typeof address !== 'string' || address.trim() === '') {
  //       return "";
  //     }
  //     return address;
  //   } catch (error) {
  //     console.error('Failed to get Bitcoin address for principal:', principalText, error);
  //     return "";
  //   }
  // }, []);

  const createEscrow = useCallback(
    async (data: FormData) => {
      console.log('🔍 createEscrow called with data:', data);

      if (!principal) {
        console.log('🔍 No principal found');
        toast.error("Error", { description: "You must be logged in to proceed." });
        return { success: false, error: "Not logged in" };
      }

      try {
        // const actor = await createSplitDappActor();
        // Use the actual user's principal
        const callerPrincipal = Principal.fromText(principal?.toText() || '');

        // Balance checks will be handled by the backend

        const participants: ParticipantShare[] = data.recipients.map((r) => {
          let amount: bigint;
          if (data.tokenType === 'btc') {
            amount = BigInt(Math.round(((Number(data.btcAmount) * r.percentage) / 100) * 1e8));
          } else {
            amount = BigInt(Math.round(((Number(data.seiAmount || '0') * r.percentage) / 100) * 1e6));
          }

          // Ensure principal is a string and valid
          let principalString: string;
          if (typeof r.principal === 'string') {
            principalString = r.principal;
          } else if (r.principal && typeof r.principal === 'object' && 'toText' in r.principal) {
            principalString = (r.principal as { toText: () => string }).toText();
          } else {
            throw new Error(`Invalid principal for recipient: ${r.name}`);
          }

          if (!principalString || principalString.trim() === '') {
            throw new Error(`Empty principal for recipient: ${r.name}`);
          }

          return {
            principal: Principal.fromText(principalString),
            nickname: r.name || principalString,
            amount: amount,
            percentage: Number(r.percentage), // Ensure percentage is a number, not string
          };
        });

        // Debug: Log the participants being sent
        console.log('🔍 Participants being sent:', JSON.stringify(participants, (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString();
          }
          if (value && typeof value === 'object' && 'toText' in value) {
            return value.toText();
          }
          return value;
        }, 2));

        // Use the unified createBasicEscrow function
        const result = await createBasicEscrow(
          callerPrincipal,
          data.title || "",
          participants,
          Boolean(data.useSeiAcceleration)
        );


        // Check if result is an error
        if ('err' in result) {
          toast.error('Error', { description: result.err });
          return { success: false, error: result.err };
        }

        // If no error, result should have the transaction ID
        if (!('ok' in result) || !result.ok?.transactionId) {
          toast.error("Error", { description: 'Failed to create escrow' });
          return { success: false, error: "No transaction ID returned" };
        }

        const txId = result.ok.transactionId;

        dispatch(setNewTxId(String(txId)));
        await fetchAndStoreTransactions();
        await updateBalance();

        // Send notifications asynchronously (don't block escrow creation)
        for (const recipient of data.recipients) {
          const notificationData = {
            recipientPrincipal: recipient.principal,
            escrowData: {
              id: String(txId),
              title: data.title || 'New Escrow Request',
              amount: data.btcAmount || data.seiAmount || '0',
              from: principal?.toText() || ''
            }
          };

          // Send notification without awaiting (fire and forget)
          sendEscrowInitiatedNotification(notificationData).catch(error => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Backend server not available') || 
                errorMessage.includes('ConnectionRefusedError')) {
              console.warn('🔔 Notification service unavailable (non-blocking):', errorMessage);
            } else {
              console.warn('🔔 Failed to send notification (non-blocking):', errorMessage);
            }
          });
        }

        return { success: true, txId: String(txId) };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("🔍 Create escrow failed:", err);
        toast.error('Error creating escrow', { description: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    [principal, dispatch, fetchAndStoreTransactions, updateBalance]
  );

  const updateEscrow = useCallback(
    async (data: FormData) => {
      if (!principal || !editTxId) {
        toast.error("Error", { description: "You must be logged in to proceed." });
        return;
      }

      try {
        const actor = await createSplitDappActor();
        const callerPrincipal = principal; // principal is already a Principal object

        try {
          const currentTx = await getTransaction(principal, editTxId);
          if (currentTx) {
            if (currentTx.status !== "pending") {
              toast.error("Cannot update", { description: "Transaction is no longer pending" });
              window.location.href = `/transactions/${editTxId}`;
              return;
            }

            const hasAction = currentTx.to.some(
              (recipient: unknown) => (recipient as { status?: unknown }).status && typeof (recipient as { status: unknown }).status === 'object' && (recipient as { status: unknown }).status !== null && Object.keys((recipient as { status: Record<string, unknown> }).status)[0] !== "pending"
            );

            if (hasAction) {
              toast.error("Cannot update", { description: "Some recipients have already taken action" });
              window.location.href = `/transactions/${editTxId}`;
              return;
            }
          }
        } catch {
          toast.error("Error", { description: "Failed to verify transaction status" });
          window.location.href = `/transactions/${editTxId}`;
          return;
        }

        const updatedParticipants = await Promise.all(
          data.recipients.map(async (r) => ({
            principal: Principal.fromText(r.principal),
            amount: BigInt(Math.round(((Number(data.btcAmount) * r.percentage) / 100) * 1e8)),
            nickname: r.principal,
            percentage: BigInt(r.percentage),
          }))
        );

        await actor.updateEscrow(callerPrincipal, editTxId, updatedParticipants);
        toast.success("Success", { description: "Escrow updated successfully!" });
        window.location.href = `/transactions/${editTxId}`;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast.error('Error updating escrow', { description: errorMessage });
        console.error("Update escrow failed:", err);
      }
    },
    [principal, editTxId]
  );

  return { createEscrow, updateEscrow };
}

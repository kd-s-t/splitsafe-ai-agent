import { Transaction } from '@/declarations/split_dapp/split_dapp.did';
import { escrowNotificationService } from '@/lib/integrations/resend';
import { Principal } from '@dfinity/principal';
import { attestStoryAction } from '../../api';
import { createSplitDappActor } from '../splitDapp';

/**
 * Decline an escrow transaction as a recipient
 */
export async function declineEscrow(
  senderPrincipal: Principal,
  transactionIndex: number,
  recipientPrincipal: Principal
): Promise<boolean> {
  try {
    const actor = await createSplitDappActor();
    
    await actor.recipientDeclineEscrow(
      senderPrincipal,
      transactionIndex,
      recipientPrincipal
    );
    
    try {
      const transactionsResult = await actor.getTransactionsPaginated(senderPrincipal, BigInt(0), BigInt(100)) as { transactions: Transaction[] };
      const transactions = transactionsResult.transactions;
      const transaction = transactions[transactionIndex];
      
      const basicData = transaction?.basicData?.[0]; // Handle optional array
      const recipient = basicData?.to?.find((r: { principal: { toText: () => string } }) => 
        r.principal.toText() === recipientPrincipal.toText()
      );
      const recipientAmount = recipient?.funds_allocated || BigInt(0);
      
      await escrowNotificationService.sendEscrowDeclineEmail({
        escrowId: transaction?.id || `tx-${transactionIndex}`,
        title: transaction?.title || 'Unknown Escrow',
        declinedBy: recipientPrincipal.toText(),
        declinedAt: new Date().toISOString(),
        amount: recipientAmount,
        coin: 'BTC'
      });

      // Non-blocking: record Story decline attestation (uses transaction in-scope)
      try {
        const payload = await attestStoryAction({ escrowId: transaction?.id || `tx-${transactionIndex}`, action: 'decline_attest' });
        if (payload?.transactionHash) {
          try {
            await actor.storeStoryTx(transaction?.id || `tx-${transactionIndex}`, 'decline_attest', String(payload.transactionHash), recipientPrincipal);
          } catch (persistErr) {
            console.warn('Failed to persist Story decline attestation:', persistErr);
          }
        }
      } catch (e) {
        console.warn('Story decline attestation failed (non-blocking):', e);
      }
    } catch (emailError) {
      console.warn('Failed to send decline email:', emailError);
    }

    // Determine an escrowId string for evidence submission
    const escrowIdForEvidence = await (async () => {
      try {
        const txs = await actor.getTransactionsPaginated(senderPrincipal, BigInt(0), BigInt(100)) as { transactions: Transaction[] };
        return txs.transactions[transactionIndex]?.id || `tx-${transactionIndex}`;
      } catch {
        return `tx-${transactionIndex}`;
      }
    })();

    // Non-blocking: submit digital evidence and persist returned hash
    (async () => {
      try {
        const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
        const escrowEvent = {
          type: 'escrow_declined',
          escrowId: escrowIdForEvidence,
          declinedBy: recipientPrincipal.toText(),
          sender: senderPrincipal.toText(),
          timestamp: new Date().toISOString()
        };
        const submission = await submitEvidence({
          escrowEvent,
          documentId: String(escrowIdForEvidence),
          tags: { source: 'splitsafe', stage: process.env.NODE_ENV || 'development' }
        });
        if (submission?.hash) {
          try {
            const actorPersist = await createSplitDappActor();
            await actorPersist.storeConstellationHash(
              String(escrowIdForEvidence),
              'escrow_declined',
              submission.hash,
              recipientPrincipal
            );
          } catch (persistErr) {
            console.warn('Failed to persist digital evidence hash (decline):', persistErr);
          }
        }
      } catch (e) {
        console.warn('Digital evidence submission failed (decline, non-blocking):', e);
      }
    })();

    return true;
  } catch {
    return false;
  }
}


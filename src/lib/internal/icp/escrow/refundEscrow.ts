import { Transaction } from '@/declarations/split_dapp/split_dapp.did';
import { escrowNotificationService } from '@/lib/integrations/resend';
import { Principal } from '@dfinity/principal';
import { attestStoryAction } from '../../api';
import { createSplitDappActor } from '../splitDapp';

/**
 * Refund an escrow transaction as the initiator
 */
export async function refundEscrow(
  initiatorPrincipal: Principal,
  transactionIndex: number
): Promise<boolean> {
  try {
    const actor = await createSplitDappActor();
    
    await actor.refundSplit(initiatorPrincipal);
    
    try {
      const transactionsResult = await actor.getTransactionsPaginated(initiatorPrincipal, BigInt(0), BigInt(100)) as { transactions: Transaction[] };
      const transactions = transactionsResult.transactions;
      const transaction = transactions[transactionIndex];
      
      await escrowNotificationService.sendEscrowRefundEmail({
        escrowId: transaction?.id || `tx-${transactionIndex}`,
        title: transaction?.title || 'Unknown Escrow',
        refundedBy: initiatorPrincipal.toText(),
        refundedAt: new Date().toISOString(),
        amount: transaction?.funds_allocated || BigInt(0),
        coin: 'BTC'
      });

      // Non-blocking: record Story refund attestation (uses transaction in-scope)
      try {
        const payload = await attestStoryAction({ escrowId: transaction?.id || `tx-${transactionIndex}`, action: 'refund_attest' });
        if (payload?.transactionHash) {
          try {
            await actor.storeStoryTx(transaction?.id || `tx-${transactionIndex}`, 'refund_attest', String(payload.transactionHash), initiatorPrincipal);
          } catch (persistErr) {
            console.warn('Failed to persist Story refund attestation:', persistErr);
          }
        }
      } catch (e) {
        console.warn('Story refund attestation failed (non-blocking):', e);
      }
    } catch (emailError) {
      console.warn('Failed to send refund email:', emailError);
    }

    // Determine an escrowId string for evidence submission
    const escrowIdForEvidence = await (async () => {
      try {
        const txs = await actor.getTransactionsPaginated(initiatorPrincipal, BigInt(0), BigInt(100)) as { transactions: Transaction[] };
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
          type: 'escrow_refunded',
          escrowId: escrowIdForEvidence,
          refundedBy: initiatorPrincipal.toText(),
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
              'escrow_refunded',
              submission.hash,
              initiatorPrincipal
            );
          } catch (persistErr) {
            console.warn('Failed to persist digital evidence hash (refund):', persistErr);
          }
        }
      } catch (e) {
        console.warn('Digital evidence submission failed (refund, non-blocking):', e);
      }
    })();

    return true;
  } catch {
    return false;
  }
}


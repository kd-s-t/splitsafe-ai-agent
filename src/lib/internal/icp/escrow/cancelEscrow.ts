import { Transaction } from '@/declarations/split_dapp/split_dapp.did';
import { escrowNotificationService } from '@/lib/integrations/resend';
import { Principal } from '@dfinity/principal';
import { attestStoryAction } from '../../api';
import { createSplitDappActor } from '../splitDapp';

/**
 * Cancel an escrow transaction as the initiator
 */
export async function cancelEscrow(
  initiatorPrincipal: Principal,
  transactionId: string
): Promise<boolean> {
  try {
    const actor = await createSplitDappActor();
    
    const transaction = await actor.cancelTransaction(initiatorPrincipal) as Transaction;
    
    if (transaction) {
      try {
        await escrowNotificationService.sendEscrowCancelEmail({
          escrowId: transactionId,
          title: transaction.title || 'Unknown Escrow',
          cancelledBy: initiatorPrincipal.toText(),
          cancelledAt: new Date().toISOString(),
          amount: transaction.funds_allocated || BigInt(0),
          coin: 'BTC'
        });
      } catch (emailError) {
        console.warn('Failed to send cancellation email:', emailError);
      }
    }
    
    // Non-blocking: record Story cancel attestation
    try {
      const payload = await attestStoryAction({ escrowId: transactionId, action: 'cancel_attest' });
      if (payload?.transactionHash) {
        try {
          await actor.storeStoryTx(transactionId, 'cancel_attest', String(payload.transactionHash), initiatorPrincipal);
        } catch (persistErr) {
          console.warn('Failed to persist Story cancel attestation:', persistErr);
        }
      }
    } catch (e) {
      console.warn('Story cancel attestation failed (non-blocking):', e);
    }

    // Non-blocking: submit digital evidence and persist returned hash
    (async () => {
      try {
        const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
        const escrowEvent = {
          type: 'escrow_cancelled',
          escrowId: transactionId,
          cancelledBy: initiatorPrincipal.toText(),
          timestamp: new Date().toISOString()
        };
        const submission = await submitEvidence({
          escrowEvent,
          documentId: String(transactionId),
          tags: { source: 'splitsafe', stage: process.env.NODE_ENV || 'development' }
        });
        if (submission?.hash) {
          try {
            const actorPersist = await createSplitDappActor();
            await actorPersist.storeConstellationHash(
              String(transactionId),
              'escrow_cancelled',
              submission.hash,
              initiatorPrincipal
            );
          } catch (persistErr) {
            console.warn('Failed to persist digital evidence hash (cancel):', persistErr);
          }
        }
      } catch (e) {
        console.warn('Digital evidence submission failed (cancel, non-blocking):', e);
      }
    })();

    return true;
  } catch {
    return false;
  }
}


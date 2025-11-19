import { ToEntry } from '@/declarations/split_dapp/split_dapp.did';
import {
  EscrowEmailData,
  RecipientEmailData,
  escrowReleaseService
} from '@/lib/integrations/resend';
import { Principal } from '@dfinity/principal';
import { attestStoryAction } from '../../api';
import { createSplitDappActor } from '../splitDapp';

/**
 * Release an escrow transaction (calls releaseBasicEscrow on canister)
 */
export async function releaseEscrow(
  caller: Principal,
  transactionId: string
): Promise<void> {
  try {
    const actor = await createSplitDappActor();
    
    const transactionResponse = await actor.releaseBasicEscrow(caller, transactionId);
    
    const transaction = Array.isArray(transactionResponse) && transactionResponse.length > 0 
      ? transactionResponse[0] 
      : null;
    
    
    if (!transaction) {
      return; // Exit early if no transaction returned
    }
    
    const basicData = transaction.basicData?.[0]; // Handle optional array
    if (basicData?.to) {
      try {
        const recipientEmailData: RecipientEmailData[] = basicData.to
          .filter((recipient: ToEntry) => recipient.status && typeof recipient.status === 'object' && recipient.status !== null && 'approved' in recipient.status) // Only approved recipients
          .map((recipient: ToEntry) => ({
            email: 'test@example.com', // This will be handled by the email service
            name: recipient.name || `User ${recipient.principal.toText().slice(0, 8)}`,
            amount: (Number(recipient.funds_allocated) / 1e8).toFixed(8),
            percentage: ((Number(recipient.funds_allocated) / Number(transaction.funds_allocated || 0)) * 100).toFixed(2)
          }));

        const escrowReleaseData: EscrowEmailData = {
          escrowId: transactionId,
          title: transaction.title || 'Unknown Escrow',
          createdBy: caller.toText(),
          createdAt: new Date(Number(transaction.createdAt) / 1_000_000).toISOString(), // Convert nanoseconds to milliseconds
          amount: BigInt(transaction.funds_allocated),
          coin: 'ckBTC', // Default to ckBTC
          recipientCount: recipientEmailData.length,
          recipients: recipientEmailData
        };

        escrowReleaseService.sendEscrowReleaseEmails(escrowReleaseData)
          
      } catch {
        // Email sending failed, but escrow release succeeded
      }
    }

    // Non-blocking: attempt Story attestation and persist tx if available
    try {
      const payload = await attestStoryAction({ escrowId: transactionId, action: 'release_attest' });
      if (payload?.transactionHash) {
        try {
          await actor.storeStoryTx(transactionId, 'release_attest', String(payload.transactionHash), caller);
        } catch (persistErr) {
          console.warn('Failed to persist Story release attestation:', persistErr);
        }
      }
    } catch (e) {
      console.warn('Story release attestation failed (non-blocking):', e);
    }

    // Non-blocking: submit digital evidence and persist returned hash
    (async () => {
      try {
        const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
        const escrowEvent = {
          type: 'escrow_released',
          escrowId: transactionId,
          releasedBy: caller.toText(),
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
              'escrow_released',
              submission.hash,
              caller
            );
          } catch (persistErr) {
            console.warn('Failed to persist digital evidence hash (release):', persistErr);
          }
        }
      } catch (e) {
        console.warn('Digital evidence submission failed (release, non-blocking):', e);
      }
    })();
  } catch (error) {
    throw error;
  }
}


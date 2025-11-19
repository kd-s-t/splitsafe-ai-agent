import { sendContractSignedNotification } from '@/lib/integrations/pusher/milestone';
import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';
import { getTransaction } from '../transactions';

/**
 * Upload signed contract for a milestone recipient
 */
export async function recipientSignContract(
  transactionId: string,
  milestoneId: string,
  recipientId: string,
  caller: Principal,
  signedContractFile: string
): Promise<{ err: string } | { ok: null }> {
  try {
    const actor = await createSplitDappActor();
    
    const result = await actor.recipientSignContract(transactionId, milestoneId, recipientId, caller, signedContractFile) as { err: string } | { ok: null };
    
    if ('ok' in result) {
      // Non-blocking: submit digital evidence and persist returned hash
      (async () => {
        try {
          const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
          const escrowEvent = {
            type: 'milestone_contract_signed',
            escrowId: transactionId,
            milestoneId: milestoneId,
            recipientId: recipientId,
            signedBy: caller.toText(),
            timestamp: new Date().toISOString()
          };
          const submission = await submitEvidence({
            escrowEvent,
            documentId: String(transactionId),
            tags: { source: 'splitsafe', stage: process.env.NODE_ENV || 'development', type: 'milestone' }
          });
          if (submission?.hash) {
            try {
              const actorPersist = await createSplitDappActor();
              await actorPersist.storeConstellationHash(
                String(transactionId),
                'milestone_contract_signed',
                submission.hash,
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash (milestone contract signed):', persistErr);
            }
          }
        } catch (e) {
          console.warn('Digital evidence submission failed (milestone contract signed, non-blocking):', e);
        }
      })();
      
      try {
        const transaction = await getTransaction(caller, transactionId);
        if (transaction && transaction.from) {
          const creatorPrincipal = typeof transaction.from === 'string' ? transaction.from : String(transaction.from);
          
          await sendContractSignedNotification(creatorPrincipal, {
            id: transactionId,
            milestoneId,
            transactionId,
            title: transaction.title || 'Milestone Escrow',
            from: recipientId,
            amount: '0',
            recipientName: recipientId
          });
        }
      } catch (error) {
        console.warn('Failed to send contract signing notification:', error);
      }
    }
    
    return result as { err: string } | { ok: null };
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}


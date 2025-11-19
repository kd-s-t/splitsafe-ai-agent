import { sendContractApprovedNotification } from '@/lib/integrations/pusher/milestone';
import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';

export async function clientApprovedSignedContract(
  transactionId: string,
  milestoneId: string,
  recipientId: string,
  caller: Principal
): Promise<{ err: string } | { ok: null }> {
  try {
    const actor = await createSplitDappActor();
    const result = await actor.clientApprovedSignedContract(transactionId, milestoneId, recipientId, caller) as { err: string } | { ok: null };
    
    if ('ok' in result) {
      // Non-blocking: submit digital evidence and persist returned hash
      (async () => {
        try {
          const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
          const escrowEvent = {
            type: 'milestone_contract_approved',
            escrowId: transactionId,
            milestoneId: milestoneId,
            recipientId: recipientId,
            approvedBy: caller.toText(),
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
                'milestone_contract_approved',
                submission.hash,
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash (milestone contract approved):', persistErr);
            }
          }
        } catch (e) {
          console.warn('Digital evidence submission failed (milestone contract approved, non-blocking):', e);
        }
      })();
      
      try {
        await sendContractApprovedNotification(recipientId, {
          id: transactionId,
          milestoneId,
          transactionId,
          title: 'Milestone Escrow',
          from: caller.toString(),
          amount: '0',
          recipientName: recipientId
        });
      } catch {
      }
    }
    
    return result as { err: string } | { ok: null };
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}


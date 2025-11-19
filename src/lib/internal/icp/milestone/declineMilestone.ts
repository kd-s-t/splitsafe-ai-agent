import { sendMilestoneDeclinedNotification } from '@/lib/integrations/pusher/milestone';
import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';

/**
 * Decline a milestone
 */
export async function declineMilestone(
  milestoneId: string,
  recipientId: string,
  caller: Principal,
  transactionId: string
): Promise<{ err: string } | { ok: null }> {
  try {
    const actor = await createSplitDappActor();
    
    const result = await actor.declineMilestone(milestoneId, recipientId, caller) as { err: string } | { ok: null };
    
    if ('ok' in result) {
      // Non-blocking: submit digital evidence and persist returned hash
      (async () => {
        try {
          const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
          const escrowEvent = {
            type: 'milestone_declined',
            escrowId: transactionId,
            milestoneId: milestoneId,
            declinedBy: caller.toText(),
            recipientId: recipientId,
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
                'milestone_declined',
                submission.hash,
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash (milestone decline):', persistErr);
            }
          }
        } catch (e) {
          console.warn('Digital evidence submission failed (milestone decline, non-blocking):', e);
        }
      })();
      
      try {
        await sendMilestoneDeclinedNotification(caller.toString(), {
          id: milestoneId,
          milestoneId,
          transactionId: milestoneId,
          title: 'Milestone Escrow',
          from: recipientId,
          amount: '0',
          recipientName: recipientId
        });
      } catch (error) {
        console.warn('Failed to send milestone decline notification:', error);
      }
    }
    
    return result as { err: string } | { ok: null };
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}


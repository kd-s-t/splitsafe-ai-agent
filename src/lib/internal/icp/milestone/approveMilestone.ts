import { sendMilestoneApprovedNotification } from '@/lib/integrations/pusher/milestone';
import { Principal } from '@dfinity/principal';
import { storyNetworkClient } from '@story';
import { createSplitDappActor } from '../splitDapp';

/**
 * Approve a milestone
 */
export async function approveMilestone(
  milestoneId: string,
  recipientId: string,
  caller: Principal,
  transactionId: string
): Promise<{ err: string } | { ok: null }> {
  try {
    const actor = await createSplitDappActor();
    
    const result = await actor.approveMilestone(milestoneId, recipientId, caller) as { err: string } | { ok: null };
    
    if ('ok' in result) {
      // Produce a real Story tx and persist to canister
      try {
        const storyRes = await storyNetworkClient.createCreativeWorkIP({
          escrowId: transactionId,
          workId: `attest-${Date.now()}`,
          workType: 'documentation',
          workHash: `${transactionId}:approve_attest`,
          creator: caller.toText(),
          license: 'non-exclusive',
          description: 'Milestone approval attestation',
          createdAt: Date.now()
        });
        if (storyRes.success && storyRes.transactionHash) {
          try {
            await actor.storeStoryTx(transactionId, 'approve_attest', String(storyRes.transactionHash), caller);
          } catch (persistErr) {
            console.warn('Failed to persist Story tx (approve):', persistErr);
          }
        }
      } catch (e) {
        console.warn('Story approve attestation failed (non-blocking):', e);
      }

      // Non-blocking: submit digital evidence and persist returned hash
      (async () => {
        try {
          const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
          const escrowEvent = {
            type: 'milestone_approved',
            escrowId: transactionId,
            milestoneId: milestoneId,
            approvedBy: caller.toText(),
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
                'milestone_approved',
                submission.hash,
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash (milestone approve):', persistErr);
            }
          }
        } catch (e) {
          console.warn('Digital evidence submission failed (milestone approve, non-blocking):', e);
        }
      })();
      
      try {
        await sendMilestoneApprovedNotification(caller.toString(), {
          id: milestoneId,
          milestoneId,
          transactionId: milestoneId, // This should be the actual transaction ID
          title: 'Milestone Escrow', // This should be fetched from milestone data
          from: recipientId,
          amount: '0', // This should be fetched from milestone data
          recipientName: recipientId
        });
      } catch (error) {
        console.warn('Failed to send milestone approval notification:', error);
      }
    }
    
    return result as { err: string } | { ok: null };
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}


import { Principal } from '@dfinity/principal';
import { storyNetworkClient } from '@story';
import { createSplitDappActor } from '../splitDapp';

/**
 * Complete a milestone
 */
export async function completeMilestone(
  milestoneId: string,
  caller: Principal,
  transactionId: string
): Promise<{ err: string } | { ok: null }> {
  try {
    const actor = await createSplitDappActor();
    
    const result = await actor.completeMilestone(milestoneId, caller) as { err: string } | { ok: null };
    
    if ('ok' in result) {
      // Real Story tx and persist
      try {
        const storyRes = await storyNetworkClient.createCreativeWorkIP({
          escrowId: transactionId,
          workId: `attest-${Date.now()}`,
          workType: 'documentation',
          workHash: `${transactionId}:complete_attest`,
          creator: caller.toText(),
          license: 'non-exclusive',
          description: 'Milestone complete attestation',
          createdAt: Date.now()
        });
        if (storyRes.success && storyRes.transactionHash) {
          try {
            await actor.storeStoryTx(transactionId, 'complete_attest', String(storyRes.transactionHash), caller);
          } catch (persistErr) {
            console.warn('Failed to persist Story tx (complete):', persistErr);
          }
        }
      } catch (e) {
        console.warn('Story complete attestation failed (non-blocking):', e);
      }

      // Non-blocking: submit digital evidence and persist returned hash
      (async () => {
        try {
          const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
          const escrowEvent = {
            type: 'milestone_completed',
            escrowId: transactionId,
            milestoneId: milestoneId,
            completedBy: caller.toText(),
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
                'milestone_completed',
                submission.hash,
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash (milestone complete):', persistErr);
            }
          }
        } catch (e) {
          console.warn('Digital evidence submission failed (milestone complete, non-blocking):', e);
        }
      })();
    }
    
    return result;
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}


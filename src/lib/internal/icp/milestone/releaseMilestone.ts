import { Principal } from '@dfinity/principal';
import { storyNetworkClient } from '@story';
import { createSplitDappActor } from '../splitDapp';

/**
 * Release a milestone
 */
export async function releaseMilestone(
  milestoneId: string,
  caller: Principal,
  transactionId: string
): Promise<{ err: string } | { ok: null }> {
  try {
    const actor = await createSplitDappActor();
    
    const result = await actor.releaseMilestone(milestoneId, caller) as { err: string } | { ok: null };
    
    if ('ok' in result) {
      // Produce a real Story tx and persist to canister
      try {
        const storyRes = await storyNetworkClient.createCreativeWorkIP({
          escrowId: transactionId,
          workId: `attest-${Date.now()}`,
          workType: 'documentation',
          workHash: `${transactionId}:release_attest`,
          creator: caller.toText(),
          license: 'non-exclusive',
          description: 'Milestone release attestation',
          createdAt: Date.now()
        });
        if (storyRes.success && storyRes.transactionHash) {
          try {
            await actor.storeStoryTx(transactionId, 'release_attest', String(storyRes.transactionHash), caller);
          } catch (persistErr) {
            console.warn('Failed to persist Story tx (release):', persistErr);
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
            type: 'milestone_released',
            escrowId: transactionId,
            milestoneId: milestoneId,
            releasedBy: caller.toText(),
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
                'milestone_released',
                submission.hash,
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash (milestone release):', persistErr);
            }
          }
        } catch (e) {
          console.warn('Digital evidence submission failed (milestone release, non-blocking):', e);
        }
      })();
    }
    
    return result;
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}


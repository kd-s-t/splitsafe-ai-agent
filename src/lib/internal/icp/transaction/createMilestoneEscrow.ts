import { Principal } from '@dfinity/principal';
import { setupStoryEscrow } from '../../api';
import { createSplitDappActor } from '../splitDapp';
import { CreateTransactionResult } from '../types';

/**
 * Helper function to create a milestone escrow transaction
 * Uses the proper milestone creation function instead of the broken createTransaction
 */
export async function createMilestoneEscrow(
  caller: Principal,
  request: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<CreateTransactionResult> {
  try {
    const actor = await createSplitDappActor();
    
    const result = await actor.initiateMultipleMilestones(
      caller,
      request
    ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    if ('ok' in result) {
      try {
        if (result.ok.milestone) {
          const milestoneData = {
            transactionId: result.ok.transactionId,
            milestoneId: result.ok.milestone.id,
            title: result.ok.milestone.title,
            allocation: result.ok.milestone.allocation,
            recipients: result.ok.milestone.recipients.map((r: { principal: string; share: number; name: string }) => ({
              principal: r.principal,
              share: r.share,
              name: r.name
            })),
            creator: caller.toText(),
            startDate: result.ok.milestone.startDate,
            endDate: result.ok.milestone.endDate,
            frequency: result.ok.milestone.frequency,
            duration: result.ok.milestone.duration,
            timestamp: Date.now()
          };

          // Register escrow as a Story IP asset (via server API) and persist ids in canister
          (async () => {
            try {
              const totalAmount = String(milestoneData.allocation ?? '0');
              const payload = await setupStoryEscrow({
                escrowId: String(milestoneData.transactionId),
                title: milestoneData.title,
                description: milestoneData.title,
                creator: milestoneData.creator,
                participants: milestoneData.recipients,
                totalAmount,
                createdAt: milestoneData.timestamp
              });
              if (payload?.success && payload?.ipAssetId && payload?.transactionHash) {
                try {
                  const actor = await createSplitDappActor();
                  await actor.storeStoryRegistration(
                    String(milestoneData.transactionId),
                    String(payload.ipAssetId),
                    String(payload.transactionHash),
                    caller
                  );
                  console.log('✅ Story registration stored for milestone escrow:', milestoneData.transactionId);
                } catch (persistErr) {
                  console.error('❌ Failed to persist Story registration for milestone escrow:', persistErr);
                }
              } else {
                console.warn('⚠️ Story setup API failed for milestone escrow:', payload?.error || 'Missing success/ipAssetId/transactionHash', payload);
              }
            } catch (e) {
              console.warn('Story IP registration (milestone) failed (non-blocking):', e);
            }
          })();

          // Non-blocking: submit digital evidence fingerprint via server route
          (async () => {
            try {
              const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
              const escrowEvent = {
                type: 'milestone_escrow_created',
                escrowId: String(milestoneData.transactionId),
                milestoneId: String(milestoneData.milestoneId),
                title: milestoneData.title,
                creator: milestoneData.creator,
                recipients: milestoneData.recipients.map(r => ({
                  principal: r.principal,
                  share: r.share,
                  name: r.name
                })),
                allocation: String(milestoneData.allocation ?? '0'),
                startDate: milestoneData.startDate,
                endDate: milestoneData.endDate,
                frequency: milestoneData.frequency,
                duration: milestoneData.duration,
                timestamp: new Date(milestoneData.timestamp).toISOString()
              };

              const submission = await submitEvidence({
                escrowEvent,
                documentId: String(milestoneData.transactionId),
                tags: { source: 'splitsafe', stage: process.env.NODE_ENV || 'development', type: 'milestone' }
              });

              // If backend returned a hash, persist it in the canister
              if (submission?.hash) {
                console.log('[Milestone Creation] Storing Constellation hash:', {
                  hash: submission.hash,
                  hashLength: submission.hash.length,
                  documentRef: submission.documentRef
                });
                try {
                  const actor = await createSplitDappActor();
                  await actor.storeConstellationHash(
                    String(milestoneData.transactionId),
                    'milestone_escrow_created',
                    submission.hash,
                    caller
                  );
                  console.log('[Milestone Creation] ✅ Constellation hash stored successfully:', submission.hash.substring(0, 16) + '...');
                } catch (persistErr) {
                  console.warn('Failed to persist digital evidence hash in canister (milestone):', persistErr);
                }
              } else {
                console.warn('[Milestone Creation] ⚠️ No hash returned from Constellation API. Response:', submission);
              }
            } catch (e) {
              const errorMessage = e instanceof Error ? e.message : String(e);
              if (errorMessage.includes('Backend server not available') || 
                  errorMessage.includes('ConnectionRefusedError')) {
                console.warn('⚠️ Digital evidence submission unavailable (milestone, non-blocking):', errorMessage);
              } else {
                console.warn('Digital evidence submission failed (milestone, non-blocking):', e);
              }
            }
          })();
        }
      } catch (error) {
        console.warn('Constellation integration failed:', error);
      }

      return {
        ok: {
          transactionId: result.ok.transactionId
        }
      };
    } else {
      return {
        err: result.err
      };
    }
  } catch (error) {
    return {
      err: error instanceof Error ? error.message : String(error)
    };
  }
}


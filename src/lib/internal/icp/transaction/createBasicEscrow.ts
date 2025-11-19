import { Principal } from '@dfinity/principal';
import { setupStoryEscrow } from '../../api';
import { createSplitDappActor } from '../splitDapp';
import type { ParticipantShare } from '../types';
import { CreateTransactionResult } from '../types';

/**
 * Helper function to create a basic escrow transaction
 */
export async function createBasicEscrow(
  caller: Principal,
  title: string,
  participants: ParticipantShare[],
  useSeiAcceleration: boolean = false
): Promise<CreateTransactionResult> {
  const { createTransaction } = await import('./createTransaction');
  
  const result = await createTransaction(caller, { 'basic_escrow': null }, {
    basic_escrow: {
      title,
      participants,
      useSeiAcceleration
    }
  });

  if ('ok' in result && result.ok?.transactionId) {
    try {
      const escrowData = {
        escrowId: result.ok.transactionId,
        title,
        participants: participants.map(p => ({
          principal: p.principal.toText(),
          amount: p.amount.toString(),
          percentage: p.percentage,
          nickname: p.nickname
        })),
        creator: caller.toText(),
        useSeiAcceleration,
        timestamp: Date.now()
      };

      // Register escrow as a Story IP asset (via server API) and persist ids in canister
      (async () => {
        try {
          console.log('🎨 [Story Protocol] Starting registration for escrow:', escrowData.escrowId);
          const totalAmount = participants
            .reduce((acc, p) => acc + BigInt(p.amount.toString()), BigInt(0))
            .toString();

          const payload = await setupStoryEscrow({
            escrowId: String(escrowData.escrowId),
            title: escrowData.title,
            description: escrowData.title,
            creator: escrowData.creator,
            participants: escrowData.participants,
            totalAmount,
            createdAt: escrowData.timestamp
          });
          
          console.log('🎨 [Story Protocol] API response:', { 
            success: payload?.success, 
            hasIpAssetId: !!payload?.ipAssetId, 
            hasTxHash: !!payload?.transactionHash,
            error: payload?.error 
          });
          
          if (payload?.success && payload?.ipAssetId && payload?.transactionHash) {
            try {
              console.log('🎨 [Story Protocol] Storing registration in canister...', {
                escrowId: escrowData.escrowId,
                ipAssetId: payload.ipAssetId,
                txHash: payload.transactionHash,
                creator: escrowData.creator
              });
              
              const actor = await createSplitDappActor();
              const result = await actor.storeStoryRegistration(
                String(escrowData.escrowId),
                String(payload.ipAssetId),
                String(payload.transactionHash),
                Principal.fromText(escrowData.creator)
              ) as { ok?: string; err?: string };
              
              console.log('🎨 [Story Protocol] Canister storeStoryRegistration response:', result);
              
              if (result && 'ok' in result && result.ok) {
                console.log('✅ [Story Protocol] Registration stored successfully in canister for escrow:', escrowData.escrowId, {
                  ipAssetId: payload.ipAssetId,
                  txHash: payload.transactionHash,
                  canisterMessage: result.ok
                });
              } else if (result && 'err' in result && result.err) {
                console.error('❌ [Story Protocol] Canister returned error:', result.err);
              } else {
                console.warn('⚠️ [Story Protocol] Unexpected response format from canister:', result);
              }
            } catch (persistErr) {
              console.error('❌ [Story Protocol] Exception during canister persist:', persistErr);
              if (persistErr instanceof Error) {
                console.error('❌ [Story Protocol] Error details:', {
                  message: persistErr.message,
                  stack: persistErr.stack,
                  name: persistErr.name
                });
              }
            }
          } else {
            console.warn('⚠️ [Story Protocol] Setup API failed or returned invalid response:', {
              error: payload?.error || 'Missing success/ipAssetId/transactionHash',
              payload: payload
            });
          }
        } catch (e) {
          console.error('❌ [Story Protocol] Registration failed (non-blocking):', e);
          if (e instanceof Error) {
            console.error('❌ [Story Protocol] Error details:', {
              message: e.message,
              stack: e.stack
            });
          }
        }
      })();

      // Non-blocking: submit digital evidence fingerprint via server route (server reads org/tenant from env)
      (async () => {
        try {
          const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
          const documentId = String(result.ok!.transactionId);
          const escrowEvent = {
            type: 'escrow_created',
            escrowId: documentId,
            title,
            creator: caller.toText(),
            participants: participants.map(p => ({
              principal: p.principal.toText(),
              amount: p.amount.toString(),
              percentage: p.percentage,
              nickname: p.nickname
            })),
            useSeiAcceleration,
            timestamp: new Date().toISOString()
          };

          const submission = await submitEvidence({
            escrowEvent,
            documentId,
            tags: { source: 'splitsafe', stage: process.env.NODE_ENV || 'development' }
          });

          // If backend returned a hash, persist it in the canister
          // IMPORTANT: Store the fingerprint hash (hash of FingerprintValue), NOT documentRef
          if (submission?.hash) {
            console.log('[Escrow Creation] Storing Constellation hash:', {
              hash: submission.hash,
              hashLength: submission.hash.length,
              documentRef: submission.documentRef,
              documentRefLength: submission.documentRef?.length,
              isHashCorrect: submission.hash.length === 64 // Fingerprint hash should be 64 hex chars
            });
            try {
              const actor = await createSplitDappActor();
              await actor.storeConstellationHash(
                result.ok!.transactionId,
                'escrow_created',
                submission.hash, // This should be the fingerprint hash, not documentRef
                caller
              );
              console.log('[Escrow Creation] ✅ Constellation hash stored successfully:', submission.hash.substring(0, 16) + '...');
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash in canister:', persistErr);
            }
          } else {
            console.warn('[Escrow Creation] ⚠️ No hash returned from Constellation API. Response:', submission);
          }
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          if (errorMessage.includes('Backend server not available') || 
              errorMessage.includes('ConnectionRefusedError')) {
            console.warn('⚠️ Digital evidence submission unavailable (non-blocking):', errorMessage);
          } else {
            console.warn('Digital evidence submission failed (non-blocking):', e);
          }
        }
      })();
    } catch (error) {
      console.warn('Constellation integration failed:', error);
    }
  }

  return result;
}


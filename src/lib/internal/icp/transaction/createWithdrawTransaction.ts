import { Principal } from '@dfinity/principal';
import { setupStoryEscrow } from '../../api';
import { createSplitDappActor } from '../splitDapp';
import { CreateTransactionResult, CreateWithdrawRequest } from '../types';

/**
 * Helper function to create a withdrawal transaction
 */
export async function createWithdrawTransaction(
  caller: Principal,
  withdrawData: CreateWithdrawRequest['withdrawData']
): Promise<CreateTransactionResult> {
  const { createTransaction } = await import('./createTransaction');
  
  const result = await createTransaction(caller, { 'withdraw': null }, {
    withdraw: { withdrawData }
  });

  if ('ok' in result && result.ok?.transactionId) {
    try {
      const transactionId = result.ok!.transactionId;
      
      // Register a minimal Story IP asset for the withdrawal (for provenance)
      (async () => {
        try {
          const totalAmount = (() => {
            try {
              if (withdrawData?.icp?.amount) return String(withdrawData.icp.amount);
              if (withdrawData?.btc?.amount) return String(withdrawData.btc.amount);
            } catch {}
            return '0';
          })();

          const payload = await setupStoryEscrow({
            escrowId: String(transactionId),
            title: 'Withdrawal',
            description: 'Withdrawal transaction',
            creator: caller.toText(),
            participants: [],
            totalAmount,
            createdAt: Date.now()
          });
          if (payload?.ipAssetId && payload?.transactionHash) {
            try {
              const actor = await createSplitDappActor();
              await actor.storeStoryRegistration(
                String(transactionId),
                String(payload.ipAssetId),
                String(payload.transactionHash),
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist Story registration for withdrawal:', persistErr);
            }
          } else if (payload?.error) {
            console.warn('Story setup API failed for withdrawal:', payload.error);
          }
        } catch (e) {
          console.warn('Story IP registration (withdraw) failed (non-blocking):', e);
        }
      })();
    } catch (error) {
      console.warn('Constellation integration failed:', error);
    }
  }

  return result;
}


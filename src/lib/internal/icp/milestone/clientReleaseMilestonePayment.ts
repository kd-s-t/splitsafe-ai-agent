import { sendMilestonePaymentReleasedNotification } from '@/lib/integrations/pusher/milestone';
import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';

export async function clientReleaseMilestonePayment(
  transactionId: string,
  monthNumber: number,
  caller: Principal
): Promise<{ err: string } | { ok: null }> {
  try {
    const actor = await createSplitDappActor();
    const result = await actor.clientReleaseMilestonePayment(transactionId, BigInt(monthNumber), caller) as { err: string } | { ok: null };
    
    if ('ok' in result) {
      // Non-blocking: submit digital evidence and persist returned hash
      (async () => {
        try {
          const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
          const escrowEvent = {
            type: 'milestone_payment_released',
            escrowId: transactionId,
            transactionId: transactionId,
            monthNumber: monthNumber,
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
                'milestone_payment_released',
                submission.hash,
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash (milestone payment released):', persistErr);
            }
          }
        } catch (e) {
          console.warn('Digital evidence submission failed (milestone payment released, non-blocking):', e);
        }
      })();
      
      try {
        await sendMilestonePaymentReleasedNotification('recipient-placeholder', {
          id: transactionId,
          milestoneId: transactionId,
          transactionId,
          title: 'Milestone Escrow',
          from: caller.toString(),
          amount: '0',
          monthNumber
        });
      } catch (error) {
        console.warn('Failed to send milestone release notification:', error);
      }
    }
    
    return result as { err: string } | { ok: null };
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}


import { sendProofOfWorkSubmittedNotification } from '@/lib/integrations/pusher/milestone';
import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';
import { getTransaction } from '../transactions';

export async function submitProofOfWork(
  milestoneId: string,
  recipientId: string,
  caller: Principal,
  monthNumber: number,
  description: string,
  screenshots: string[],
  files: string[]
): Promise<{ err: string } | { ok: null }> {
  console.log({
    milestoneId,
    recipientId,
    caller: caller.toString(),
    monthNumber,
    description,
    screenshotsCount: screenshots.length,
    filesCount: files.length,
    screenshotsLengths: screenshots.map(s => s.length),
    filesLengths: files.map(f => f.length)
  });

  try {
    const actor = await createSplitDappActor();
    
    const result = await actor.submitProofOfWork(milestoneId, recipientId, caller, monthNumber, description, screenshots, files) as { err: string } | { ok: null };
    
    
    if ('ok' in result) {
      // Fetch transaction to get transactionId and creator
      let transactionId = milestoneId; // Default fallback
      try {
        const transaction = await getTransaction(caller, milestoneId);
        if (transaction) {
          transactionId = transaction.id;
        }
      } catch (error) {
        console.warn('Failed to fetch transaction for proof of work:', error);
      }

      // Non-blocking: submit digital evidence and persist returned hash
      (async () => {
        try {
          const { submitEvidence } = await import('@/lib/internal/api/constellation-network');
          const escrowEvent = {
            type: 'milestone_proof_of_work_submitted',
            escrowId: transactionId,
            milestoneId: milestoneId,
            recipientId: recipientId,
            submittedBy: caller.toText(),
            monthNumber: monthNumber,
            description: description,
            screenshotsCount: screenshots.length,
            filesCount: files.length,
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
                'milestone_proof_of_work_submitted',
                submission.hash,
                caller
              );
            } catch (persistErr) {
              console.warn('Failed to persist digital evidence hash (milestone proof of work):', persistErr);
            }
          }
        } catch (e) {
          console.warn('Digital evidence submission failed (milestone proof of work, non-blocking):', e);
        }
      })();
      
      try {
        const transaction = await getTransaction(caller, milestoneId); // Fetch transaction to get creator
        
        if (transaction && transaction.from) {
          const creatorPrincipal = typeof transaction.from === 'string' ? transaction.from : String(transaction.from);
          console.log({
            id: transaction.id,
            milestoneId,
            transactionId: transaction.id,
            title: transaction.title || 'Milestone Escrow',
            from: recipientId,
            amount: '0',
            recipientName: recipientId,
            monthNumber: monthNumber
          });
          
          await sendProofOfWorkSubmittedNotification(creatorPrincipal, {
            id: transaction.id,
            milestoneId,
            transactionId: transaction.id,
            title: transaction.title || 'Milestone Escrow',
            from: recipientId,
            amount: '0',
            recipientName: recipientId,
            monthNumber: monthNumber
          });
        } else {
          console.log('Transaction or from field not found');
        }
      } catch (error) {
        console.error('Error sending proof of work notification:', error);
      }
    }
    
    return result as { err: string } | { ok: null };
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}


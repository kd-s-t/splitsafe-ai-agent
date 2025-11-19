import { Transaction } from '@/declarations/split_dapp/split_dapp.did';
import { escrowNotificationService } from '@/lib/integrations/resend';
import { Principal } from '@dfinity/principal';
import { attestStoryAction } from '../../api';
import { createSplitDappActor } from '../splitDapp';

/**
 * Approve an escrow transaction as a recipient
 */
export async function approveEscrow(
  senderPrincipal: Principal,
  transactionId: string,
  recipientPrincipal: Principal
): Promise<boolean> {
  try {
    const actor = await createSplitDappActor();
    
    console.log({
      senderPrincipal: senderPrincipal.toText(),
      senderPrincipalType: typeof senderPrincipal,
      transactionId,
      transactionIdType: typeof transactionId,
      recipientPrincipal: recipientPrincipal.toText(),
      recipientPrincipalType: typeof recipientPrincipal,
      actor: !!actor
    });
    
    await actor.recipientApproveEscrow(
      senderPrincipal,
      transactionId,
      recipientPrincipal
    );
    
    try {
      const transaction = await actor.getTransaction(senderPrincipal, transactionId) as Transaction;
      
      const basicData = transaction?.basicData?.[0]; // Handle optional array
      console.log({
        transactionId,
        hasTransaction: !!transaction,
        hasBasicData: !!basicData,
        hasToArray: !!basicData?.to,
        toArrayLength: basicData?.to?.length || 0,
        recipientPrincipal: recipientPrincipal.toText(),
        senderPrincipal: senderPrincipal.toText()
      });
      
      let recipientAmount = BigInt(0);
      
      if (basicData?.to) {
        const recipient = basicData.to.find((r: { 
          principal: string | { toText: () => string };
          funds_allocated?: bigint | number;
        }) => {
          const rPrincipal = typeof r.principal === 'string' 
            ? r.principal 
            : r.principal?.toText?.() || String(r.principal);
          const recipientPrincipalText = recipientPrincipal.toText();
          
          console.log({
            rPrincipal,
            recipientPrincipalText,
            match: rPrincipal === recipientPrincipalText,
            funds_allocated: r.funds_allocated
          });
          
          return rPrincipal === recipientPrincipalText;
        });
        
        if (recipient) {
          recipientAmount = recipient.funds_allocated || BigInt(0);
          console.log({
            recipientAmount: recipientAmount.toString(),
            amountInBTC: (Number(recipientAmount) / 1e8).toFixed(8)
          });
        } else {
          console.log('Recipient not found in transaction');
        }
      } else {
        console.log('No basicData.to array found');
      }
      
      await escrowNotificationService.sendEscrowApprovalEmail({
        escrowId: transactionId,
        title: transaction?.title || 'Unknown Escrow',
        approvedBy: recipientPrincipal.toText(),
        approvedAt: new Date().toISOString(),
        amount: recipientAmount,
        coin: 'BTC'
      });
    } catch {
      // Email sending failed, but escrow approval succeeded
    }
    
    // Non-blocking: record Story approve attestation
    try {
      const payload = await attestStoryAction({ escrowId: transactionId, action: 'approve_attest' });
      if (payload?.transactionHash) {
        try {
          await actor.storeStoryTx(transactionId, 'approve_attest', String(payload.transactionHash), recipientPrincipal);
        } catch (persistErr) {
          console.warn('Failed to persist Story approve attestation:', persistErr);
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
          type: 'escrow_approved',
          escrowId: transactionId,
          approvedBy: recipientPrincipal.toText(),
          sender: senderPrincipal.toText(),
          timestamp: new Date().toISOString()
        };
        const submission = await submitEvidence({
          escrowEvent,
          documentId: String(transactionId),
          tags: { source: 'splitsafe', stage: process.env.NODE_ENV || 'development' }
        });
        if (submission?.hash) {
          try {
            const actorPersist = await createSplitDappActor();
            await actorPersist.storeConstellationHash(
              String(transactionId),
              'escrow_approved',
              submission.hash,
              recipientPrincipal
            );
          } catch (persistErr) {
            console.warn('Failed to persist digital evidence hash (approve):', persistErr);
          }
        }
      } catch (e) {
        console.warn('Digital evidence submission failed (approve, non-blocking):', e);
      }
    })();

    return true;
  } catch {
    return false;
  }
}


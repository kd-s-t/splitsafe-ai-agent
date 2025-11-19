import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp';
import { getEscrowDetails } from './getEscrowDetails';

/**
 * Approve transaction by ID (legacy function)
 */
export async function approveTransactionById(
  transactionId: string,
  callerPrincipal: string
): Promise<boolean> {
  try {
    const transaction = await getEscrowDetails(transactionId, callerPrincipal);
    
    if (!transaction) {
      return false;
    }
    
    const actor = await createAnonymousActorNew();
    const caller = Principal.fromText(callerPrincipal);
    
    const recipientEntry = transaction.to.find((entry: Record<string, unknown>) => {
      const entryPrincipal = typeof entry.principal === 'string' 
        ? entry.principal 
        : (entry.principal as { toText?: () => string })?.toText?.() || String(entry.principal);
      return entryPrincipal === callerPrincipal;
    });
    
    if (!recipientEntry) {
      return false;
    }
    
    const senderPrincipal = typeof transaction.from === 'string' 
      ? transaction.from 
      : (transaction.from as { toText?: () => string })?.toText?.() || String(transaction.from);
    
    await actor.recipientApproveEscrow(
      Principal.fromText(senderPrincipal),
      transactionId,
      caller
    );
    
    return true;
  } catch {
    return false;
  }
}


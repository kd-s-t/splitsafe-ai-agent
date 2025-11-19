import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp';

/**
 * Get escrow details by ID (legacy function)
 */
export async function getEscrowDetails(escrowId: string, callerPrincipal: string) {
  try {
    const actor = await createAnonymousActorNew();
    const caller = Principal.fromText(callerPrincipal);
    
    const result = await actor.getEscrow(escrowId, caller);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const transaction = result[0];
    
    return transaction;
  } catch {
    return null;
  }
}


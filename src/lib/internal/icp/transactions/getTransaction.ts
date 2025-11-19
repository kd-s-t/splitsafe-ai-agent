import { EscrowTransaction } from '@/modules/shared.types';
import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp';
import { serializeBigInts } from './serializeBigInts';

/**
 * Get a specific transaction by ID
 */
export async function getTransaction(
  principal: Principal,
  transactionId: string
): Promise<EscrowTransaction | null> {
  try {
    const actor = await createAnonymousActorNew();
    const result = await actor.getTransaction(principal, transactionId);
    console.log('The transaction:', result);
    if (!result || result === null || result === undefined || (Array.isArray(result) && result.length === 0)) {
      return null;
    }
    
    let transaction: EscrowTransaction;
    if (Array.isArray(result)) {
      if (result.length === 0) {
        return null;
      }
      transaction = result[0] as EscrowTransaction;
    } else {
      transaction = result as EscrowTransaction;
    }

    
    const serializedTransaction = serializeBigInts(transaction) as EscrowTransaction;
    
    // DEBUG: Check if from field was properly serialized
    console.log('🔍 [getTransaction] After serialization:', {
      from: serializedTransaction.from,
      fromType: typeof serializedTransaction.from,
      fromIsPrincipal: serializedTransaction.from && typeof serializedTransaction.from === 'object' && '_isPrincipal' in serializedTransaction.from
    });
    
    // Force convert from field if it's still a Principal object
    if (serializedTransaction.from && typeof serializedTransaction.from === 'object' && '_isPrincipal' in serializedTransaction.from) {
      const principalObj = serializedTransaction.from as any;
      try {
        if ('toText' in principalObj && typeof principalObj.toText === 'function') {
          serializedTransaction.from = principalObj.toText();
        } else if (principalObj._arr && principalObj._isPrincipal) {
          const reconstructed = Principal.fromUint8Array(new Uint8Array(principalObj._arr));
          serializedTransaction.from = reconstructed.toText();
        }
        console.log('✅ [getTransaction] Converted from field to string:', serializedTransaction.from);
      } catch (error) {
        console.error('❌ [getTransaction] Failed to convert from field:', error);
      }
    }
    
    return serializedTransaction;
  } catch {
    return null;
  }
}


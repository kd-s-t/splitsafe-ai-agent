import { Principal } from '@dfinity/principal';
import type { NormalizedTransaction } from '../../shared.types';

/**
 * Truncates a hash string to show first 8 and last 8 characters
 */
export function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

/**
 * Checks if a transaction is pending approval by the current user
 */
export function isPendingApproval(tx: NormalizedTransaction, principal: Principal | null): boolean {
  if (!principal) return false;
  return tx.to.some(
    (toEntry) =>
      String(toEntry.principal) === String(principal) &&
      toEntry.status &&
      Object.keys(toEntry.status)[0] === "pending"
  );
}

/**
 * Checks if the current user has approved a transaction
 */
export function hasUserApproved(tx: NormalizedTransaction, principal: Principal | null): boolean {
  if (!principal) return false;
  return tx.to.some(
    (toEntry) =>
      String(toEntry.principal) === String(principal) &&
      toEntry.status &&
      Object.keys(toEntry.status)[0] === "approved"
  );
}

/**
 * Checks if the current user has declined a transaction
 */
export function hasUserDeclined(tx: NormalizedTransaction, principal: Principal | null): boolean {
  if (!principal) return false;
  return tx.to.some(
    (toEntry) =>
      String(toEntry.principal) === String(principal) &&
      toEntry.status &&
      Object.keys(toEntry.status)[0] === "declined"
  );
}

/**
 * Checks if a transaction was sent by the current user
 */
export function isSentByUser(tx: NormalizedTransaction, principal: Principal | null): boolean {
  if (!principal) return false;
  
  // Get the principal string from the current user
  const principalString = principal?.toText() || '';
  
  // Handle different formats of tx.from
  let fromString: string;
  
  if (typeof tx.from === 'string') {
    fromString = tx.from.trim();
  } else if (tx.from && typeof tx.from === 'object' && 'toText' in tx.from) {
    // Handle Principal object with toText method
    fromString = (tx.from as { toText: () => string }).toText().trim();
  } else if (tx.from && typeof tx.from === 'object') {
    // Try to extract from object properties
    const obj = tx.from as Record<string, unknown>;
    console.log('🔍 Object analysis:', {
      hasArr: !!obj._arr,
      hasIsPrincipal: !!obj._isPrincipal,
      objKeys: Object.keys(obj),
      objType: typeof obj,
      objConstructor: obj.constructor?.name,
      objString: String(obj)
    });
    
    if (obj._arr && obj._isPrincipal && Array.isArray(obj._arr)) {
      // This is a Principal object from ICP, try multiple reconstruction methods
      
      try {
        // Method 1: Try fromUint8Array
        const reconstructedPrincipal = Principal.fromUint8Array(new Uint8Array(obj._arr));
        fromString = reconstructedPrincipal.toText().trim();
        console.log('✅ Successfully reconstructed Principal using fromUint8Array:', fromString);
      } catch (error1) {
        console.warn('Failed to reconstruct Principal using fromUint8Array:', error1);
        try {
          // Method 2: Try fromHex if the _arr can be converted to hex
          const hexString = Array.from(obj._arr as number[]).map((b: number) => b.toString(16).padStart(2, '0')).join('');
          const reconstructedPrincipal = Principal.fromHex(hexString);
          fromString = reconstructedPrincipal.toText().trim();
          console.log('✅ Successfully reconstructed Principal using fromHex:', fromString);
        } catch (error2) {
          console.warn('Failed to reconstruct Principal using fromHex:', error2);
          try {
            // Method 3: Try fromText if the _arr can be converted to a string
            const arrAsString = String.fromCharCode(...(obj._arr as number[]));
            const reconstructedPrincipal = Principal.fromText(arrAsString);
            fromString = reconstructedPrincipal.toText().trim();
            console.log('✅ Successfully reconstructed Principal using fromText:', fromString);
          } catch (error3) {
            console.warn('Failed to reconstruct Principal using fromText:', error3);
            try {
              // Method 4: Try toText if available
              if (obj.toText && typeof obj.toText === 'function') {
                fromString = obj.toText().trim();
                console.log('✅ Successfully used existing toText method:', fromString);
              } else {
                // Method 5: Try to use the object directly as a Principal
                fromString = String(tx.from).trim();
                console.log(' Using fallback string conversion:', fromString);
              }
            } catch (error4) {
              console.warn('All Principal reconstruction methods failed:', error4);
              fromString = String(tx.from).trim();
            }
          }
        }
      }
    } else {
      // Try to handle other object types that might be Principal objects
      console.log('🔍 Trying alternative Principal detection methods');
      try {
        // Try to use the object directly as a Principal if it has a toText method
        if (typeof obj.toText === 'function') {
          fromString = obj.toText().trim();
          console.log('✅ Found toText method on object:', fromString);
        } else {
          // Try to convert the object to a Principal using different methods
          const objAsPrincipal = Principal.fromText(String(tx.from));
          fromString = objAsPrincipal.toText().trim();
          console.log('✅ Successfully converted object to Principal:', fromString);
        }
      } catch (error) {
        console.warn('Failed to convert object to Principal:', error);
        fromString = String(tx.from).trim();
      }
    }
  } else {
    fromString = String(tx.from).trim();
  }
  
  // Clean up any potential formatting issues
  const cleanFromString = fromString.replace(/[\[\]{}]/g, '').trim();
  const cleanPrincipalString = principalString.trim();
  
  const isSender = cleanFromString === cleanPrincipalString;
  
  // Use the actual comparison result
  const finalIsSender = isSender;
  
  return finalIsSender;
}

/**
 * Gets the transaction category (sent or received)
 */
export function getTransactionCategory(tx: NormalizedTransaction, principal: Principal | null): "sent" | "received" {
  return isSentByUser(tx, principal) ? "sent" : "received";
}

/**
 * Calculates the total amount for a transaction
 */
export function getTransactionTotalAmount(tx: NormalizedTransaction): number {
  return tx.to && Array.isArray(tx.to)
    ? tx.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;
}

/**
 * Gets the user's share amount from a transaction
 */
export function getUserShareAmount(tx: NormalizedTransaction, principal: Principal | null): number {
  if (!principal) return 0;
  
  const recipientEntry = tx.to.find((entry) =>
    String(entry.principal) === String(principal)
  );
  
  return recipientEntry ? Number(recipientEntry.amount) / 1e8 : 0;
}

/**
 * Gets the user's share percentage from a transaction
 */
export function getUserSharePercentage(tx: NormalizedTransaction, principal: Principal | null): string {
  if (!principal) return 'N/A';
  
  const recipientEntry = tx.to.find((entry) =>
    String(entry.principal) === String(principal)
  );
  
  return recipientEntry && recipientEntry.percentage
    ? `${recipientEntry.percentage}%`
    : 'N/A';
}

/**
 * Formats a timestamp to a readable date string
 */
export function formatTransactionDate(timestamp: string): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

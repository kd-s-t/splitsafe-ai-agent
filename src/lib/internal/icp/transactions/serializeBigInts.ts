import { Principal } from '@dfinity/principal';
import { PrincipalWithInternals } from '../types';

/**
 * Convert BigInt values to strings for Redux serialization
 * Also handles Principal objects properly
 */
export function serializeBigInts(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'object' && obj !== null && 'toText' in obj && typeof obj.toText === 'function') {
    try {
      return obj.toText();
    } catch {
      const principalObj = obj as PrincipalWithInternals;
      if (principalObj._arr && principalObj._isPrincipal) {
        try {
          const reconstructedPrincipal = Principal.fromUint8Array(new Uint8Array(principalObj._arr));
          return reconstructedPrincipal.toText();
        } catch {
          return String(obj);
        }
      }
      return String(obj);
    }
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }
  
  if (typeof obj === 'object') {
    const serialized: Record<string, unknown> = {};
    try {
      for (const [key, value] of Object.entries(obj)) {
        try {
          serialized[key] = serializeBigInts(value);
        } catch {
          serialized[key] = value; // Keep original value if serialization fails
        }
      }
    } catch {
      return obj; // Return original object if serialization fails
    }
    return serialized;
  }
  
  return obj;
}


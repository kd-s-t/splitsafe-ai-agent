// Import asset path fix early
import './asset-path-fix';

if (typeof window !== 'undefined') {
  try {
    if (!window.crypto) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const crypto = require('crypto-browserify');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).crypto = crypto;
    }
    
    if (!window.crypto.subtle) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { subtle } = require('crypto-browserify');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.crypto as any).subtle = subtle;
    }
    
    if (!window.crypto.getRandomValues) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { randomBytes } = require('crypto-browserify');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.crypto as any).getRandomValues = (array: Uint8Array) => {
        const bytes = randomBytes(array.length);
        array.set(bytes);
        return array;
      };
    }

    // Ensure the crypto object is properly structured
    if (window.crypto && !window.crypto.subtle) {
      // Create a basic SubtleCrypto polyfill
      const subtleCrypto = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        generateKey: async (_algorithm: unknown, _extractable: boolean, _keyUsages: string[]) => {
          throw new Error('SubtleCrypto.generateKey not implemented in polyfill');
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sign: async (_algorithm: unknown, _key: unknown, _data: BufferSource) => {
          throw new Error('SubtleCrypto.sign not implemented in polyfill');
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        verify: async (_algorithm: unknown, _key: unknown, _signature: BufferSource, _data: BufferSource) => {
          throw new Error('SubtleCrypto.verify not implemented in polyfill');
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        importKey: async (_format: string, _keyData: unknown, _algorithm: unknown, _extractable: boolean, _keyUsages: string[]) => {
          throw new Error('SubtleCrypto.importKey not implemented in polyfill');
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        exportKey: async (_format: string, _key: unknown) => {
          throw new Error('SubtleCrypto.exportKey not implemented in polyfill');
        }
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.crypto as any).subtle = subtleCrypto;
    }
  } catch {
  }
}

export { };


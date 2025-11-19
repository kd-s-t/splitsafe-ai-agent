import { createHash } from 'crypto';
import * as EC from 'elliptic';
import { canonicalizeJson } from './canon';
import type { FingerprintValue, SignedFingerprint } from './types';


/**
 * Calculate the fingerprint hash (SHA-256 of canonicalized FingerprintValue)
 * This is the hash that should be used in the Explorer URL: /fingerprint/{hash}
 */
export function calculateFingerprintHash(fingerprintValue: FingerprintValue): string {
  const canonicalJson = canonicalizeJson(fingerprintValue);
  const utf8Bytes = Buffer.from(canonicalJson, 'utf-8');
  const hashBytes = createHash('sha256').update(utf8Bytes).digest();
  return hashBytes.toString('hex');
}

/**
 * Signs a Constellation fingerprint using secp256k1 ECDSA.
 * 
 * Process steps:
 * 1. Canonicalize the fingerprint JSON (RFC 8785)
 * 2. Convert to UTF-8 bytes and compute SHA-256 hash
 * 3. Convert hash to hex string, then treat as UTF-8 bytes (critical Constellation requirement)
 * 4. SHA-512 hash of the hex bytes and truncate to 32 bytes
 * 5. Sign the truncated hash with secp256k1 ECDSA
 * 6. Return signed fingerprint with public key and signature
 */
export function signFingerprint(
  fingerprintValue: FingerprintValue,
  privateKey: Buffer
): SignedFingerprint {
  // Initialize elliptic curve
  const curve = new EC.ec('secp256k1');

  // Step 1: Canonicalize JSON
  const canonicalJson = canonicalizeJson(fingerprintValue);

  // Step 2: Convert to UTF-8 bytes
  const utf8Bytes = Buffer.from(canonicalJson, 'utf-8');

  // Step 3: Compute SHA-256 hash
  const hashBytes = createHash('sha256').update(utf8Bytes).digest();

  // Step 4: Critical - convert hash to hex string, then treat as UTF-8 bytes
  const hashHex = hashBytes.toString('hex');
  const hashBytesForSigning = Buffer.from(hashHex, 'utf-8');

  // Step 5: SHA-512 hash of the hex bytes
  const sha512Hash = createHash('sha512').update(hashBytesForSigning).digest();
  const truncatedHash = sha512Hash.subarray(0, 32); // Truncate for secp256k1

  // Step 6: Sign with ECDSA
  const key = curve.keyFromPrivate(privateKey);
  const signature = key.sign(truncatedHash, { canonical: true });

  // Get public key
  const publicKey = key.getPublic();
  const publicKeyHex = publicKey.encode('hex', false);

  return {
    content: fingerprintValue,
    proofs: [{
      id: publicKeyHex,
      signature: signature.toDER('hex'),
      algorithm: 'SECP256K1_RFC8785_V1'
    }]
  };
}

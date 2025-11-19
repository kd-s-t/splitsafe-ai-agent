#!/usr/bin/env node

/**
 * Generate a secp256k1 private key for Constellation Digital Evidence signing
 * 
 * Usage: node scripts/generate-constellation-key.js
 */

import('@noble/secp256k1').then(async (secp) => {
  try {
    // Generate a random 32-byte private key using crypto
    const { randomBytes } = await import('crypto');
    const privateKey = randomBytes(32);
    const privateKeyHex = privateKey.toString('hex');
    
    // Get the public key for reference
    const publicKey = secp.getPublicKey(privateKey, false);
    const publicKeyHex = Buffer.from(publicKey).toString('hex');
    
    console.log('\n✅ Constellation Digital Evidence Key Generated\n');
    console.log('Add this to your .env file:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`CONSTELLATION_PRIVATE_KEY_HEX=${privateKeyHex}`);
    console.log('─────────────────────────────────────────────────────────\n');
    console.log('Public Key (for reference/verification):');
    console.log(publicKeyHex);
    console.log('\n⚠️  IMPORTANT: Keep this private key secure and never commit it to version control!\n');
  } catch (error) {
    console.error('Error generating key:', error);
    process.exit(1);
  }
});

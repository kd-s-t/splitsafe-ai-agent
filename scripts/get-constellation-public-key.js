#!/usr/bin/env node

/**
 * Extract the public key from a Constellation private key
 * This public key needs to be registered with your Constellation API key in their dashboard
 * 
 * Usage: node scripts/get-constellation-public-key.js
 */

import('elliptic').then(async (ECModule) => {
  try {
    const EC = ECModule.default?.ec || ECModule.ec || ECModule;
    const curve = typeof EC === 'function' ? new EC('secp256k1') : new (ECModule.default || ECModule).ec('secp256k1');
    
    const privateKeyHex = process.env.CONSTELLATION_PRIVATE_KEY_HEX;
    
    if (!privateKeyHex) {
      console.error('❌ Error: CONSTELLATION_PRIVATE_KEY_HEX environment variable not set');
      console.error('   Please set it or run: export CONSTELLATION_PRIVATE_KEY_HEX=your_private_key_hex');
      process.exit(1);
    }
    
    if (privateKeyHex.length !== 64) {
      console.error('❌ Error: Private key should be 64 hex characters (32 bytes)');
      console.error(`   Your key is ${privateKeyHex.length} characters`);
      process.exit(1);
    }
    
    const key = curve.keyFromPrivate(privateKeyHex, 'hex');
    const publicKey = key.getPublic();
    const publicKeyUncompressed = publicKey.encode('hex', false); // 130 chars (65 bytes, includes 04 prefix)
    const publicKeyCompressed = publicKey.encode('hex', true); // 66 chars (33 bytes, includes 02/03 prefix)
    
    console.log('\n✅ Constellation Public Key Extracted\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 REGISTER THIS PUBLIC KEY WITH YOUR CONSTELLATION API KEY');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('Public Key (Uncompressed - use this for Constellation):');
    console.log(publicKeyUncompressed);
    console.log('\nPublic Key (Compressed - for reference):');
    console.log(publicKeyCompressed);
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Copy the UNCOMPRESSED public key above');
    console.log('   2. Go to your Constellation dashboard');
    console.log('   3. Navigate to your API key settings');
    console.log('   4. Register/associate this public key with your API key');
    console.log('   5. This will fix the "Invalid signature" error\n');
    
    // Also check tenant ID format
    const tenantId = process.env.CONSTELLATION_TENANT_ID;
    if (tenantId) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('📋 TENANT ID VALIDATION');
      console.log('═══════════════════════════════════════════════════════════════\n');
      console.log(`Tenant ID: ${tenantId}`);
      console.log(`Length: ${tenantId.length} characters`);
      
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)
      if (tenantId.length !== 36) {
        console.log('\n⚠️  WARNING: Tenant ID should be 36 characters (UUID format)');
        console.log('   Your tenant ID appears to be malformed.');
        console.log('   Format should be: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
        console.log('   Verify this with Constellation support or your dashboard.\n');
      } else {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(tenantId)) {
          console.log('\n⚠️  WARNING: Tenant ID does not match UUID format');
          console.log('   Verify this is correct with Constellation.\n');
        } else {
          console.log('✓ Tenant ID format looks valid\n');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error extracting public key:', error);
    process.exit(1);
  }
});


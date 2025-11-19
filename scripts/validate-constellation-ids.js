#!/usr/bin/env node

/**
 * Validate Constellation Tenant ID and Org ID format
 * 
 * Usage: node scripts/validate-constellation-ids.js
 */

const tenantId = process.env.CONSTELLATION_TENANT_ID || 'b1f881e-f1a3-4a69-b41d-7d48dde787f4';
const orgId = process.env.CONSTELLATION_ORG_ID || 'b5446968-e805-4c95-8b65-49d85efc64ea';

console.log('\n🔍 Validating Constellation IDs\n');
console.log('═══════════════════════════════════════════════════════════════');

// Validate Tenant ID
console.log('\n📋 Tenant ID Validation:');
console.log(`   Value: ${tenantId}`);
console.log(`   Length: ${tenantId.length} characters`);
console.log(`   Expected: 36 characters (UUID format)`);

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const segments = tenantId.split('-');

console.log(`   Segments: ${segments.length} (expected 5)`);
segments.forEach((seg, i) => {
  const expectedLengths = [8, 4, 4, 4, 12];
  const isCorrect = seg.length === expectedLengths[i];
  const status = isCorrect ? '✓' : '✗';
  console.log(`     [${i}] ${seg} (${seg.length} chars) ${status} should be ${expectedLengths[i]}`);
});

if (tenantId.length === 36 && uuidRegex.test(tenantId)) {
  console.log('\n   ✅ Tenant ID format is VALID');
} else {
  console.log('\n   ❌ Tenant ID format is INVALID');
  if (tenantId.length === 35) {
    console.log('   ⚠️  Missing 1 character - check Constellation dashboard for exact value');
    
    // Suggest possible fixes if first segment is 7 chars
    if (segments[0]?.length === 7) {
      console.log('\n   Possible fixes (verify with Constellation dashboard):');
      console.log(`   Option 1: 0${tenantId} (add leading 0)`);
      console.log(`   Option 2: ${segments[0]}0-${segments.slice(1).join('-')} (add trailing 0)`);
    }
  }
}

// Validate Org ID
console.log('\n📋 Org ID Validation:');
console.log(`   Value: ${orgId}`);
console.log(`   Length: ${orgId.length} characters`);
console.log(`   Expected: 36 characters (UUID format)`);

const orgSegments = orgId.split('-');
console.log(`   Segments: ${orgSegments.length} (expected 5)`);
orgSegments.forEach((seg, i) => {
  const expectedLengths = [8, 4, 4, 4, 12];
  const isCorrect = seg.length === expectedLengths[i];
  const status = isCorrect ? '✓' : '✗';
  console.log(`     [${i}] ${seg} (${seg.length} chars) ${status} should be ${expectedLengths[i]}`);
});

if (orgId.length === 36 && uuidRegex.test(orgId)) {
  console.log('\n   ✅ Org ID format is VALID');
} else {
  console.log('\n   ❌ Org ID format is INVALID');
}

console.log('\n═══════════════════════════════════════════════════════════════\n');


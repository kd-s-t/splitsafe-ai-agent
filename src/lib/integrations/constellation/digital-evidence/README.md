# Digital Evidence (Constellation)

This module canonicalizes, hashes, signs, and submits fingerprints to Constellation Digital Evidence.

## Env (server-only)
- CONSTELLATION_API_KEY
- CONSTELLATION_PRIVATE_KEY_HEX (secp256k1 private key hex)
- Optional: NEXT_PUBLIC_CONSTELLATION_EXPLORER_URL (defaults to https://digitalevidence.constellationnetwork.io/fingerprint)

## Endpoints
- Testnet API: https://de-api-intnet.constellationnetwork.io/v1
- Mainnet API: https://de-api.constellationnetwork.io/v1
- Explorer deep link: https://digitalevidence.constellationnetwork.io/fingerprint/<hash>

## Server API route
src/app/api/constellation/fingerprints/route.ts

POST body:
```
{
  "escrowEvent": { "...": "canonicalizable object" },
  "orgId": "uuid",
  "tenantId": "uuid",
  "documentId": "string",
  "tags": { "optional": "map" }
}
```

Response:
```
{
  "accepted": true,
  "hash": "<fingerprint-hash>",
  "eventId": "<uuid>",
  "documentRef": "<sha256-hex>",
  "message": "optional"
}
```

## Usage in initiateEscrow (client)
```
async function initiateEscrowFlow(escrowId, amountSats, participants) {
  const escrowEvent = {
    type: 'ESCROW_CREATED',
    escrowId,
    amountSats: amountSats.toString(),
    participants,
    timestamp: new Date().toISOString()
  };

  const res = await fetch('/api/constellation/fingerprints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      escrowEvent,
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      tenantId: '123e4567-e89b-12d3-a456-426614174000',
      documentId: `escrow:${escrowId}`,
      tags: { module: 'escrow' }
    })
  });

  if (!res.ok) throw new Error(`Evidence submit failed: ${res.status}`);
  const { accepted, hash } = await res.json();
  return { accepted, hash };
}
```

## Direct server usage
```
import { v4 as uuidv4 } from 'uuid';
import { hashEscrowEvent, signFingerprint, submitFingerprint } from './';

export async function recordEvidenceServer(escrowEvent, documentId) {
  const apiKey = process.env.CONSTELLATION_API_KEY;
  const privateKeyHex = process.env.CONSTELLATION_PRIVATE_KEY_HEX;

  const documentRef = hashEscrowEvent(escrowEvent);
  const value = {
    orgId: '550e8400-e29b-41d4-a716-446655440000',
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    eventId: uuidv4(),
    documentId,
    documentRef,
    timestamp: new Date().toISOString(),
    version: 1
  };

  const signed = await signFingerprint(value, privateKeyHex);
  const resp = await submitFingerprint(signed, apiKey, { tags: { module: 'escrow' } });
  return resp[0];
}
```

## Verify status by hash (public)
GET https://de-api.constellationnetwork.io/v1/fingerprints/<hash> → status (e.g., FINALIZED_COMMITMENT).

import { getDeApiBaseUrl } from '../config';
import type { FingerprintMetadata, FingerprintSubmission, FingerprintSubmitResponse, SignedFingerprint } from './types';

const BASE_URL = getDeApiBaseUrl();

/**
 * Submits a signed fingerprint to the Constellation Digital Evidence API.
 */
export async function submitFingerprint(
  signedFingerprint: SignedFingerprint,
  apiKey: string,
  metadata?: FingerprintMetadata
): Promise<FingerprintSubmitResponse> {
  const submission: FingerprintSubmission = {
    attestation: signedFingerprint
  };

  if (metadata) {
    submission.metadata = metadata;
  }
  console.log('[x Fingerprint] URL:', `${BASE_URL}/fingerprints`);
  console.log('[x Fingerprint] PAYLOAD:', 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': `${apiKey}`
      },
      body: JSON.stringify([submission]) // API expects array of submissions
    });
  const response = await fetch(
    `${BASE_URL}/fingerprints`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': `${apiKey}`
      },
      body: JSON.stringify([submission]) // API expects array of submissions
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}



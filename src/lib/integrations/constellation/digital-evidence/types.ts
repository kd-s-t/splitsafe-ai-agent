export interface FingerprintValue {
  orgId: string;
  tenantId: string;
  eventId: string;
  documentId: string;
  documentRef: string;
  timestamp: string;
  version: number;
  signer_id?: string;
}

export interface SignatureProof {
  id: string;
  signature: string;
  algorithm: 'SECP256K1_RFC8785_V1';
}

export interface SignedFingerprint {
  content: FingerprintValue;
  proofs: SignatureProof[];
}

export interface FingerprintMetadata {
  hash?: string; // Optional hex-encoded hash for validation
  tags?: Record<string, string>;
}

export interface FingerprintSubmission {
  attestation: SignedFingerprint;
  metadata?: FingerprintMetadata;
}

export interface FingerprintSubmitResultItem {
  eventId?: string;
  hash?: string;
  accepted?: boolean;
  message?: string;
  documentRef?: string;
  errors?: string[];
}

export type FingerprintSubmitResponse = FingerprintSubmitResultItem[];



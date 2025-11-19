import { v4 as uuidv4 } from 'uuid';
import type { FingerprintValue } from './types';

/**
 * Creates a FingerprintValue object for Constellation Digital Evidence.
 * 
 * @param params - Parameters for creating the fingerprint value
 * @param params.orgId - Organization ID from Constellation dashboard
 * @param params.tenantId - Tenant ID from Constellation dashboard
 * @param params.documentId - Unique identifier for the document
 * @param params.documentRef - SHA-256 hash reference of the document/event
 * @param params.eventId - Optional event ID (will be generated if not provided)
 * @param params.timestamp - Optional ISO timestamp (defaults to current time)
 * @param params.version - Optional version number (defaults to 1)
 * @param params.signer_id - Optional signer ID
 * @returns FingerprintValue object ready for signing
 */
export function createFingerprintValue(params: {
  orgId: string;
  tenantId: string;
  documentId: string;
  documentRef: string;
  eventId?: string;
  timestamp?: string;
  version?: number;
  signer_id?: string;
}): FingerprintValue {
  return {
    orgId: params.orgId,
    tenantId: params.tenantId,
    eventId: params.eventId || uuidv4(),
    documentId: params.documentId,
    documentRef: params.documentRef,
    timestamp: params.timestamp || new Date().toISOString(),
    version: params.version ?? 1,
    ...(params.signer_id && { signer_id: params.signer_id })
  };
}


export interface SubmitEvidencePayload {
  escrowEvent: unknown;
  documentId: string;
  tags?: Record<string, string>;
}

export interface SubmitEvidenceResponse {
  accepted: boolean;
  hash?: string;
  eventId?: string;
  documentRef?: string;
  message?: string;
}

export async function submitEvidence(payload: SubmitEvidencePayload): Promise<SubmitEvidenceResponse | undefined> {
  try {
    const { apiCall } = await import('../../auth/api-client');
    const res = await apiCall('/api/constellation/fingerprints', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!res.ok) return undefined;
    return res.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log connection errors with helpful messages (but still return undefined to be non-blocking)
    if (errorMessage.includes('Backend server not available') || 
        errorMessage.includes('ConnectionRefusedError')) {
      console.warn('⚠️ Constellation API unavailable (non-blocking):', errorMessage);
    }
    
    return undefined;
  }
}



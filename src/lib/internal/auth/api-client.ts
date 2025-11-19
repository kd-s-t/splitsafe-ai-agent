import { getSplitSafeApiUrl } from '@/lib/integrations/splitsafe';
import { getJwtToken } from './token-manager';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Get JWT token for authentication
  const token = await getJwtToken();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  // Add Authorization header if we have a token
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Build full API URL (uses SplitSafe domain for IC deployment, relative for traditional hosting)
  const url = getSplitSafeApiUrl(endpoint);

  // Determine if this is a cross-origin request (ICP domain to thesplitsafe.com)
  const isCrossOrigin = typeof window !== 'undefined' && 
    window.location.origin !== new URL(url, window.location.origin).origin;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // Use 'include' for cross-origin requests (ICP -> thesplitsafe.com), 'same-origin' otherwise
      credentials: isCrossOrigin ? 'include' : 'same-origin',
    });

    // If we get a 401, try to refresh the token once
    if (response.status === 401 && token) {
      const { clearJwtToken } = await import('./token-manager');
      clearJwtToken();
      
      // Try to get a new token
      const newToken = await getJwtToken();
      
      if (newToken) {
        // Retry the request with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            'Authorization': `Bearer ${newToken}`,
            ...options.headers,
          },
          credentials: isCrossOrigin ? 'include' : 'same-origin',
        });
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${retryResponse.status}`);
        }
        
        return retryResponse;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response;
  } catch (error) {
    // Detect connection refused errors and provide helpful message
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConnectionRefused = 
      errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('ERR_CONNECTION_REFUSED') ||
      errorMessage.includes('NetworkError') ||
      (error instanceof TypeError && errorMessage.includes('fetch'));

    if (isConnectionRefused && url.includes('localhost:3001')) {
      const helpfulError = new Error(
        `Backend server not available at ${url}. ` +
        `Please start the backend server: cd splitsafe-backend && npm run start:dev ` +
        `Or set VITE_BACKEND_URL to use a different backend. ` +
        `(Original error: ${errorMessage})`
      );
      helpfulError.name = 'ConnectionRefusedError';
      throw helpfulError;
    }
    
    // Re-throw original error for other cases
    throw error;
  }
}

export async function sendEscrowEventNotification(
  eventType: 'escrow-initiated' | 'escrow-updated' | 'escrow-approved' | 'escrow-cancel' | 'escrow-decline' | 'escrow-refund' | 'escrow-release',
  data: {
    recipientPrincipal: string;
    escrowData: unknown;
  }
) {
  return apiCall('/api/events/escrow', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      eventType
    }),
  });
}

export async function sendEscrowInitiatedNotification(data: {
  recipientPrincipal: string;
  escrowData: unknown;
}) {
  return sendEscrowEventNotification('escrow-initiated', data);
}

export async function sendEscrowUpdatedNotification(data: {
  recipientPrincipal: string;
  escrowData: unknown;
}) {
  return sendEscrowEventNotification('escrow-updated', data);
}

export async function sendEscrowApprovedNotification(data: {
  recipientPrincipal: string;
  escrowData: unknown;
}) {
  return sendEscrowEventNotification('escrow-approved', data);
}

export async function sendEscrowCancelNotification(data: {
  recipientPrincipal: string;
  escrowData: unknown;
}) {
  return sendEscrowEventNotification('escrow-cancel', data);
}

export async function sendEscrowDeclineNotification(data: {
  recipientPrincipal: string;
  escrowData: unknown;
}) {
  return sendEscrowEventNotification('escrow-decline', data);
}

export async function sendEscrowRefundNotification(data: {
  recipientPrincipal: string;
  escrowData: unknown;
}) {
  return sendEscrowEventNotification('escrow-refund', data);
}

export async function sendEscrowReleaseNotification(data: {
  recipientPrincipal: string;
  escrowData: unknown;
}) {
  return sendEscrowEventNotification('escrow-release', data);
}

export async function sendEscrowMessage(escrowId: string, messageData: {
  sender: string;
  senderName: string;
  message: string;
  name?: string;
  timestamp: string;
  escrowId: string;
}) {
  return apiCall(`/api/escrows/${escrowId}/messages`, {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
}

export async function getEscrowMessages(escrowId: string) {
  const response = await apiCall(`/api/escrows/${escrowId}/messages`);
  return response.json();
}



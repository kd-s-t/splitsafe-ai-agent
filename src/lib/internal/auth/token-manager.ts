import { getSplitSafeApiUrl } from '@/lib/integrations/splitsafe';
import { AuthClient } from '@dfinity/auth-client';
import { store } from '@/lib/redux/store/store';
import { setSession, clearSession } from '@/lib/redux/store/sessionSlice';

interface TokenData {
  token: string;
  expiresAt: string;
}

const TOKEN_STORAGE_KEY = 'splitsafe_jwt_token';
const TOKEN_EXPIRY_KEY = 'splitsafe_jwt_expires_at';

/**
 * Check if session token exists and is still valid (expires in more than 5 minutes)
 */
function isSessionValid(): boolean {
  const state = store.getState();
  const session = state.session;

  if (session.token && session.expiresAt) {
    const expiresAt = new Date(session.expiresAt);
    // Token is valid if it expires in more than 5 minutes
    return expiresAt.getTime() > Date.now() + 5 * 60 * 1000;
  }

  // Fallback to localStorage check
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (storedToken && storedExpiry) {
      const expiresAt = new Date(storedExpiry);
      if (expiresAt.getTime() > Date.now() + 5 * 60 * 1000) {
        // Sync to Redux
        store.dispatch(setSession({ token: storedToken, expiresAt: storedExpiry }));
        return true;
      }
    }
  }

  return false;
}

/**
 * Get JWT token from Redux if valid, otherwise fetch a new one
 */
export async function getJwtToken(principalId?: string): Promise<string | null> {
  // Check Redux first, then localStorage
  if (isSessionValid()) {
    const state = store.getState();
    return state.session.token;
  }

  // Need to get a new token - get principal ID
  if (!principalId) {
    // First try localStorage
    const storedPrincipal = typeof window !== 'undefined' 
      ? localStorage.getItem('splitsafe_principal') 
      : null;
    
    if (storedPrincipal) {
      principalId = storedPrincipal;
    } else {
      // Try to get from ICP AuthClient
      try {
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();
        
        if (isAuthenticated) {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          principalId = principal.toText();
        }
      } catch (error) {
        console.warn('Could not get principal from AuthClient:', error);
      }
    }
  }

  if (!principalId) {
    console.warn('No principal ID available for JWT token generation');
    return null;
  }

  try {
    const response = await fetch(getSplitSafeApiUrl('/api/v1/auth/session'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ principalId }),
    });

    if (!response.ok) {
      console.error('Failed to get JWT token:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data?.sessionToken) {
      const token = data.data.sessionToken;
      const expiresAt = data.data.expiresAt;

      // Store in Redux
      store.dispatch(setSession({ token, expiresAt }));

      // Also store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
      }

      return token;
    }

    return null;
  } catch (error) {
    console.error('Error getting JWT token:', error);
    return null;
  }
}

/**
 * Clear stored JWT token from both Redux and localStorage
 */
export function clearJwtToken(): void {
  // Clear from Redux
  store.dispatch(clearSession());

  // Clear from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}

/**
 * Refresh JWT token - call /api/v1/auth/session and update Redux
 */
export async function refreshJwtToken(principalId?: string): Promise<string | null> {
  return getJwtToken(principalId);
}



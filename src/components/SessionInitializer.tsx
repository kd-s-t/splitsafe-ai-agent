'use client';

import { useEffect } from 'react';
import { store } from '@/lib/redux/store/store';
import { setSession } from '@/lib/redux/store/sessionSlice';

/**
 * Initializes session from localStorage on app mount
 * Syncs stored JWT token to Redux store
 */
export default function SessionInitializer() {
  useEffect(() => {
    // Load session from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('splitsafe_jwt_token');
      const storedExpiry = localStorage.getItem('splitsafe_jwt_expires_at');

      if (storedToken && storedExpiry) {
        const expiresAt = new Date(storedExpiry);
        // Only sync if token is still valid (expires in more than 5 minutes)
        if (expiresAt.getTime() > Date.now() + 5 * 60 * 1000) {
          store.dispatch(setSession({ token: storedToken, expiresAt: storedExpiry }));
        } else {
          // Clear expired tokens
          localStorage.removeItem('splitsafe_jwt_token');
          localStorage.removeItem('splitsafe_jwt_expires_at');
        }
      }
    }
  }, []);

  return null;
}


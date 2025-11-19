import { AuthClient } from '@dfinity/auth-client';
import { useEffect } from 'react';
import { AUTH_CONSTANTS } from './constants';

export const useAuthInitialization = (
  setAuthClient: (client: AuthClient | null) => void,
  updatePrincipal: (client?: AuthClient) => Promise<void>
) => {
  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client)
      await updatePrincipal(client)
    }).catch((error) => {
      console.error('AuthProvider: Error creating auth client:', error);
    })
  }, [setAuthClient, updatePrincipal])
}

export const useAuthMonitoring = (
  authClient: AuthClient | null,
  updatePrincipal: (client?: AuthClient) => Promise<void>
) => {
  useEffect(() => {
    if (!authClient) return

    const checkAuth = async () => {
      await updatePrincipal(authClient)
    }

    // Check auth state every 60 seconds (reduced frequency to prevent excessive calls)
    const interval = setInterval(checkAuth, AUTH_CONSTANTS.AUTH_MONITORING.checkInterval)

    return () => clearInterval(interval)
  }, [authClient, updatePrincipal])
}

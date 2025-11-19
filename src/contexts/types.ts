import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'

export interface AuthContextType {
  principal: Principal | null
  authClient: AuthClient | null
  isLoading: boolean
  updatePrincipal: (client?: AuthClient) => Promise<void>
  logout: () => Promise<void>
  testNotification: () => void
}

export const defaultAuthContext: AuthContextType = {
  principal: null,
  authClient: null,
  isLoading: true,
  updatePrincipal: async () => {},
  logout: async () => {},
  testNotification: () => {},
}

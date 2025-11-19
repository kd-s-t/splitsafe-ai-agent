// Main auth context and hook
export { AuthProvider, useAuth } from './auth-context'

// Types
export type { AuthContextType } from './types'

// Individual utilities (if needed elsewhere)
export { useAuthInitialization, useAuthMonitoring } from './auth-effects'
export { useLogout } from './auth-logout'
export { playNotificationSound, testNotification } from './auth-notifications'
export { useUpdatePrincipal } from './auth-principal'


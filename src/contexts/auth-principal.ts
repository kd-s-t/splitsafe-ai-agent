import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { clearUser, setUser } from '../lib/redux/store/userSlice'

export const useUpdatePrincipal = (
  authClient: AuthClient | null,
  principal: Principal | null,
  setPrincipal: (principal: Principal | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const dispatch = useDispatch()

  return useCallback(async (client?: AuthClient) => {
    const authClientToUse = client || authClient
    if (!authClientToUse) {
      setIsLoading(false)
      return
    }

    const isAuthenticated = await authClientToUse.isAuthenticated()

    if (!isAuthenticated) {
      // Only logout if we actually had a principal before
      if (principal) {
        await authClientToUse.logout()
        setPrincipal(null)
        dispatch(clearUser())
      }
      setIsLoading(false)
      return
    }

    const identity = authClientToUse.getIdentity()
    const principalObj = identity.getPrincipal()
    const principalText = principalObj.toText()
    
    // Only update if the principal has changed
    if (!principal || principal.toText() !== principalText) {
      setPrincipal(principalObj) // Update local state
      dispatch(setUser({ principal: principalText, name: null })) // Update Redux
    }
    setIsLoading(false)
  }, [principal, dispatch, authClient, setPrincipal, setIsLoading])
}

import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useDispatch } from 'react-redux'
import { clearUser } from '../lib/redux/store/userSlice'

export const useLogout = (
  authClient: AuthClient | null,
  setPrincipal: (principal: Principal | null) => void
) => {
  const dispatch = useDispatch()

  return async () => {
    // Use real authClient logout for both development and production
    if (authClient) {
      await authClient.logout()
      setPrincipal(null)
      dispatch(clearUser())
    }
  }
}

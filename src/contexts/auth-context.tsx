'use client'

import { getInfo } from '@/lib/internal/icp'
import { isUserAdmin } from '@/lib/internal/icp/admin'
import { generateRandomName } from '@/lib/utils'
import { clearUser, setAdmin, setCkbtcBalance, setUser } from '@/lib/redux/store/userSlice'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { testNotification } from './auth-notifications'
import { AUTH_CONSTANTS } from './constants'

export const AuthContext = createContext<{
  principal: Principal | null
  authClient: AuthClient | null
  isLoading: boolean
  envError: string | null
  updatePrincipal: (client?: AuthClient) => Promise<void>
  login: () => Promise<void>
  logout: () => Promise<void>
  testNotification: () => void
}>({
  principal: null,
  authClient: null,
  isLoading: true,
  envError: null,
  updatePrincipal: async () => {},
  login: async () => {},
  logout: async () => {},
  testNotification: () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [envError] = useState<string | null>(null)
  const [hasExplicitlyLoggedOut, setHasExplicitlyLoggedOut] = useState(false)
  const dispatch = useDispatch()

  // Persist principal to localStorage
  useEffect(() => {
    if (principal) {
      localStorage.setItem('splitsafe_principal', principal.toText());
    } else {
      localStorage.removeItem('splitsafe_principal');
    }
  }, [principal]);
  
  // Remove noisy principal logs in UI
  useEffect(() => {
    // Intentionally left blank
  }, [principal]);

  // Environment validation will happen after ICP operations

  const updatePrincipal = useCallback(async (client?: AuthClient) => {
    const authClientToUse = client || authClient
    if (!authClientToUse) {
      setIsLoading(false)
      return
    }

    // For development, use anonymous authentication to bypass Internet Identity issues
    // DISABLED: Use real Internet Identity authentication instead
    if (false && process.env.NODE_ENV === 'development') {
      try {
        // Create a proper anonymous identity for development
        const { AnonymousIdentity } = await import('@dfinity/agent');
        const anonymousIdentity = new AnonymousIdentity();
        const principalObj = anonymousIdentity.getPrincipal();
        const principalText = principalObj?.toText();
        
        
        setPrincipal(principalObj);
        
        // Fetch user data with anonymous identity
        const fetchUserData = async () => {
          try {
            const userInfo = await getInfo(principalObj, principalObj);
            
            const processedUserInfo = Array.isArray(userInfo) ? userInfo[0] : userInfo;
            const availablePictures = AUTH_CONSTANTS.AVAILABLE_PICTURES;
            
            let finalProfilePicture = processedUserInfo?.picture?.[0] || null;
            if (!finalProfilePicture && availablePictures.length > 0) {
              finalProfilePicture = availablePictures[0];
            }
            
            const userData = { 
              principal: principalText, 
              name: processedUserInfo?.nickname?.[0] || generateRandomName(principalText),
              profilePicture: finalProfilePicture,
              email: processedUserInfo?.email?.[0] || null,
              balance: (processedUserInfo?.balance || BigInt(0)).toString()
            };
            
            dispatch(setUser(userData));
            
            // Fetch Bitcoin balance
            try {
              const { createAnonymousActorNew } = await import('@/lib/internal/icp/splitDapp/splitDappNew');
              const { setCkbtcBalance } = await import('@/lib/redux');
              
              const anonymousActor = await createAnonymousActorNew();
              if (anonymousActor && typeof anonymousActor.getUserBitcoinBalance === 'function') {
                const balanceResult = await anonymousActor.getUserBitcoinBalance(principalObj) as bigint;
                const balanceInSatoshis = Number(balanceResult);
                const balanceInBTC = (balanceInSatoshis / 1e8).toFixed(8);
                dispatch(setCkbtcBalance(balanceInBTC));
              } else {
                console.warn('[AUTH] Bitcoin balance method not available on actor');
                dispatch(setCkbtcBalance('0.00000000'));
              }
            } catch (error) {
              console.error('[AUTH] Error fetching Bitcoin balance:', error);
              dispatch(setCkbtcBalance('0.00000000'));
            }
            
            // Check if user is admin
            try {
              const adminStatus = await isUserAdmin(principalObj);
              dispatch(setAdmin(adminStatus));
            } catch (error) {
              console.error('Error checking admin status:', error);
              dispatch(setAdmin(false));
            }
            
          } catch (error) {
            console.error('[AUTH] Error in fetchUserData:', error);
            console.warn(' Error fetching user data (continuing with basic user info):', error);
            const basicUserData = { 
              principal: principalText, 
              name: generateRandomName(principalText),
              profilePicture: AUTH_CONSTANTS.AVAILABLE_PICTURES[0],
              email: null,
              balance: "0"
            };
            dispatch(setUser(basicUserData));
            dispatch(setAdmin(false));
          }
        };
        
        fetchUserData();
        setIsLoading(false);
        return;
        
      } catch (error) {
        console.error('[AUTH] Error creating anonymous identity:', error);
        setIsLoading(false);
        return;
      }
    }

    try {
      const isAuthenticated = await authClientToUse.isAuthenticated()

      if (!isAuthenticated) {
        // Only logout if we actually had a principal before
        setPrincipal((currentPrincipal) => {
          if (currentPrincipal) {
            
            authClientToUse.logout()
            dispatch(clearUser())
            dispatch(setAdmin(false))
          }
          return null
        })
        setIsLoading(false)
        return
      }
    } catch (error) {
      console.error('[AUTH] Error checking authentication status:', error);
      // If there's an error checking auth status, don't logout immediately
      // This can happen during network issues or browser refresh
      setIsLoading(false);
      return;
    }

    const identity = authClientToUse.getIdentity()
    const principalObj = identity.getPrincipal()
    const principalText = principalObj?.toText()
    
    // Always fetch user data when authenticated
    setPrincipal((currentPrincipal) => {
      // Always run fetchUserData to ensure profile picture is set
      if (true) {
        // Fetch user data from backend using getInfo
        const fetchUserData = async () => {
          try {

            let userInfo;
            try {
              userInfo = await getInfo(principalObj, principalObj)
            } catch (getInfoError) {
              console.error('getInfo failed:', getInfoError);
              throw getInfoError; // Re-throw to be caught by outer catch
            }
            
            
            // Handle both array and object formats
            const processedUserInfo = Array.isArray(userInfo) ? userInfo[0] : userInfo;
            
            // Available profile pictures (with .png extension)
            const availablePictures = AUTH_CONSTANTS.AVAILABLE_PICTURES
            
            let finalProfilePicture = processedUserInfo?.picture?.[0] || null
            let finalName = processedUserInfo?.nickname?.[0] || null
            const finalEmail = processedUserInfo?.email?.[0] || null
            const finalBalance = (processedUserInfo?.balance || BigInt(0)).toString()
            
            
            // Always ensure user has a profile picture - force assign one for now
            if (!finalProfilePicture || finalProfilePicture.trim() === '') {
              // Use a deterministic profile picture based on principal for consistency
              const hash = principalText.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
              }, 0);
              const pictureIndex = Math.abs(hash) % availablePictures.length;
              finalProfilePicture = availablePictures[pictureIndex]
              
              
              // Profile picture will be saved later when user is fully authenticated
            } else {
              // If profile picture exists but doesn't have extension, add it
              if (!finalProfilePicture.endsWith('.png')) {
                finalProfilePicture = `${finalProfilePicture}.png`
              }
            }
            
            // If no name is set, generate a random one
            if (!finalName || finalName.trim() === '') {
              finalName = generateRandomName(principalText)
              
              
              // Random name will be saved later when user is fully authenticated
            }
            
            
            const userData = { 
              principal: principalText, 
              name: finalName,
              profilePicture: finalProfilePicture,
              email: finalEmail,
              balance: finalBalance
            };
            
            dispatch(setUser(userData))
            
            // Fetch Bitcoin balance
            try {
              const { createAnonymousActorNew } = await import('@/lib/internal/icp/splitDapp/splitDappNew');
              const { setCkbtcBalance } = await import('@/lib/redux');
              
              const anonymousActor = await createAnonymousActorNew();
              
              if (anonymousActor && typeof anonymousActor.getUserBitcoinBalance === 'function') {
                const balanceResult = await anonymousActor.getUserBitcoinBalance(principalObj) as bigint;
                const balanceInSatoshis = Number(balanceResult);
                const balanceInBTC = (balanceInSatoshis / 1e8).toFixed(8);
                dispatch(setCkbtcBalance(balanceInBTC));
              } else {
                console.warn('[AUTH] Bitcoin balance method not available on actor');
                dispatch(setCkbtcBalance('0.00000000'));
              }
            } catch (error) {
              console.error('[AUTH] Error fetching Bitcoin balance:', error);
              dispatch(setCkbtcBalance('0.00000000'));
            }
            
            // Check if user is admin
            try {
              const adminStatus = await isUserAdmin(principalObj);
              dispatch(setAdmin(adminStatus));
            } catch (error) {
              console.error('Error checking admin status:', error);
              dispatch(setAdmin(false));
            }
            
          } catch (error) {
            console.warn(' Error fetching user data (continuing with basic user info):', error)
            // Set basic user data even if backend calls fail
            const basicUserData = { 
              principal: principalText, 
              name: generateRandomName(principalText),
              profilePicture: AUTH_CONSTANTS.AVAILABLE_PICTURES[0], // Use first available picture
              email: null,
              balance: "0"
            };
            dispatch(setUser(basicUserData))
            dispatch(setAdmin(false));
          }
        }
        fetchUserData()
        return principalObj // Update local state
      }
      return currentPrincipal
    })
    setIsLoading(false)
  }, [dispatch, authClient])

  const login = useCallback(async () => {
    // Reset the logout flag when user explicitly logs in
    setHasExplicitlyLoggedOut(false)
    
    // Use real Internet Identity authentication for both development and production
    if (!authClient) return;
    // The actual login logic will be handled by the login page
  }, [authClient])

  const logout = useCallback(async () => {
    // Use real authClient logout for both development and production
    if (!authClient) return
    await authClient.logout()
    setPrincipal(null)
    dispatch(clearUser())
    dispatch(setAdmin(false))
    setHasExplicitlyLoggedOut(true) // Mark that user explicitly logged out
  }, [authClient, dispatch])

  // Initialize auth client
  useEffect(() => {
    
    // For development, skip AuthClient entirely and use anonymous authentication
    // DISABLED: Use real Internet Identity authentication instead
    if (false && process.env.NODE_ENV === 'development') {
      
      
      // Only auto-login if user hasn't explicitly logged out
      if (!hasExplicitlyLoggedOut) {
        const initializeAnonymousAuth = async () => {
               try {
                 const { AnonymousIdentity } = await import('@dfinity/agent');
                 
                 // Create a proper anonymous identity for development
                 const anonymousIdentity = new AnonymousIdentity();
                 const principalObj = anonymousIdentity.getPrincipal();
                 const principalText = principalObj?.toText();
          
          
          setPrincipal(principalObj);
          
          // Fetch user data with anonymous identity
          try {
            const userInfo = await getInfo(principalObj, principalObj);
            
            const processedUserInfo = Array.isArray(userInfo) ? userInfo[0] : userInfo;
            const availablePictures = AUTH_CONSTANTS.AVAILABLE_PICTURES;
            
            let finalProfilePicture = processedUserInfo?.picture?.[0] || null;
            if (!finalProfilePicture && availablePictures.length > 0) {
              finalProfilePicture = availablePictures[0];
            }
            
            const userData = { 
              principal: principalText, 
              name: processedUserInfo?.nickname?.[0] || generateRandomName(principalText),
              profilePicture: finalProfilePicture,
              email: processedUserInfo?.email?.[0] || null,
              balance: (processedUserInfo?.balance || BigInt(0)).toString()
            };
            
            dispatch(setUser(userData));
            
            // Fetch Bitcoin balance
            try {
              const { createAnonymousActorNew } = await import('@/lib/internal/icp/splitDapp/splitDappNew');
              const { setCkbtcBalance } = await import('@/lib/redux');
              
              const anonymousActor = await createAnonymousActorNew();
              if (anonymousActor && typeof anonymousActor.getUserBitcoinBalance === 'function') {
                const balanceResult = await anonymousActor.getUserBitcoinBalance(principalObj) as bigint;
                const balanceInSatoshis = Number(balanceResult);
                const balanceInBTC = (balanceInSatoshis / 1e8).toFixed(8);
                dispatch(setCkbtcBalance(balanceInBTC));
              } else {
                console.warn('[AUTH] Bitcoin balance method not available on actor');
                dispatch(setCkbtcBalance('0.00000000'));
              }
            } catch (error) {
              console.error('[AUTH] Error fetching Bitcoin balance:', error);
              dispatch(setCkbtcBalance('0.00000000'));
            }
            
            // Check if user is admin
            try {
              const adminStatus = await isUserAdmin(principalObj);
              dispatch(setAdmin(adminStatus));
            } catch (error) {
              console.error('Error checking admin status:', error);
              dispatch(setAdmin(false));
            }
            
          } catch (error) {
            console.error('[AUTH] Error in fetchUserData:', error);
            console.warn(' Error fetching user data (continuing with basic user info):', error);
            const basicUserData = { 
              principal: principalText, 
              name: generateRandomName(principalText),
              profilePicture: AUTH_CONSTANTS.AVAILABLE_PICTURES[0],
              email: null,
              balance: "0"
            };
            dispatch(setUser(basicUserData));
            dispatch(setAdmin(false));
          }
          
          setIsLoading(false);
          
        } catch (error) {
          console.error('[AUTH] Error creating anonymous identity:', error);
          setIsLoading(false);
        }
      };
      
        initializeAnonymousAuth();
      } else {
        setIsLoading(false);
      }
      return;
    }

    // For production, use AuthClient with Internet Identity
    AuthClient.create().then(async (client) => {
      setAuthClient(client)
      await updatePrincipal(client)
    }).catch((error) => {
      console.error('AuthProvider: Error creating auth client:', error)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExplicitlyLoggedOut])

  // Monitor auth state
  useEffect(() => {
    if (!authClient) return

    const checkAuth = async () => {
      await updatePrincipal(authClient)
    }

    // Force initial check and then every 60 seconds
    checkAuth()
    const interval = setInterval(checkAuth, AUTH_CONSTANTS.AUTH_MONITORING.checkInterval)

    return () => clearInterval(interval)
  }, [authClient, updatePrincipal])

  // Force profile picture update on mount
  useEffect(() => {
    if (principal && authClient) {
      updatePrincipal(authClient);
    }
  }, [principal, authClient, updatePrincipal]);

  return (
    <AuthContext.Provider value={{ principal, authClient, isLoading, envError, updatePrincipal, login, logout, testNotification }}>
      {children}
    </AuthContext.Provider>
  )
}
import { useAuth } from '@/contexts/auth-context';
import { subscribeToChannel } from '@/lib/integrations/pusher';
import { createAnonymousActorNew } from '@/lib/internal/icp/splitDapp';
import { getAllTransactions } from '@/lib/internal/icp/transactions';
import { clearTransactions, setCkbtcAddress, setCkbtcBalance, setTransactions } from '@/lib/redux';
import type { NormalizedTransaction } from '@/modules/shared.types';
import { Principal } from '@dfinity/principal';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = React.memo(function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { principal, isLoading, authClient } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure we're hydrated before rendering
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fetchUserData = useCallback(async (principalObj: Principal, shouldLoadTransactions: boolean = true) => {
    try {
      // Safety check for null principal
      if (!principalObj) {
        return;
      }
      
      // ICP Balance is already fetched by getInfo() in auth context
      // No need for separate getBalance() call

      // Fetch cKBTC Balance using anonymous actor
      try {
        const anonymousActor = await createAnonymousActorNew()
        if (anonymousActor && typeof anonymousActor.getUserBitcoinBalance === 'function') {
          const balanceResult = await anonymousActor.getUserBitcoinBalance(principalObj) as bigint
          const balanceInSatoshis = Number(balanceResult)
          const balanceInBTC = (balanceInSatoshis / 1e8).toFixed(8)
          dispatch(setCkbtcBalance(balanceInBTC))
        } else {
          console.warn('cKBTC balance method not available on actor')
          dispatch(setCkbtcBalance('0.00000000'))
        }
      } catch (error) {
        console.error('Error fetching cKBTC balance:', error)
        dispatch(setCkbtcBalance('0.00000000'))
      }

      // User info is now handled by auth-context.tsx

      // SEI Balance functionality removed (deprecated)

        // Fetch Bitcoin Address (now enabled with testnet integration)
        try {
          if (!principal) {
            return
          }
          
          // First, try to get existing Bitcoin address using anonymous actor (query method)
          const anonymousActor = await createAnonymousActorNew()
          if (anonymousActor && typeof anonymousActor.getBitcoinAddress === 'function') {
            const btcAddressResult = await anonymousActor.getBitcoinAddress(principalObj) as string | null
            if (btcAddressResult) {
              dispatch(setCkbtcAddress(btcAddressResult))
            } else {
              
              // Check if user is authenticated before trying to generate
              if (!authClient) {
                // Try anonymous generation as fallback
                try {
                  const anonymousActor = await createAnonymousActorNew();
                  if (anonymousActor && typeof anonymousActor.getCkbtcAddressAnonymous === 'function') {
                    const anonymousResult = await anonymousActor.getCkbtcAddressAnonymous() as { ok?: { btcAddress: string; owner: Principal; subaccount: Uint8Array }; err?: string } | null;
                    if (anonymousResult?.ok?.btcAddress) {
                      dispatch(setCkbtcAddress(anonymousResult.ok.btcAddress));
                      return;
                    }
                  }
                } catch (anonError) {
                  console.error('❌ [ProtectedRoute] Anonymous generation also failed:', anonError);
                }
                dispatch(setCkbtcAddress(null))
                return
              }
              
              const isAuthenticated = await authClient.isAuthenticated();
              if (!isAuthenticated) {
                // Try anonymous generation as fallback
                try {
                  const anonymousActor = await createAnonymousActorNew();
                  if (anonymousActor && typeof anonymousActor.getCkbtcAddressAnonymous === 'function') {
                    const anonymousResult = await anonymousActor.getCkbtcAddressAnonymous() as { ok?: { btcAddress: string; owner: Principal; subaccount: Uint8Array }; err?: string } | null;
                    if (anonymousResult?.ok?.btcAddress) {
                      dispatch(setCkbtcAddress(anonymousResult.ok.btcAddress));
                      return;
                    }
                  }
                } catch (anonError) {
                  console.error('❌ [ProtectedRoute] Anonymous generation also failed:', anonError);
                }
                dispatch(setCkbtcAddress(null))
                return
              }
              
              // Generate a new Bitcoin address if none exists using anonymous actor (update method)
              try {
                const anonymousActor = await createAnonymousActorNew()
                if (anonymousActor && typeof anonymousActor.generateBitcoinAddressForUser === 'function') {
                  const newAddressResult = await anonymousActor.generateBitcoinAddressForUser(principalObj) as string | null
                  if (newAddressResult) {
                    dispatch(setCkbtcAddress(newAddressResult))
                  } else {
                    
                    dispatch(setCkbtcAddress(null))
                  }
                } else {
                  
                  dispatch(setCkbtcAddress(null))
                }
              } catch (authError) {
                console.error('❌ [ProtectedRoute] Error generating Bitcoin address with anonymous actor:', authError)
                dispatch(setCkbtcAddress(null))
              }
            }
          } else {
            
            dispatch(setCkbtcAddress(null))
          }
        } catch (error) {
          console.error('❌ [ProtectedRoute] Error in Bitcoin address section:', error)
          dispatch(setCkbtcAddress(null))
        }

      // Generate SEI Address (hidden from frontend but generated in background)
      try {
        if (!principal) {
        } else {
          
          // Check if user is authenticated before trying to generate
          if (!authClient) {
            // Try anonymous generation as fallback
            try {
              const anonymousActor = await createAnonymousActorNew();
              if (anonymousActor && typeof anonymousActor.requestSeiWalletAnonymous === 'function') {
                const anonymousResult = await anonymousActor.requestSeiWalletAnonymous() as { ok?: { seiAddress: string; owner: Principal }; err?: string } | null;
                if (anonymousResult?.ok?.seiAddress) {
                  return;
                }
              }
            } catch (anonError) {
              console.error('❌ [ProtectedRoute] Anonymous SEI generation also failed:', anonError);
            }
            return
          }
          
          const isAuthenticated = await authClient.isAuthenticated();
          if (!isAuthenticated) {
            // Try anonymous generation as fallback
            try {
              const anonymousActor = await createAnonymousActorNew();
              if (anonymousActor && typeof anonymousActor.requestSeiWalletAnonymous === 'function') {
                const anonymousResult = await anonymousActor.requestSeiWalletAnonymous() as { ok?: { seiAddress: string; owner: Principal }; err?: string } | null;
                if (anonymousResult?.ok?.seiAddress) {
                  return;
                }
              }
            } catch (anonError) {
              console.error('❌ [ProtectedRoute] Anonymous SEI generation also failed:', anonError);
            }
            return
          }
          
          // Use anonymous actor to avoid certificate verification issues
          const anonymousActor = await createAnonymousActorNew()
          if (anonymousActor && typeof anonymousActor.getOrRequestSeiWalletForUser === 'function') {
            try {
              const seiWalletResult = await anonymousActor.getOrRequestSeiWalletForUser(principalObj) as { ok?: { seiAddress: string; owner: Principal }; err?: string } | null
              if (seiWalletResult?.ok?.seiAddress) {
                
              } else {
                
              }
            } catch (seiError) {
              console.error('❌ [ProtectedRoute] Error calling getOrRequestSeiWalletForUser:', seiError)
              // Check if it's a certificate verification error
              if (seiError instanceof Error && seiError.message.includes('certificate verification failed')) {
                console.error('🔐 [ProtectedRoute] Certificate verification failed - this may indicate a root key mismatch. Try restarting dfx.')
              }
            }
          } else {
            
          }
        }
      } catch (error) {
        console.error('❌ [ProtectedRoute] Error generating SEI address:', error)
      }

      // Fetch Transactions (only if needed)
      if (shouldLoadTransactions) {
        try {
          // Clear existing transactions first to remove any non-serializable data
          dispatch(clearTransactions());

          // Use the proper getAllTransactions function instead of calling actor directly
          const transactions = await getAllTransactions(principalObj);

          // Convert to normalized transactions for Redux
          const normalizedTxs = transactions.map(tx => ({
            id: tx.id,
            status: tx.status,
            title: tx.title,
            kind: tx.kind,
            from: tx.from,
            amount: tx.funds_allocated ? String(tx.funds_allocated) : '0',
            createdAt: tx.createdAt ? String(tx.createdAt) : undefined,
            confirmedAt: tx.confirmedAt ? String(tx.confirmedAt) : undefined,
            cancelledAt: tx.cancelledAt ? String(tx.cancelledAt) : undefined,
            refundedAt: tx.refundedAt ? String(tx.refundedAt) : undefined,
            releasedAt: tx.releasedAt ? String(tx.releasedAt) : undefined,
            readAt: tx.readAt ? String(tx.readAt) : undefined,
            chatId: tx.chatId,
            milestoneData: tx.milestoneData,
            to: tx.to ? (tx.to as Array<any>).map((entry) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              principal: String(entry.principal),
              name: entry.name,
              amount: String(entry.funds_allocated),
              percentage: String(entry.percentage),
              status: entry.status,
              approvedAt: entry.approvedAt ? String(entry.approvedAt) : undefined,
              declinedAt: entry.declinedAt ? String(entry.declinedAt) : undefined,
              readAt: entry.readAt ? String(entry.readAt) : undefined,
            })) : [],
          })) as NormalizedTransaction[];

          dispatch(setTransactions(normalizedTxs));
        } catch (error) {
          console.error('Failed to fetch transactions:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          dispatch(setTransactions([]))
        }
      }

      // Subscribe to Pusher notifications
      try {
        if (principalObj) {
          const userChannel = `user-${principalObj?.toText()}`
          subscribeToChannel(userChannel)
        }
      } catch (error) {
        console.error('Error setting up Pusher listening:', error)
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error)
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Only redirect if authentication check is complete and user is not logged in
    // Normalize pathname to handle trailing slashes
    const normalizedPath = pathname?.replace(/\/+$/, '') || '';
    if (!isLoading && !principal && normalizedPath !== '/login' && normalizedPath !== '/public') {
      navigate('/login', { replace: true });
    }
  }, [principal, isLoading, navigate, pathname]);

  // Fetch user data when authentication is complete and user is logged in
  useEffect(() => {
    if (!isLoading && principal) {
      // Determine if we should load all transactions based on the current route
      const shouldLoadTransactions = !pathname.includes('/transactions/') || pathname === '/transactions';
      fetchUserData(principal, shouldLoadTransactions);
    }
      
    // Save user profile data after a delay to ensure authentication is fully established
    setTimeout(async () => {
      try {
        // This will be handled by the user profile update logic
      } catch {
        // no-op
      }
    }, 2000); // 2 second delay
  }, [isLoading, principal, pathname, fetchUserData]);

  // Show loading while authentication is being checked or during hydration
  if (!isHydrated || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#0D0D0D]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FEB64D]"></div>
        <div className="text-center">
          <p className="text-white text-lg font-medium">Checking Authentication</p>
          <p className="text-gray-400 text-sm mt-2">Verifying your login status...</p>
        </div>
      </div>
    );
  }

  // If authentication check is complete and user is not logged in, show nothing (will redirect)
  if (!principal) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
});

export default ProtectedRoute;

'use client';

import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/hooks/useUser';
import { phpToBtc } from '@/lib/integrations/coingecko';
import { attestStoryAction, setupStoryEscrow } from '@/lib/internal/api';
import { createSplitDappActor } from '@/lib/internal/icp/splitDapp';
import { UserProfile } from '@/modules/payment-gateway/components/PaymentCard';
import { Principal } from '@dfinity/principal';
import { getInfo, saveInfo } from '@icp';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

interface PaymentGatewayData {
  merchant: string;
  amount: string;
  currency: string;
  description: string;
  return_url: string;
  cancel_url: string;
  api_key?: string;
  btc_amount?: string;
  php_amount?: string;
}


export function usePaymentGateway() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { principal: userPrincipal, authClient, updatePrincipal } = useAuth();
  const { name, profilePicture, ckbtcBalance } = useUser();
  
  // Authentication state
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Balance state
  const [useSeiNetwork, setUseSeiNetwork] = useState(false);
  const [btcBalance, setBtcBalance] = useState<string>('0');
  
  // Payment state
  const [step, setStep] = useState<'loading' | 'login' | 'payment' | 'processing' | 'success' | 'error'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentGatewayData | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);

  // Update step without localStorage caching
  const updateStep = (newStep: 'loading' | 'login' | 'payment' | 'processing' | 'success' | 'error') => {
    setStep(newStep);
  };

  // Direct Bitcoin balance checking using canister call
  const getDirectBitcoinBalance = async (userPrincipal: Principal): Promise<string> => {
    try {
      console.log('🔄 [PG] Fetching balance for principal:', userPrincipal.toString());
      
      // Import the actor creation function
      const { createAnonymousActorNew } = await import('@/lib/internal/icp/splitDapp/splitDappNew');
      const actor = await createAnonymousActorNew();
      
      if (actor && typeof actor.getUserBitcoinBalance === 'function') {
        const balanceResult = await actor.getUserBitcoinBalance(userPrincipal) as bigint;
        const balanceInSatoshis = Number(balanceResult);
        const balanceInBTC = (balanceInSatoshis / 1e8).toFixed(8);
        console.log('✅ [PG] Direct Bitcoin balance fetched:', balanceInBTC, 'BTC (raw:', balanceResult, ')');
        return balanceInBTC;
      } else {
        console.warn('🔄 [PG] Bitcoin balance method not available on actor');
        return '0.00000000';
      }
    } catch (error) {
      console.error('❌ [PG] Error fetching direct Bitcoin balance:', error);
      return '0.00000000';
    }
  };

  // Create user profile from auth context (no API call needed)
  const createUserProfile = useCallback((principal?: Principal): UserProfile | null => {
    const principalToUse = principal || userPrincipal;
    if (!principalToUse) {
      return null;
    }

    return {
      principal: principalToUse.toString(),
      name: name || 'Smart Moon', // Fallback name
      profilePicture: profilePicture || '10790816.png', // Default profile picture
      email: null, // Email not available from useUser hook
      balance: ckbtcBalance || '0',
    };
  }, [userPrincipal, name, profilePicture, ckbtcBalance]);

  // Check balances function without cache invalidation
  const checkBalances = useCallback(async (userPrincipal: Principal) => {
    try {
      // Check Bitcoin balance using direct method (same as script)
      const btcBalanceResult = await getDirectBitcoinBalance(userPrincipal);
      if (btcBalanceResult) {
        setBtcBalance(btcBalanceResult);
        console.log('✅ Bitcoin balance found:', btcBalanceResult);
      } else {
        setBtcBalance('0');
        console.log('❌ No Bitcoin balance found');
      }
    } catch (error) {
      console.error('Error checking balances:', error);
      setBtcBalance('0');
    }
  }, []);


  // Format amount function
  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
    }).format(num);
  };

  // Payment handlers
  const handlePayment = async () => {
    if (!paymentData) {
      setError('Missing payment data');
      updateStep('error');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      updateStep('processing');

      // Handle amount conversion based on currency and explicit BTC amount
      let amountInBTC: number;
      let amountInE8s: number;
      
      // Check if explicit BTC amount is provided (from PAL integration)
      if (paymentData.btc_amount) {
        amountInBTC = parseFloat(paymentData.btc_amount);
        amountInE8s = Math.floor(amountInBTC * 100_000_000);
        console.log(`💰 [PG] Using explicit BTC amount from PAL: ${amountInBTC} BTC (${amountInE8s} e8s)`);
      } else if (paymentData.currency === 'BTC') {
        // Amount is already in BTC (passed from PAL)
        amountInBTC = parseFloat(paymentData.amount);
        amountInE8s = Math.floor(amountInBTC * 100_000_000);
        console.log(`💰 [PG] Received BTC amount directly: ${amountInBTC} BTC (${amountInE8s} e8s)`);
      } else {
        // Convert from PHP to BTC (legacy support)
        const amountInPHP = parseFloat(paymentData.amount);
        amountInBTC = await phpToBtc(amountInPHP);
        amountInE8s = Math.floor(amountInBTC * 100_000_000);
        console.log(`💰 [PG] Converted PHP to BTC: ${amountInPHP} PHP → ${amountInBTC} BTC (${amountInE8s} e8s)`);
      }

      console.log(`🚀 Processing payment with ${useSeiNetwork ? 'SEI Network' : 'Bitcoin Network'} acceleration`);

      // For Payment Gateway, the authenticated user is the customer (sender)
      // The merchant is the recipient of the payment
      if (!userPrincipal) {
        throw new Error('User must be authenticated to make payments');
      }
      
      const customerPrincipal = userPrincipal;
      console.log('✅ [PG] Customer (sender):', customerPrincipal.toString());

      // Call the ICP canister directly using anonymous actor (no delegation issues)
      const { createAnonymousActorNew } = await import('@/lib/internal/icp/splitDapp/splitDappNew');
      const actor = await createAnonymousActorNew();
      
      // Debug: Check the actor's identity and current caller
      console.log('🔍 [PG] Actor identity check:', {
        customerPrincipal: customerPrincipal.toString(),
        actorIdentity: actor._identity ? 'authenticated' : 'anonymous'
      });
      
      // Check what the canister sees as the current caller
      try {
        const callerBalance = await actor.getUserBitcoinBalance(customerPrincipal) as bigint;
        console.log('🔍 [PG] Caller balance check:', {
          principal: customerPrincipal.toString(),
          balance: callerBalance.toString()
        });
      } catch (error) {
        console.error('❌ [PG] Error checking caller balance:', error);
      }
      
      // Log all parameters being passed to the canister
      const merchantIdText = paymentData.merchant.toLowerCase().replace(/\s+/g, '') || 'philippinesairlines';
      const merchantId: [] | [string] = [merchantIdText];
      // Use the correct format for optional text: [] for null, ["text"] for string
      // Use paymentData.description (route like "MAN to CEB") as memo for dynamic transaction titles
      const memo: [] | [string] = paymentData.description ? [paymentData.description] : [];
      
      // Get merchant principal from API key or use a default merchant
      const { getApiKeyManager } = await import('@/lib/internal/icp/apiKeys');
      const apiKeyManager = await getApiKeyManager();
      
      // Try to get merchant principal from API key, fallback to a default merchant
      const { Principal } = await import('@dfinity/principal');
      let merchantPrincipal;
      try {
        if (paymentData.api_key) {
          const apiKeyResult = await apiKeyManager.getApiKeyByKey(paymentData.api_key);
          if ('ok' in apiKeyResult && apiKeyResult.ok) {
            // Convert the owner string to Principal object
            merchantPrincipal = Principal.fromText(apiKeyResult.ok.owner.toString());
            console.log('✅ [PG] Merchant from API key:', merchantPrincipal.toString());
          } else {
            throw new Error('API key not found');
          }
        } else {
          throw new Error('No API key provided');
        }
      } catch {
        // Fallback to default merchant principal
        merchantPrincipal = Principal.fromText("6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae");
        console.log(' [PG] Using fallback merchant:', merchantPrincipal.toString());
      }
      
      console.log('🔍 [PG] Parameters being passed to canister:');
      console.log('  - customer (sender):', customerPrincipal.toString());
      console.log('  - merchant (recipient):', merchantPrincipal.toString());
      console.log('  - amountInE8s:', amountInE8s);
      console.log('  - memo:', memo);
      console.log('  - merchantId:', merchantId);
      console.log('  - useSeiNetwork:', useSeiNetwork);
      
      const result = await actor.processPaymentGatewayTransfer(
        customerPrincipal, // from: principal (sender - the customer)
        merchantPrincipal, // to: principal (recipient - the merchant)
        BigInt(amountInE8s), // amount: nat
        memo, // memo: opt text
        merchantId, // merchantId: opt text
        useSeiNetwork // useSeiAcceleration: bool
      ) as { ok: { transferId: string } } | { err: string };

      // Handle the ICP canister result
      if ('err' in result) {
        throw new Error(result.err);
      }

      if ('ok' in result) {
        const actualTransferId = result.ok.transferId;
        setTransferId(actualTransferId);
        updateStep('success');
        
        // Register a Story IP asset for direct transfer and attest the action
        ;(async () => {
          try {
            const creator = customerPrincipal.toString();
            const participants = [
              { principal: (await (await import('@dfinity/principal')).Principal).fromText(merchantPrincipal.toString()).toText(), amount: amountInE8s.toString() }
            ];
            const totalAmount = amountInE8s.toString();
            const createdAt = Date.now();

            const payload = await setupStoryEscrow({
              escrowId: String(actualTransferId),
              title: paymentData.description || 'Direct Transfer',
              description: paymentData.description || 'Direct transfer',
              creator,
              participants,
              totalAmount,
              createdAt
            });
            if (payload?.ipAssetId && payload?.transactionHash) {
              try {
                const actor = await createSplitDappActor();
                await actor.storeStoryRegistration(
                  String(actualTransferId),
                  String(payload.ipAssetId),
                  String(payload.transactionHash),
                  customerPrincipal
                );
              } catch (persistErr) {
                console.warn('Failed to persist Story registration for direct transfer:', persistErr);
              }
            }
          } catch (e) {
            console.warn('Story registration for direct transfer failed (non-blocking):', e);
          }

          try {
            const payload = await attestStoryAction({ escrowId: String(actualTransferId), action: 'transfer_attest' });
            if (payload?.transactionHash) {
              try {
                const actor = await createSplitDappActor();
                await actor.storeStoryTx(String(actualTransferId), 'transfer_attest', String(payload.transactionHash), customerPrincipal);
              } catch (persistErr) {
                console.warn('Failed to persist Story transfer attestation:', persistErr);
              }
            }
          } catch (e) {
            console.warn('Story transfer attestation failed (non-blocking):', e);
          }
        })();
        
        // Legacy Constellation tamper-proof logging removed
        
        // Send success message to parent window and redirect
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({
              type: 'PAYMENT_SUCCESS',
              escrowId: actualTransferId,
              amount: paymentData.amount,
              currency: paymentData.currency,
              status: 'completed',
              merchant: paymentData.merchant
            }, '*');
          }
          
          if (paymentData.return_url) {
            const returnUrl = new URL(paymentData.return_url);
            returnUrl.searchParams.set('escrow_id', actualTransferId);
            returnUrl.searchParams.set('amount', paymentData.amount);
            returnUrl.searchParams.set('currency', paymentData.currency);
            returnUrl.searchParams.set('status', 'completed');
            returnUrl.searchParams.set('payment_method', 'payment_gateway');
            returnUrl.searchParams.set('merchant_id', paymentData.merchant.toLowerCase().replace(/\s+/g, ''));
            
            // Add the actual BTC amount that was processed and stored in canister
            const actualBtcAmount = (amountInBTC).toFixed(8);
            returnUrl.searchParams.set('btc_amount', actualBtcAmount);
            
            // Also add PHP amount for reference if available
            if (paymentData.php_amount) {
              returnUrl.searchParams.set('php_amount', paymentData.php_amount);
            }
            
            window.location.href = returnUrl.toString();
          }
          
          // Close the popup window after successful payment
          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              // If not in a popup, close the current tab after redirect
              // This prevents duplicate tabs
              window.close();
            }
          }, 1000); // Give a moment for the redirect to start
        }, 3000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      updateStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (window.opener) {
      window.opener.postMessage({
        type: 'PAYMENT_CANCELLED',
        reason: 'user_cancelled'
      }, '*');
    }
    
    if (paymentData && paymentData.cancel_url) {
      window.location.href = paymentData.cancel_url;
    } else {
      navigate('/');
    }
    
    // Close the popup window after cancellation
    setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 1000);
  };

  const handleLoginSuccess = () => {
    updateStep('payment');
  };

  const handleLoginCancel = () => {
    if (window.opener) {
      window.opener.postMessage({
        type: 'PAYMENT_CANCELLED',
        reason: 'user_cancelled'
      }, '*');
    }
    
    if (paymentData && paymentData.cancel_url) {
      window.location.href = paymentData.cancel_url;
    } else {
      navigate(-1);
    }
    
    // Close the popup window after cancellation
    setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 1000);
  };

  // Login function copied from /login page
  const login = async () => {
    if (!authClient) return;

    // For production, use Internet Identity
    const identityProvider = 'https://identity.internetcomputer.org';

    // Determine derivation origin: use current origin for IC deployments, or thesplitsafe.com for custom domain
    // CRITICAL: When accessing via IC canister URL (e.g., *.icp0.io), you CANNOT use thesplitsafe.com
    // as derivation origin unless thesplitsafe.com is properly configured as a custom domain for that canister
    let derivationOrigin: string;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isICDeployment = hostname.includes('.icp0.io') || hostname.includes('.ic0.app');
      if (isICDeployment) {
        // For IC deployments, must use the actual IC domain, not thesplitsafe.com
        derivationOrigin = window.location.origin;
      } else if (process.env.NODE_ENV === 'development') {
        derivationOrigin = 'http://localhost:3000';
      } else {
        // Use current origin or fallback
        derivationOrigin = window.location.origin || 'https://thesplitsafe.com';
      }
    } else {
      // Server-side fallback
      derivationOrigin = 'https://thesplitsafe.com';
    }

    await authClient.login({
      identityProvider,
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1_000_000_000),
      derivationOrigin,
      onSuccess: async () => {
        // Immediately update principal after successful login
        await updatePrincipal();

        // Track the logged-in user
        try {
          const userPrincipal = authClient.getIdentity().getPrincipal();

          // Check if user exists in users table
          const userInfo = await getInfo(userPrincipal, userPrincipal);

          if (userInfo) {
            // User exists, proceed to payment
            console.log('✅ [PG] User logged in successfully, proceeding to payment');
            updateStep('payment');
          } else {
            // Register with default values
            const defaultUserInfo = {
              nickname: [] as [] | [string],
              username: [] as [] | [string],
              picture: [] as [] | [string],
              email: [] as [] | [string]
            };

            await saveInfo(userPrincipal, defaultUserInfo);
            console.log('✅ [PG] New user registered, proceeding to payment');
            updateStep('payment');
          }
      } catch {
        console.error('Error tracking logged-in user');
        // Still proceed to payment even if tracking fails
        updateStep('payment');
      }
      },
    });
  };

  // Authentication initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Use the actual user principal from the main app
        console.log('🔄 [PG] Using user principal:', userPrincipal?.toString());
        
        let principalToUse = userPrincipal;
        
        // Fallback: try to restore principal from localStorage if main auth is not working
        if (!principalToUse && typeof window !== 'undefined') {
          console.log('🔍 [PG] Checking localStorage for stored principal...');
          const storedPrincipal = localStorage.getItem('splitsafe_principal');
          console.log('🔍 [PG] Stored principal in localStorage:', storedPrincipal);
          
          if (storedPrincipal) {
            try {
              const { Principal } = await import('@dfinity/principal');
              principalToUse = Principal.fromText(storedPrincipal);
              console.log('✅ [PG] Restored principal from localStorage:', principalToUse.toString());
            } catch (error) {
              console.error('❌ [PG] Error restoring principal from localStorage:', error);
            }
          } else {
            console.log('❌ [PG] No stored principal found in localStorage');
          }
        }
        
        if (principalToUse) {
          setPrincipal(principalToUse);
          
          // Set user profile from auth context and check balances
          const profileData = createUserProfile(principalToUse);
          if (profileData) {
            setUserProfile(profileData);
            console.log('✅ [PG] User profile created:', profileData.name, profileData.principal);
          }
          
          await checkBalances(principalToUse);
        } else {
          // If no principal, set to null and show login
          setPrincipal(null);
          setUserProfile(null);
        }
        
        setAuthLoading(false);
        setProfileLoading(false);
        
      } catch (error) {
        console.error('Payment Gateway Auth Error:', error);
        setAuthLoading(false);
        setProfileLoading(false);
        setPrincipal(null);
      }
    };

    initializeAuth();
  }, [paymentData?.api_key, userPrincipal, name, profilePicture, ckbtcBalance, checkBalances, createUserProfile]);

  // Extract payment data from URL parameters
  useEffect(() => {
    const merchant = searchParams.get('merchant');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const description = searchParams.get('description');
    const returnUrl = searchParams.get('return_url');
    const cancelUrl = searchParams.get('cancel_url');
    const apiKey = searchParams.get('api_key');

    if (!merchant || !amount || !currency || !description) {
      setError('Invalid payment parameters');
      updateStep('error');
      return;
    }

    setPaymentData({
      merchant,
      amount,
      currency,
      description,
      return_url: returnUrl || '',
      cancel_url: cancelUrl || '',
      api_key: apiKey || undefined
    });
  }, [searchParams]);

  // Authentication check - EXACT same logic as ProtectedRoute
  useEffect(() => {
    console.log('🔐 Payment Gateway Auth Check:', { 
      principal: principal && principal.toString(), 
      authLoading, 
      isAuthenticated: !!principal 
    });

    // Show loading while authentication is being checked (same as ProtectedRoute)
    if (authLoading) {
      console.log('⏳ Auth still loading, staying in loading state');
      updateStep('loading');
      return;
    }

    // Only proceed after authentication check is complete (same as ProtectedRoute)
    if (step === 'loading') {
      if (principal) {
        console.log('✅ User is authenticated, proceeding to payment');
        updateStep('payment');
      } else {
        console.log('❌ User not authenticated, showing login');
        updateStep('login');
      }
    }
  }, [principal, authLoading, step]);

  return {
    // State
    principal,
    authLoading,
    userProfile,
    profileLoading,
    useSeiNetwork,
    btcBalance,
    step,
    isProcessing,
    error,
    paymentData,
    transferId,
    
    // Actions
    updateStep,
    checkBalances,
    formatAmount,
    handlePayment,
    handleCancel,
    handleLoginSuccess,
    handleLoginCancel,
    login,
    setPrincipal,
    setAuthLoading,
    setPaymentData,
    setError,
    setUseSeiNetwork
  };
}

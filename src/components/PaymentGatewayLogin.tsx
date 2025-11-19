'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  // Removed Input and Label imports - no longer needed
  import { useAuth } from '@/contexts/auth-context';
import { AuthClient } from '@dfinity/auth-client';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface PaymentGatewayLoginProps {
  returnUrl?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onLogin?: () => void;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
}

export default function PaymentGatewayLogin({
  returnUrl = '/payment-gateway',
  onSuccess,
  onCancel,
  onLogin,
  showBackButton = true,
  title = 'Sign In',
  subtitle = 'Continue with payment'
}: PaymentGatewayLoginProps) {
  const navigate = useNavigate();
  const { updatePrincipal } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed email form state - only using Internet Identity

  // Removed handleInputChange - no longer needed without email form

  const handleInternetIdentityLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the login function passed from Payment Gateway if available
      if (onLogin) {
        await onLogin();
        return;
      }

      // Fallback to original implementation
      const authClient = await AuthClient.create();
      
      // Use the same authentication approach as the main app
      const identityProvider = process.env.NODE_ENV === 'development'
        ? 'https://identity.internetcomputer.org'  // Use real Internet Identity even in development
        : 'https://identity.internetcomputer.org';

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
          console.log('✅ Authentication successful');
          await updatePrincipal(authClient);
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(returnUrl);
          }
        },
        onError: (error) => {
          console.error('❌ Authentication failed:', error);
          setError('Authentication failed. Please try again.');
        }
      });
    } catch (error) {
      console.error('❌ Authentication error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleEmailLogin - no longer needed

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Close the popup window if opened in a popup
      if (window.opener) {
        window.close();
      } else {
        navigate(-1);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Login Card */}
      <Card className="shadow-xl border-0 bg-gray-900">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-white">
            {title}
          </CardTitle>
          <p className="text-sm text-gray-300 mt-2">
            {subtitle}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Internet Identity Login */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleInternetIdentityLogin}
                disabled={isLoading}
                variant="secondary"
                className="w-full h-12 text-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-pulse" />
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" color="#FEB64D" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={14} color="#FEB64D" />
                      <span>Sign In</span>
                    </>
                  )}
                </div>
              </Button>
            </motion.div>
            
          </div>

          {/* Email login removed - only Internet Identity available */}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Back Button */}
          {showBackButton && (
            <div className="pt-4 border-t border-gray-600">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

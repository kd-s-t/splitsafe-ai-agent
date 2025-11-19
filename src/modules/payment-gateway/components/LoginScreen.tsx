'use client';

import PaymentGatewayLogin from '@/components/PaymentGatewayLogin';
// img component removed - use <img> tags instead;
import SplitSafeFooter from './SplitSafeFooter';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onLoginCancel: () => void;
  onLogin: () => void;
}

export default function LoginScreen({ onLoginSuccess, onLoginCancel, onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8" data-version="v2">
          <div className="inline-flex items-center justify-center w-38">
            <img 
              src="/splitsafe-logo.svg" 
              alt="SplitSafe Logo" 
              width={152}
              height={64}
              className="animate-fade-in-top"
              onError={(e) => {
                e.currentTarget.src = '/logo.svg';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Payment Gateway
          </h1>
          <p className="text-gray-300">
            Secure authentication required to process your payment
          </p>
        </div>

        <PaymentGatewayLogin
          onSuccess={onLoginSuccess}
          onCancel={onLoginCancel}
          onLogin={onLogin}
          showBackButton={false}
          title="Sign In to Continue Payment"
          subtitle="Authenticate to proceed with your secure payment"
        />

        {/* Footer */}
        <div className="mt-8">
          <SplitSafeFooter />
        </div>
      </div>
    </div>
  );
}

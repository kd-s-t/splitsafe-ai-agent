import {
    ErrorScreen,
    LoadingScreen,
    LoginScreen,
    PaymentCard,
    ProcessingScreen,
    SplitSafeFooter,
    SuccessScreen
} from '@/modules/payment-gateway/components';
import { usePaymentGateway } from '@/modules/payment-gateway/hooks/usePaymentGateway';
import { Suspense } from 'react';

function PaymentGatewayPageContent() {
  const {
    userProfile,
    useSeiNetwork,
    btcBalance,
    step,
    isProcessing,
    error,
    paymentData,
    transferId,
    updateStep,
    formatAmount,
    handlePayment,
    handleCancel,
    handleLoginSuccess,
    handleLoginCancel,
    login,
    setUseSeiNetwork
  } = usePaymentGateway();

  switch (step) {
    case 'loading':
      return <LoadingScreen />;
    case 'login':
      return (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess}
          onLoginCancel={handleLoginCancel}
          onLogin={login}
        />
      );
    case 'payment':
      return (
        <div className="min-h-screen flex flex-col justify-between p-4">
          <div className="flex-grow flex flex-col items-center justify-center">
            <PaymentCard
              paymentData={paymentData}
              userProfile={userProfile}
              useSeiNetwork={useSeiNetwork}
              btcBalance={btcBalance}
              isProcessing={isProcessing}
              onPayment={handlePayment}
              onCancel={handleCancel}
              onNetworkToggle={(useSei) => setUseSeiNetwork(useSei)}
              formatAmount={formatAmount}
            />
          </div>
          <div className="text-center pb-4">
            <SplitSafeFooter />
          </div>
        </div>
      );
    case 'processing':
      return <ProcessingScreen />;
    case 'success':
      return (
        <SuccessScreen 
          transferId={transferId}
          paymentData={paymentData}
        />
      );
    case 'error':
      return (
        <ErrorScreen 
          error={error}
          onRetry={() => updateStep('payment')}
          onCancel={handleCancel}
        />
      );
    default:
      return <LoadingScreen />;
  }
}

export default function PaymentGatewayPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentGatewayPageContent />
    </Suspense>
  );
}


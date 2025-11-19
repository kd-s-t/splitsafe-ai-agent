'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { btcToPhp } from '@/lib/integrations/coingecko';
import { Info, Loader2, Shield } from 'lucide-react';
// img component removed - use <img> tags instead;
import { useEffect, useState } from 'react';

export interface UserProfile {
  principal: string;
  name: string;
  profilePicture: string | null;
  email: string | null;
  balance: string;
}

interface PaymentCardProps {
  paymentData: {
    merchant: string;
    amount: string;
    currency: string;
    description: string;
    btc_amount?: string;
    php_amount?: string;
  } | null;
  userProfile: UserProfile | null;
  useSeiNetwork: boolean;
  btcBalance: string;
  isProcessing: boolean;
  onPayment: () => void;
  onCancel: () => void;
  onNetworkToggle: (useSei: boolean) => void;
  formatAmount: (amount: string, currency: string) => string;
}

export default function PaymentCard({
  paymentData,
  userProfile,
  useSeiNetwork,
  btcBalance,
  isProcessing,
  onPayment,
  onCancel,
  onNetworkToggle,
  formatAmount
}: PaymentCardProps) {
  const [phpBalance, setPhpBalance] = useState<string>('0');

  // Convert BTC balance to PHP using CoinGecko
  useEffect(() => {
    const convertBalance = async () => {
      if (btcBalance && parseFloat(btcBalance) > 0) {
        try {
          const phpAmount = await btcToPhp(parseFloat(btcBalance));
          setPhpBalance(phpAmount.toLocaleString('en-PH', { 
            style: 'currency', 
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }));
        } catch (error) {
          console.error('Error converting BTC to PHP:', error);
          // Fallback to hardcoded rate if CoinGecko fails
          const fallbackAmount = parseFloat(btcBalance) * 6000000; // ₱6M per BTC
          setPhpBalance(fallbackAmount.toLocaleString('en-PH', { 
            style: 'currency', 
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }));
        }
      } else {
        setPhpBalance('₱0');
      }
    };

    convertBalance();
  }, [btcBalance]);

  return (
    <div className="w-full max-w-2xl">
      {/* SplitSafe Logo Above Card */}
      <div className="text-center mb-6">
        <img 
          src="/splitsafe-logo.svg" 
          alt="SplitSafe Logo" 
          width={192}
          height={64}
          className="w-48 h-16 mx-auto animate-fade-in-top"
          onError={(e) => {
            e.currentTarget.src = '/logo.svg';
          }}
        />
      </div>
      
      <Card className="w-full">
        <CardHeader>
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6 p-4 ">
            <div className="flex items-center gap-4">
              {/* Profile Picture */}
              <div className="w-12 h-12 overflow-hidden">
                <img 
                  src={userProfile?.profilePicture ? `/profiles/${userProfile.profilePicture}` : "/profiles/10790816.png"} 
                  alt="Profile" 
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/profiles/10790816.png";
                  }}
                />
              </div>
              
              {/* User Info */}
              <div>
                <div className="text-white font-semibold">{userProfile?.name || 'Loading...'}</div>
                <div className="text-gray-300 text-sm">
                  {userProfile?.principal ? `${userProfile.principal.slice(0, 8)}...${userProfile.principal.slice(-8)}` : 'Loading...'}
                </div>
              </div>
            </div>
            
            {/* Balance */}
            <div className="text-right">
              <div className="text-[#FEB64D] font-bold text-lg">
                {btcBalance} BTC
              </div>
              <div className="text-gray-300 text-sm">
                ≈ {phpBalance}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FEB64D]/10 w-12 h-12 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#FEB64D]" />
            </div>
            <div>
              <CardTitle className="text-xl">Complete Your Payment</CardTitle>
              <p className="text-gray-600">Secure escrow payment for your flight booking</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-white">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Merchant:</span>
                <span className="font-medium text-white">{paymentData && paymentData.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Amount:</span>
                <div className="text-right">
                  {paymentData?.btc_amount ? (
                    <span className="font-medium text-white">{parseFloat(paymentData.btc_amount).toFixed(8)} BTC</span>
                  ) : paymentData?.currency === 'BTC' ? (
                    <span className="font-medium text-white">{parseFloat(paymentData.amount).toFixed(8)} BTC</span>
                  ) : (
                    <span className="font-medium text-white">{(parseFloat(paymentData?.amount || '0') / 6000000).toFixed(8)} BTC</span>
                  )}
                  {paymentData && (
                    <div className="text-xs text-[#A1A1A1] mt-1">
                      {paymentData.currency === 'BTC' ? (
                        paymentData.php_amount ? `≈ ₱${parseFloat(paymentData.php_amount).toLocaleString()}` : 'Bitcoin Payment'
                      ) : (
                        `≈ ${formatAmount(paymentData.amount, paymentData.currency)}`
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">SplitSafe Fee (0.1%):</span>
                <div className="text-right">
                  {paymentData?.btc_amount ? (
                    <span className="font-medium text-white">{(parseFloat(paymentData.btc_amount) * 0.001).toFixed(8)} BTC</span>
                  ) : paymentData?.currency === 'BTC' ? (
                    <span className="font-medium text-white">{(parseFloat(paymentData.amount) * 0.001).toFixed(8)} BTC</span>
                  ) : (
                    <span className="font-medium text-white">{(parseFloat(paymentData?.amount || '0') * 0.001 / 6000000).toFixed(8)} BTC</span>
                  )}
                  {paymentData && (
                    <div className="text-xs text-[#A1A1A1] mt-1">
                      {paymentData.currency === 'BTC' ? (
                        paymentData.php_amount ? `≈ ₱${(parseFloat(paymentData.php_amount) * 0.001).toLocaleString()}` : '0.1% of BTC amount'
                      ) : (
                        `≈ ${formatAmount((parseFloat(paymentData.amount) * 0.001).toString(), paymentData.currency)}`
                      )}
                    </div>
                  )}
                </div>
              </div>
              {useSeiNetwork && (
                <div className="flex justify-between">
                  <span className="text-gray-300">SEI Network Fee:</span>
                  <div className="text-right">
                    <span className="font-medium text-white">{(parseFloat(paymentData?.amount || '0') * 0.0005 / 6000000).toFixed(8)} BTC</span>
                    {paymentData && (
                      <div className="text-xs text-[#A1A1A1] mt-1">
                        ≈ {formatAmount((parseFloat(paymentData.amount) * 0.0005).toString(), paymentData.currency)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="text-gray-300 font-semibold">Total:</span>
                <div className="text-right">
                  <span className="font-bold text-[#FEB64D]">
                    {(parseFloat(paymentData?.amount || '0') * (1.001 + (useSeiNetwork ? 0.0005 : 0)) / 6430000).toFixed(8)} BTC
                  </span>
                  {paymentData && (
                    <div className="text-xs text-[#A1A1A1] mt-1">
                      ≈ {formatAmount(
                        (parseFloat(paymentData.amount) * (1.001 + (useSeiNetwork ? 0.0005 : 0))).toString(), 
                        paymentData.currency
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Description:</span>
                <span className="font-medium text-white">{paymentData && paymentData.description}</span>
              </div>
            </div>
          </div>

          {/* Network Selection */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-white">Express</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useSeiNetwork"
                  checked={useSeiNetwork}
                  onChange={(e) => onNetworkToggle(e.target.checked)}
                  className="w-4 h-4 text-[#FEB64D] bg-[#2A2A2A] border-[#404040] rounded focus:ring-[#FEB64D] focus:ring-2"
                />
                <label htmlFor="useSeiNetwork" className="text-[#A1A1A1] cursor-pointer">
                  Enable SEI Network Acceleration
                </label>
              </div>
              <div className="bg-gray-700 border border-gray-600 rounded-[10px] p-3">
                <div className="flex items-start gap-2">
                  <Info size={16} color='#9CA3AF' className="mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-white">
                    <div className="font-medium mb-1">
                      {useSeiNetwork ? 'SEI Network (Faster)' : 'Bitcoin Network (Standard)'}
                    </div>
                    <div className="text-gray-300">
                      {useSeiNetwork ? (
                        <>
                          SEI Network Acceleration: Enabled
                          <br />
                          <span className="text-gray-400">Backend will use SEI for faster processing</span>
                        </>
                      ) : (
                        <>
                          SEI Network Acceleration: Disabled
                          <br />
                          <span className="text-gray-400">Backend will use standard Bitcoin processing</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={onPayment}
              disabled={isProcessing}
              className="flex-1 bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'I Approve and Pay'
              )}
            </Button>
            <Button 
              onClick={onCancel}
              variant="outline"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

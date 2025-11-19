// Withdraw module hooks
import { calculateWithdrawalFees, convertCkBtcToIcp } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ConversionInfo, WithdrawalFees } from './types';

export const useWithdrawalFees = (amount: number, selectedCurrency: 'BTC' | 'ICP') => {
  const [withdrawalFees, setWithdrawalFees] = useState<WithdrawalFees | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCurrency === 'BTC' && amount > 0) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fees = await calculateWithdrawalFees(amount);
          setWithdrawalFees(fees);
        } catch (error) {
          console.error('Failed to update withdrawal fees:', error);
          setError('Failed to load withdrawal fees');
        } finally {
          setIsLoading(false);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [amount, selectedCurrency]);

  // Load initial fees when component mounts
  useEffect(() => {
    const loadInitialFees = async () => {
      try {
        const fees = await calculateWithdrawalFees(0.001); // Load fees with sample amount
        setWithdrawalFees(fees);
      } catch (error) {
        console.error('Failed to load withdrawal fees:', error);
      }
    };
    loadInitialFees();
  }, []);

  return { withdrawalFees, setWithdrawalFees, isLoading, error };
};

export const useConversionInfo = (ckbtcBalance: string | null) => {
  const [conversionInfo, setConversionInfo] = useState<ConversionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversionInfo = async () => {
      if (ckbtcBalance && Number(ckbtcBalance) > 0) {
        setIsLoading(true);
        setError(null);
        try {
          const conversion = await convertCkBtcToIcp(Number(ckbtcBalance));
          setConversionInfo(conversion);
        } catch (error) {
          console.error('Failed to load conversion info:', error);
          setError('Failed to load conversion info');
        } finally {
          setIsLoading(false);
        }
      } else {
        setConversionInfo(null);
      }
    };
    loadConversionInfo();
  }, [ckbtcBalance]);

  return { conversionInfo, setConversionInfo, isLoading, error };
};


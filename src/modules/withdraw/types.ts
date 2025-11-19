// Withdraw module types
import type { WithdrawFormData } from '../shared.types';

export interface WithdrawalFees {
  conversionFee: number;
  networkFee: number;
  totalFees: number;
  networkFeeSats: number;
  conversionFeePercentage: number;
}

export interface ConversionInfo {
  icpAmount: number;
  conversionRate: number;
  fee: number;
  netIcpAmount: number;
}

// Re-export shared types
export type { WithdrawFormData };

export interface WithdrawProps {
  open: boolean;
  onClose: () => void;
}

export interface BtcWithdrawFormProps {
  form: {
    watch: (name?: string) => unknown;
    setValue: (name: string, value: unknown) => void;
    getValues: () => WithdrawFormData;
    formState: { errors: Record<string, unknown> };
  };
  withdrawalFees: WithdrawalFees | null;
  setWithdrawalFees: (fees: WithdrawalFees | null) => void;
  watchedAmount: string;
  errors: Record<string, unknown>;
  isAcceptedTerms: boolean;
  error: string | null;
}

export interface IcpWithdrawFormProps {
  form: {
    watch: (name?: string) => unknown;
    setValue: (name: string, value: unknown) => void;
    getValues: () => WithdrawFormData;
    formState: { errors: Record<string, unknown> };
  };
  conversionInfo: ConversionInfo | null;
  setConversionInfo: (info: ConversionInfo | null) => void;
  watchedAmount: string;
  errors: Record<string, unknown>;
  isAcceptedTerms: boolean;
  error: string | null;
}

export interface WithdrawFooterProps {
  isLoading: boolean;
  onClose: () => void;
}

export interface CurrencySelectorProps {
  selectedCurrency: 'BTC' | 'ICP';
  onCurrencyChange: (currency: 'BTC' | 'ICP') => void;
}


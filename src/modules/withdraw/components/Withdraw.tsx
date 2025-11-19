"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog-new';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/hooks/useUser';
import { showWithdrawalNotification } from '@/lib/integrations/pusher/client';
import { createWithdrawTransaction, getTransactionsPaginated } from '@/lib/internal/icp';
import { convertCkBtcToIcp, TRANSACTION_STATUS } from '@/lib/utils';
import { setTransactions } from '@/lib/redux/store/transactionsSlice';
import { setWithdraw } from '@/lib/redux/store/withdrawSlice';
import { convertToNormalizedTransactions } from '@/modules/transactions/utils';
import { createWithdrawSchema } from '@/validation/withdraw';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import z from 'zod';
import { useConversionInfo, useWithdrawalFees } from '../hooks';
import { WithdrawProps } from '../types';
import { BtcWithdrawForm, CurrencySelector, IcpWithdrawForm, WithdrawFooter } from './index';

type FormData = z.infer<ReturnType<typeof createWithdrawSchema>>;

export default function Withdraw({
  open,
  onClose
}: WithdrawProps) {
  const dispatch = useDispatch();
  const { icpBalance, ckbtcBalance } = useUser()
  const { principal } = useAuth();

  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ICP'>('BTC');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(createWithdrawSchema(selectedCurrency)),
    defaultValues: {
      amount: "",
      address: "",
      isAcceptedTerms: false
    },
    mode: "onChange"
  });

  const {
    watch,
    handleSubmit,
    formState: { errors },
    reset
  } = form;

  // Use custom hooks for fees and conversion info
  const watchedAmount = watch('amount');
  const amountNumber = Number(watchedAmount) || 0;
  const { withdrawalFees, setWithdrawalFees } = useWithdrawalFees(amountNumber, selectedCurrency);
  const { conversionInfo, setConversionInfo } = useConversionInfo(ckbtcBalance || null);


  // Update form validation when currency changes
  useEffect(() => {
    reset();
    setError(null);
  }, [selectedCurrency, reset]);

  const { isAcceptedTerms } = watch();

  // Function to refresh transactions after withdrawal
  const refreshTransactions = async () => {
    if (!principal) return;
    try {
      const result = await getTransactionsPaginated(principal, 0, 100);
      const normalizedTxs = convertToNormalizedTransactions(result.transactions);
      dispatch(setTransactions(normalizedTxs));
      console.log('Transactions refreshed after withdrawal');
    } catch (error) {
      console.error('Failed to refresh transactions after withdrawal:', error);
    }
  };

  // Reset form when currency changes
  const handleCurrencyChange = (currency: 'BTC' | 'ICP') => {
    setSelectedCurrency(currency);
    setError(null);
  };

  // Validate amount against available balance
  const validateAmount = async (value: string) => {
    const numValue = Number(value);

    if (selectedCurrency === 'BTC') {
      // For BTC withdrawal, check ckBTC balance minus fees
      const maxBalance = ckbtcBalance;
    if (maxBalance === null || maxBalance === undefined) {
        return `Unable to verify ckBTC balance. Please try again.`;
    }
    const maxBalanceNum = Number(maxBalance);
    if (isNaN(maxBalanceNum)) {
        return `Invalid ckBTC balance format. Please try again.`;
      }
      
      // Account for withdrawal fees
      const fees = withdrawalFees?.totalFees || 0;
      const availableBalance = maxBalanceNum - fees;
      
      if (numValue > availableBalance) {
        if (fees > 0) {
          return `Amount cannot exceed your available balance of ${availableBalance.toFixed(6)} BTC (${maxBalance} ckBTC - ${fees.toFixed(6)} BTC fees)`;
        } else {
          return `Amount cannot exceed your ckBTC balance of ${maxBalance}`;
        }
      }
    } else {
      // For ICP withdrawal, check both ICP and ckBTC balances (with conversion)
      const icpBalanceNum = Number(icpBalance || 0);
      const ckbtcBalanceNum = Number(ckbtcBalance || 0);
      
      if (isNaN(icpBalanceNum) || isNaN(ckbtcBalanceNum)) {
      return `Invalid balance format. Please try again.`;
    }

      // Calculate total available ICP (including potential ckBTC conversion)
      try {
        const ckbtcConversion = await convertCkBtcToIcp(ckbtcBalanceNum);
        const totalAvailableIcp = icpBalanceNum + ckbtcConversion.netIcpAmount;
        
        if (numValue > totalAvailableIcp) {
          return `Amount cannot exceed your total available balance. ICP: ${icpBalance || 0}, ckBTC equivalent: ${ckbtcConversion.netIcpAmount.toFixed(2)} ICP`;
        }
      } catch (error) {
        console.error('Failed to calculate conversion:', error);
        return `Unable to calculate ckBTC conversion. Please try again.`;
      }
    }
    return true;
  };

  const onSubmit = async (data: FormData) => {
    if (!isAcceptedTerms || !principal) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate amount against balance
      const amountValidation = await validateAmount(data.amount);
      if (amountValidation !== true) {
        setError(amountValidation);
        setIsLoading(false);
        return;
      }

      // Convert amount to the appropriate unit (e8s for ICP, satoshis for BTC)
      const amountInSmallestUnit = selectedCurrency === 'BTC'
        ? Math.floor(Number(data.amount) * 100_000_000) // Convert BTC to satoshis
        : Math.floor(Number(data.amount) * 100_000_000); // Convert ICP to e8s

      // Create withdrawal request data
      const withdrawData = selectedCurrency === 'BTC' 
        ? { btc: { recipientAddress: data.address, amount: BigInt(amountInSmallestUnit) } }
        : { icp: { recipientAddress: data.address, amount: BigInt(amountInSmallestUnit) } };

      const result = await createWithdrawTransaction(principal, withdrawData);

      if ('ok' in result) {
        // Success - close modal and reset form first
        onClose();
        reset();
        setError(null);
        
        // Refresh transactions to show the new withdrawal transaction
        await refreshTransactions();
        
        // Show notification
        const currency = selectedCurrency === 'BTC' ? 'BTC' : 'ICP';
        const title = `${currency} Withdrawal Successful`;
        const body = `Your ${currency} withdrawal of ${data.amount} ${currency} has been processed successfully.`;
        
        showWithdrawalNotification(title, body, {
          amount: data.amount,
          currency: selectedCurrency,
          address: data.address
        });

        // Add a small delay to ensure the withdraw modal closes before showing confirmation
        setTimeout(() => {
          console.log('Setting withdraw confirmation...');
          dispatch(setWithdraw({
            isConfirmed: true,
            amount: data.amount,
            destination: data.address,
            status: TRANSACTION_STATUS.RELEASED,
            transactionHash: "1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890"
          }));
          console.log('Withdraw confirmation set successfully');
        }, 300); // 300ms delay to ensure smooth transition
        
      } else {
        setError(result.err || 'Withdrawal failed');
      }

    } catch (err) {
      console.error('Withdrawal error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(`Withdrawal failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>

      <DialogContent className="!bg-[#313030] !max-w-[640px] border border-[#303333] h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className='flex text-left gap-3'>
            <ArrowUpRight color='#FEB64D' size={20} />
            <Typography variant="large" className="text-white">Withdraw funds</Typography>
          </DialogTitle>
          <DialogDescription>
            Describe your payment split in natural language
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 px-1 min-h-0">
          <form id="withdraw-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Currency Selection */}
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
            />

            {/* Form Content - Side by Side Carousel */}
            <div className="relative overflow-hidden">
              <div className="flex transition-transform duration-300 ease-in-out" 
                   style={{ transform: `translateX(${selectedCurrency === 'BTC' ? '0%' : '-100%'})` }}>
                
                {/* BTC Form */}
                <BtcWithdrawForm
                  form={form}
                  withdrawalFees={withdrawalFees}
                  setWithdrawalFees={setWithdrawalFees}
                  watchedAmount={watchedAmount}
                  errors={errors}
                  isAcceptedTerms={isAcceptedTerms}
                  error={error}
                />

                {/* ICP Form */}
                <IcpWithdrawForm
                  form={form}
                  conversionInfo={conversionInfo}
                  setConversionInfo={setConversionInfo}
                  watchedAmount={watchedAmount}
                  errors={errors}
                  isAcceptedTerms={isAcceptedTerms}
                  error={error}
                />
              </div>
            </div>
          </form>
        </div>
        
        {/* Fixed Footer with Buttons */}
        <WithdrawFooter
          isLoading={isLoading}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

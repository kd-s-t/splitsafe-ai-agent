"use client"

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { useUser } from '@/hooks/useUser';
import { calculateWithdrawalFees } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface WithdrawalFees {
  conversionFee: number;
  networkFee: number;
  totalFees: number;
  networkFeeSats: number;
  conversionFeePercentage: number;
}

interface FormData {
  amount: string;
  address: string;
  isAcceptedTerms: boolean;
}

interface BtcWithdrawFormProps {
  form: UseFormReturn<FormData>;
  withdrawalFees: WithdrawalFees | null;
  setWithdrawalFees: (fees: WithdrawalFees | null) => void;
  watchedAmount: string;
  errors: Record<string, { message?: string }>;
  isAcceptedTerms: boolean;
  error: string | null;
}

export default function BtcWithdrawForm({
  form,
  withdrawalFees,
  setWithdrawalFees,
  watchedAmount,
  errors,
  isAcceptedTerms,
  error
}: BtcWithdrawFormProps) {
  const { ckbtcBalance } = useUser();
  const { watch, setValue } = form;

  // Recalculate fees when amount changes with debounce
  useEffect(() => {
    if (watchedAmount) {
      const amount = Number(watchedAmount);
      if (amount > 0) {
        // Debounce the fee calculation to avoid too many API calls
        const timeoutId = setTimeout(async () => {
          try {
            const fees = await calculateWithdrawalFees(amount);
            setWithdrawalFees(fees);
          } catch (error) {
            console.error('Failed to update withdrawal fees:', error);
          }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
      }
    }
  }, [watchedAmount, setWithdrawalFees]);

  return (
    <div className="w-full flex-shrink-0 space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="amount" className="text-[#A1A1AA] mb-2">
            ckBTC amount
          </Label>

          <Typography variant="small" className="text-white whitespace-nowrap">
            {(() => {
              if (ckbtcBalance === null || ckbtcBalance === undefined) return '';
              const balance = Number(ckbtcBalance);
              if (withdrawalFees) {
                return `${balance} ckBTC`;
              }
              return `${ckbtcBalance} ckBTC`;
            })()}
          </Typography>
        </div>

        <div>
          <Input
            id="btc-amount"
            type="text"
            value={watch("amount") || ""}
            onChange={(e) => {
              console.log('Input changed:', e.target.value);
              setValue("amount", e.target.value);
            }}
            placeholder="0.00000000"
            aria-describedby={errors.amount ? "amount-error" : undefined}
            className={`${errors.amount ? '!border-[#FF5050]' : ''}`}
          />
          {errors.amount && (
            <div id="amount-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.amount.message}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="text-[#A1A1AA] mb-2">
          Bitcoin address
        </Label>

        <Input
          id="address"
          type="text"
          value={watch("address") || ""}
          onChange={(e) => {
            console.log('Address changed:', e.target.value);
            setValue("address", e.target.value);
          }}
          placeholder="Input Bitcoin address here"
          aria-describedby={errors.address ? "address-error" : undefined}
          className={`${errors.address ? '!border-[#FF5050]' : ''}`}
        />
        {errors.address && (
          <div id="address-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.address.message}
          </div>
        )}
      </div>

      {/* Fee Breakdown for BTC withdrawals */}
      <AnimatePresence>
        {withdrawalFees && watchedAmount && Number(watchedAmount) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeOut"
            }}
            className="space-y-3"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="bg-[#2A2A2A] border border-[#404040] rounded-[10px] p-4 space-y-3"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <Typography variant="small" className="text-white font-semibold">
                  Withdrawal Breakdown
                </Typography>
              </motion.div>
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                  className="flex justify-between items-center"
                >
                  <Typography variant="small" className="text-[#A1A1AA]">
                    Amount to withdraw:
                  </Typography>
                  <Typography variant="small" className="text-white font-medium">
                    {Number(watchedAmount).toFixed(8)} BTC
                  </Typography>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                  className="flex justify-between items-center"
                >
                  <Typography variant="small" className="text-[#A1A1AA]">
                    Network fee:
                  </Typography>
                  <Typography variant="small" className="text-white">
                    -{withdrawalFees.networkFee.toFixed(8)} BTC
                  </Typography>
                </motion.div>
                <motion.hr
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="border-[#404040]"
                />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.2 }}
                  className="flex justify-between items-center"
                >
                  <Typography variant="small" className="text-white font-semibold">
                    You will receive:
                  </Typography>
                  <Typography variant="small" className="text-white font-semibold">
                    {(Number(watchedAmount) - withdrawalFees.totalFees).toFixed(8)} BTC
                  </Typography>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.2 }}
            >
              <Typography variant="small" className="text-[#A1A1AA] text-center">
                The breakdown provides complete transparency
              </Typography>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#1F374F] border border-[#007AFF] rounded-[10px] flex items-center gap-3 p-4 h-[60px]">
        <Info size={20} color='#71B5FF' />
        <Typography variant="small" className="text-white">
          {(() => {
            if (withdrawalFees) {
              return `ckBTC to BTC withdrawals will be sent to your selected wallet. Network fee: ${withdrawalFees.networkFee.toFixed(6)} BTC`;
            }
            return 'ckBTC to BTC withdrawals will be sent to your selected wallet.';
          })()}
        </Typography>
      </div>

      <div className="mb-6">
        <Label className="items-start gap-3 cursor-pointer mb-2">
          <Checkbox
            id="terms"
            checked={isAcceptedTerms}
            onCheckedChange={(checked) => setValue("isAcceptedTerms", checked as boolean)}
            aria-describedby={errors.isAcceptedTerms ? "terms-error" : undefined}
          />
          <div className='flex flex-col text-left'>
            <Typography variant="small" className="text-[#FAFAFA]">
              Accept terms and conditions
            </Typography>
            <Typography variant="small" className="text-[#A1A1AA] mt-1">
              I understand and accept that crypto payouts cannot be reversed.
            </Typography>
          </div>
        </Label>
        {errors.isAcceptedTerms && (
          <div id="terms-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.isAcceptedTerms.message}
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <hr className='text-[#424444]' />
    </div>
  );
}

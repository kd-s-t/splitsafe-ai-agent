"use client"

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { useUser } from '@/hooks/useUser';
import { convertCkBtcToIcp } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ConversionInfo {
  icpAmount: number;
  conversionRate: number;
  fee: number;
  netIcpAmount: number;
}

interface FormData {
  amount: string;
  address: string;
  isAcceptedTerms: boolean;
}

interface IcpWithdrawFormProps {
  form: UseFormReturn<FormData>;
  conversionInfo: ConversionInfo | null;
  setConversionInfo: (info: ConversionInfo | null) => void;
  watchedAmount: string;
  errors: Record<string, { message?: string }>;
  isAcceptedTerms: boolean;
  error: string | null;
}

export default function IcpWithdrawForm({
  form,
  conversionInfo,
  setConversionInfo,
  watchedAmount,
  errors,
  isAcceptedTerms,
  error
}: IcpWithdrawFormProps) {
  const { icpBalance, ckbtcBalance } = useUser();
  const { watch, setValue } = form;

  // Load conversion info when ckBTC balance changes
  useEffect(() => {
    const loadConversionInfo = async () => {
      if (ckbtcBalance && Number(ckbtcBalance) > 0) {
        try {
          const conversion = await convertCkBtcToIcp(Number(ckbtcBalance));
          setConversionInfo(conversion);
        } catch (error) {
          console.error('Failed to load conversion info:', error);
        }
      } else {
        setConversionInfo(null);
      }
    };
    loadConversionInfo();
  }, [ckbtcBalance, setConversionInfo]);

  return (
    <div className="w-full flex-shrink-0 space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="amount" className="text-[#A1A1AA] mb-2">
            ICP amount
          </Label>
          <Typography variant="small" className="text-[#A1A1AA]">
            {icpBalance || 0} ICP
          </Typography>
        </div>
        <Input
          id="icp-amount"
          type="text"
          value={watch("amount") || ""}
          onChange={(e) => {
            console.log('ICP Input changed:', e.target.value);
            setValue("amount", e.target.value);
          }}
          placeholder="0.00000000"
          className="mt-2 bg-[#212121] border-[#404040] text-white placeholder-[#A1A1AA] focus:border-[#FEB64D] focus:ring-[#FEB64D]"
          aria-describedby={errors.amount ? "amount-error" : undefined}
        />
        {errors.amount && (
          <div id="amount-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.amount.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="address" className="text-[#A1A1AA] mb-2">
          ICP address
        </Label>
        <Input
          id="address"
          type="text"
          value={watch("address") || ""}
          onChange={(e) => {
            console.log('ICP Address changed:', e.target.value);
            setValue("address", e.target.value);
          }}
          placeholder="Input ICP address here"
          className="mt-2 bg-[#212121] border-[#404040] text-white placeholder-[#A1A1AA] focus:border-[#FEB64D] focus:ring-[#FEB64D]"
          aria-describedby={errors.address ? "address-error" : undefined}
        />
        {errors.address && (
          <div id="address-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.address.message}
          </div>
        )}
      </div>

      {/* Fee Breakdown for ICP withdrawals */}
      <AnimatePresence>
        {watchedAmount && Number(watchedAmount) > 0 && (
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
                    {Number(watchedAmount).toFixed(8)} ICP
                  </Typography>
                </motion.div>
                {(() => {
                  const icpBal = Number(icpBalance || 0);
                  const requestedAmount = Number(watchedAmount);
                  const needsConversion = icpBal < requestedAmount;

                  if (needsConversion && conversionInfo) {
                    const icpNeeded = requestedAmount - icpBal;
                    const conversionFee = icpNeeded * 0.001; // 0.1% conversion fee
                    return (
                      <>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <Typography variant="small" className="text-[#A1A1AA]">
                            Conversion fee (0.1%):
                          </Typography>
                          <Typography variant="small" className="text-white">
                            -{conversionFee.toFixed(8)} ICP
                          </Typography>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <Typography variant="small" className="text-[#A1A1AA]">
                            Network fee:
                          </Typography>
                          <Typography variant="small" className="text-white">
                            -0.0001 ICP
                          </Typography>
                        </motion.div>
                      </>
                    );
                  } else {
                    return (
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
                          -0.0001 ICP
                        </Typography>
                      </motion.div>
                    );
                  }
                })()}
                <motion.hr
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="border-[#404040]"
                />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.2 }}
                  className="flex justify-between items-center"
                >
                  <Typography variant="small" className="text-white font-semibold">
                    You will receive:
                  </Typography>
                  <Typography variant="small" className="text-white font-semibold">
                    {(() => {
                      const icpBal = Number(icpBalance || 0);
                      const requestedAmount = Number(watchedAmount);
                      const needsConversion = icpBal < requestedAmount;
                      const networkFee = 0.0001;

                      if (needsConversion && conversionInfo) {
                        const icpNeeded = requestedAmount - icpBal;
                        const conversionFee = icpNeeded * 0.001;
                        const totalFees = conversionFee + networkFee;
                        return (requestedAmount - totalFees).toFixed(8);
                      } else {
                        return (requestedAmount - networkFee).toFixed(8);
                      }
                    })()} ICP
                  </Typography>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.2 }}
            >
              <Typography variant="small" className="text-[#A1A1AA] text-center">
                The breakdown provides complete transparency
              </Typography>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#1F374F] border border-[#007AFF] rounded-[10px] flex items-center gap-3 p-4">
        <Info size={20} color='#71B5FF' />
        <Typography variant="small" className="text-white">
          {(() => {
            const icpBal = Number(icpBalance || 0);
            const ckbtcBal = Number(ckbtcBalance || 0);
            const requestedAmount = Number(watch('amount') || 0);

            if (icpBal < requestedAmount && ckbtcBal > 0 && requestedAmount > 0 && conversionInfo) {
              const icpNeeded = requestedAmount - icpBal;
              return `ICP withdrawals will be sent to your selected wallet. BTC will be automatically converted to ICP: ${(icpNeeded / conversionInfo.conversionRate).toFixed(8)} BTC → ${icpNeeded.toFixed(2)} ICP`;
            }
            return 'ICP withdrawals will be sent to your selected wallet.';
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
      </div>
      {errors.isAcceptedTerms && (
        <div id="terms-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {errors.isAcceptedTerms.message}
        </div>
      )}

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

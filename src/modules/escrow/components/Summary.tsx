"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { calculateEscrowFees } from "@/lib/utils";
import { escrowFormSchema } from "@/validation/escrow";
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

type FormData = z.infer<typeof escrowFormSchema>;

interface SummaryProps {
  form: UseFormReturn<FormData>;
  handleInitiateEscrow: () => void;
  isEditMode?: boolean;
  isLoading?: boolean;
}

// Manual validation function as fallback
const validateFormData = (data: FormData) => {
  const errors: string[] = [];
  
  // Check title
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  // Check BTC amount
  if (!data.btcAmount || data.btcAmount.trim().length === 0) {
    errors.push('BTC amount is required');
  } else {
    const amount = Number(data.btcAmount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('BTC amount must be a positive number');
    }
    if (amount > 10) {
      errors.push('BTC amount cannot exceed 10');
    }
  }
  
  // Check recipients
  if (!data.recipients || data.recipients.length === 0) {
    errors.push('At least one recipient is required');
  } else {
    data.recipients.forEach((recipient, index) => {
      if (!recipient.name || recipient.name.trim().length === 0) {
        errors.push(`Recipient ${index + 1} name is required`);
      }
      if (!recipient.principal || recipient.principal.trim().length === 0) {
        errors.push(`Recipient ${index + 1} ICP Principal ID is required`);
      }
      if (recipient.percentage < 0 || recipient.percentage > 100) {
        errors.push(`Recipient ${index + 1} percentage must be between 0 and 100`);
      }
    });
    
    // Check total percentage
    const totalPercentage = data.recipients.reduce((sum, r) => sum + r.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push('Total percentage must equal 100%');
    }
  }
  
  // Only check startDate for milestone escrows
  if (data.isMilestone && (!data.startDate || data.startDate.trim().length === 0)) {
    errors.push('Start date is required for milestone escrows');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const Summary = ({
  form,
  handleInitiateEscrow,
  isEditMode = false,
  isLoading = false,
}: SummaryProps) => {

  const { watch, formState: { isSubmitting } } = form

  const btcAmount = watch("btcAmount");
  const recipients = watch("recipients");
  const useSeiAcceleration = watch("useSeiAcceleration");
  
  const [escrowFees, setEscrowFees] = useState<{
    networkFee: number;
    conversionFee: number;
    seiNetworkFee: number;
    totalFees: number;
    networkFeeSats: number;
    estimatedTxSize: number;
  } | null>(null);

  // Calculate fees when amount, recipients, or SEI acceleration changes
  useEffect(() => {
    const calculateFees = async () => {
      if (btcAmount && Number(btcAmount) > 0) {
        try {
          const fees = await calculateEscrowFees(Number(btcAmount), recipients?.length || 1, useSeiAcceleration || false);
          setEscrowFees(fees);
        } catch (error) {
          console.error('Failed to calculate escrow fees:', error);
          setEscrowFees(null);
        }
      } else {
        setEscrowFees(null);
      }
    };

    calculateFees();
  }, [btcAmount, recipients, useSeiAcceleration]);

  return (
    <div className="w-full">
      <Card className="h-fit">
        <CardHeader >
          <CardTitle className="flex items-center justify-between">
            <Typography variant="large">Escrow summary</Typography>
            <Shield color="#FEB64D" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 mt-6">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="text-[#9F9F9F]">
              Status
            </Typography>
            <Badge
              variant="outline"
              className="!bg-[#48342A] !border-[#BD8239] !text-[#FEB64D]"
            >
              Pending
            </Badge>
          </div>
          <hr className="my-5 text-[#424444]" />
          <div className="flex justify-between items-center">
            <Typography variant="small" className="text-[#9F9F9F]">
              Total deposit
            </Typography>
            <Typography variant="base">
              {btcAmount || "0.00000000"} BTC
            </Typography>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Typography variant="small" className="text-[#9F9F9F]">
              Recipients
            </Typography>
            <Typography variant="base">{recipients?.length || 0}</Typography>
          </div>
          
          {/* Network Fee Breakdown */}
          <AnimatePresence>
            {escrowFees && btcAmount && Number(btcAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="bg-[#2A2A2A] p-4 space-y-3"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.2 }}
                    className="flex justify-between items-center"
                  >
                    <Typography variant="small" className="text-[#A1A1AA]">
                      Amount to escrow:
                    </Typography>
                    <Typography variant="small" className="text-white font-medium">
                      {Number(btcAmount).toFixed(8)} BTC
                    </Typography>
                  </motion.div>
                    {useSeiAcceleration ? (
                      <>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <Typography variant="small" className="text-[#A1A1AA]">
                            Conversion fees:
                          </Typography>
                          <Typography variant="small" className="text-white">
                            -{escrowFees.conversionFee.toFixed(8)} BTC
                          </Typography>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45, duration: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <Typography variant="small" className="text-[#A1A1AA]">
                            SEI network fee:
                          </Typography>
                          <Typography variant="small" className="text-white">
                            -{escrowFees.seiNetworkFee.toFixed(8)} BTC
                          </Typography>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <Typography variant="small" className="text-[#A1A1AA]">
                            Bitcoin network fee:
                          </Typography>
                          <Typography variant="small" className="text-white">
                            -{escrowFees.networkFee.toFixed(8)} BTC
                          </Typography>
                        </motion.div>
                        <motion.hr 
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.55, duration: 0.3 }}
                          className="border-[#404040]" 
                        />
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6, duration: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <Typography variant="small" className="text-white font-semibold">
                            Total (including fees):
                          </Typography>
                          <Typography variant="small" className="text-white font-semibold">
                            {(Number(btcAmount) + escrowFees.totalFees).toFixed(8)} BTC
                          </Typography>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <Typography variant="small" className="text-[#A1A1AA]">
                            Bitcoin network fee:
                          </Typography>
                          <Typography variant="small" className="text-white">
                            -{escrowFees.networkFee.toFixed(8)} BTC
                          </Typography>
                        </motion.div>
                        <motion.hr 
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.45, duration: 0.3 }}
                          className="border-[#404040]" 
                        />
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <Typography variant="small" className="text-white font-semibold">
                            Total (including fees):
                          </Typography>
                          <Typography variant="small" className="text-white font-semibold">
                            {(Number(btcAmount) + escrowFees.totalFees).toFixed(8)} BTC
                          </Typography>
                        </motion.div>
                      </>
                    )}
                    <motion.hr 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: useSeiAcceleration ? 0.7 : 0.6, duration: 0.3 }}
                      className="border-[#404040]" 
                    />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <hr className="mt-5 mb-7 text-[#424444]" />
          <div className="flex items-center gap-2">
            <Shield size={16} color="#FEB64D" />
            <Typography variant="base" className="text-[#FEB64D]">
              Trustless Escrow
            </Typography>
          </div>

          <Typography variant="muted" className="text-[#9F9F9F]">
            Powered by Internet Computer&apos;s native Bitcoin integration. No
            bridges, no wrapped BTC.
          </Typography>

          <motion.div
            className="relative overflow-hidden w-full mt-4"
          >
            <Button
              variant="default"
              className="w-full text-sm bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90"
              disabled={isSubmitting || isLoading}
              onClick={async () => {
                console.log('🔍 Escrow button clicked');
                console.log('🔍 Form values:', form.getValues());
                console.log('🔍 Form errors:', form.formState.errors);
                console.log('🔍 Form is valid:', form.formState.isValid);
                console.log('🔍 Recipients details:', JSON.stringify(form.getValues().recipients, null, 2));
                
                // Force form validation
                const isValid = await form.trigger();
                console.log('🔍 Form validation result:', isValid);
                
                if (!isValid) {
                  console.log('🔍 Form validation failed, errors:', form.formState.errors);
                  
                  // Manual validation as fallback
                  const formData = form.getValues();
                  const manualValidation = validateFormData(formData);
                  if (!manualValidation.isValid) {
                    console.log('🔍 Manual validation also failed:', manualValidation.errors);
                    return;
                  }
                  console.log('🔍 Manual validation passed, proceeding with submission');
                }
                
                try {
                  // Try direct submission
                  console.log('🔍 Attempting direct submission...');
                  await handleInitiateEscrow();
                } catch (error) {
                  console.error('🔍 Form submission error:', error);
                }
              }}
            >
              <Send size={16} className="mr-2" />
              {(isSubmitting || isLoading) ? "Processing..." : isEditMode ? "Update escrow" : "Initiate escrow"}
            </Button>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: 2,
              }}
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Summary;

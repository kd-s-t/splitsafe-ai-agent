"use client"

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Typography } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { TransactionDialogProps } from './types';

export default function TransactionDialog({
  open,
  onOpenChange,
  amount,
  onDone,
  isLoading = false,
}: TransactionDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDone = async () => {
    if (isProcessing || isLoading) return;
    
    setIsProcessing(true);
    try {
      await onDone?.();
    } catch (error) {
      console.error('Error during redirect:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isButtonLoading = isLoading || isProcessing;
  
  // Prevent dialog from closing when loading
  const handleOpenChange = (newOpen: boolean) => {
    if (isButtonLoading) {
      return; // Don't allow closing when loading
    }
    onOpenChange?.(newOpen);
  };
  
  return (
    <Dialog open={open || false} onOpenChange={handleOpenChange}>
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
          <motion.img
            src="/check.png"
            alt="check"
            className="w-15 h-15 relative z-10"
            animate={{
              scale: [1, 1.1, 1],
              filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

        <h2 className="text-2xl font-bold mb-2 mt-8">
          Escrow initiated
        </h2>

        <p className="text-gray-400 mb-6 max-w-md">
          The Bitcoin escrow has been successfully created and is awaiting funding.
        </p>

        <div className="w-full bg-[#474747] border border-[#6C6C6C] rounded-[10px] p-3 mb-6">
          <Typography variant="small" className='text-white'>
            Send {amount} BTC to the generated deposit to activate the escrow.
          </Typography>
        </div>

        <div className="relative overflow-hidden w-full">
          <Button
            className="w-full text-sm bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90"
            disabled={isButtonLoading}
            onClick={handleDone}
          >
            {isButtonLoading ? "Processing..." : (
              <>
                To my escrow
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          {isButtonLoading && (
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
          )}
        </div>
      </motion.div>
    </Dialog>
  );
} 
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SuccessScreenProps {
  transferId: string | null;
  paymentData: {
    merchant: string;
  } | null;
}

export default function SuccessScreen({ transferId, paymentData }: SuccessScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0D0D0D]">
      <Card className="w-full max-w-md mx-auto bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2 text-white">Payment Successful!</h3>
          <p className="text-gray-300 mb-4">
            Your payment has been processed successfully.
          </p>
          {transferId && (
            <div className="bg-[#2A2A2A] rounded-lg p-3 mb-4 border border-[#404040]">
              <p className="text-xs text-gray-400">Transaction ID:</p>
              <p className="text-sm font-mono text-gray-200">{transferId}</p>
            </div>
          )}
          <p className="text-sm text-gray-400">
            Redirecting back to {paymentData && paymentData.merchant}...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

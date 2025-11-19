"use client";

import TransactionStats from "@/components/TransactionStats";
import { Typography } from "@/components/ui/typography";
import { CircleCheckBig } from "lucide-react";
import { CancelledEscrowDetailsProps } from "@/modules/shared.types";
import { calculateTotalBTC, countUniqueRecipients } from "../../utils/transactionDetailsHelpers";

export default function CancelledEscrowDetails({ transaction }: CancelledEscrowDetailsProps) {
  const totalBTC = calculateTotalBTC(transaction);

  const recipientCount = countUniqueRecipients(transaction);

  return (
    <div className="container !rounded-2xl !p-6">
      {/* Title */}
      <Typography variant="large" className="mb-4 text-white">Basic Escrow</Typography>

      <TransactionStats
        totalBTC={totalBTC}
        recipientCount={recipientCount}
        status={transaction.status}
      />

      <hr className="my-10 text-[#424444] h-[1px]" />

      {/* Payment Distribution */}
      <Typography variant="large" className="mb-4">Payment distribution</Typography>

      <div className="space-y-4">
        {Array.isArray(transaction.to) && transaction.to.map((recipient: unknown, index: number) => {
          const amount = Number((recipient as { amount: string | number }).amount) / 1e8;
          const totalAmount = transaction.to.reduce((sum: number, entry: unknown) => sum + Number((entry as { amount: string | number }).amount), 0) / 1e8;
          const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;

          return (
            <div key={index} className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
                    <CircleCheckBig size={24} className="text-[#FEB64D]" />
                  </div>
                  <div>
                    <Typography variant="base" className="text-white font-semibold">
                      Recipient {index + 1}
                    </Typography>
                    <Typography variant="small" className="text-[#9F9F9F]">
                      {String((recipient as { principal: string }).principal).slice(0, 20)}...
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography variant="base" className="text-white font-semibold">
                    {amount.toFixed(8)} BTC
                  </Typography>
                  <Typography variant="small" className="text-[#9F9F9F]">
                    {percentage}%
                  </Typography>
                </div>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
} 
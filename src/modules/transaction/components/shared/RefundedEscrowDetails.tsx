"use client";

import { Typography } from "@/components/ui/typography";
import { RefundedEscrowDetailsProps, getToEntryArray } from "@/modules/shared.types";
import { Bitcoin, Shield, Users, Zap } from "lucide-react";
import { calculateTotalBTC, countUniqueRecipients } from "../../utils/transactionDetailsHelpers";
import RecipientsList from "./RecipientsList";

export default function RefundedEscrowDetails({ transaction }: RefundedEscrowDetailsProps) {
  const totalBTC = calculateTotalBTC(transaction);

  const recipientCount = countUniqueRecipients(transaction);

  return (
    <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">
      {/* Title */}
      <Typography variant="large" className="text-white">Basic Escrow</Typography>
      
      {/* Stats Information (without cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total BTC Info */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Bitcoin size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Total BTC</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {totalBTC.toFixed(8)} BTC
            </Typography>
          </div>
        </div>

        {/* Total Recipients Info */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Users size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Total recipients</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {recipientCount}
            </Typography>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Zap size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Status</Typography>
            <Typography variant="base" className="text-[#F64C4C] font-semibold mt-2">
              Refunded
            </Typography>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#424444] h-[1px]" />

      {/* Recipients Section */}
      <Typography variant="large" className="text-white">Recipients</Typography>
      
      <RecipientsList 
        recipients={getToEntryArray(transaction)}
        showTimestamps={false} 
      />

      <div className="container-gray mt-6">
        <div className="flex items-start gap-3">
          <span className="bg-[#4F3F27] p-2 rounded-full">
            <Shield color="#FEB64D" />
          </span>
          <div>
            <Typography variant="base" className="text-white font-semibold">
              Fully Trustless
            </Typography>
            <Typography className="text-[#9F9F9F] mt-1">
              Escrow powered by Internet Computer&apos;s native Bitcoin integration.
              No bridge. No wrap. Fully trustless.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
} 
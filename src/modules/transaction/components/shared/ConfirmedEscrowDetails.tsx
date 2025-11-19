"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ConfirmedEscrowActionsProps, getToEntryArray } from "@/modules/shared.types";
import { Bitcoin, CircleAlert, CircleCheckBig, Shield, Users, Zap } from "lucide-react";
import { calculateTotalBTC, countUniqueRecipients } from "../../utils/transactionDetailsHelpers";
import RecipientsList from "./RecipientsList";

export default function ConfirmedEscrowDetails({ 
  transaction, 
  onRelease, 
  onRefund, 
  isLoading 
}: ConfirmedEscrowActionsProps) {
  const totalBTC = calculateTotalBTC(transaction);

  const recipientCount = countUniqueRecipients(transaction);

  const handleRelease = () => {
    onRelease?.(transaction.id);
  };

  const handleRefund = () => {
    onRefund?.();
  };

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
            <Typography variant="base" className="text-blue-400 font-semibold mt-2">
              Active
            </Typography>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#424444] h-[1px]" />

      {/* Recipients List */}
      <RecipientsList 
        recipients={getToEntryArray(transaction)}
        showTimestamps={false} 
      />

      <hr className="my-6 text-[#424444] h-[1px]" />

      {/* Action Buttons */}
      <div className="space-y-6">
        <Typography variant="large" className="text-white">
          Escrow Actions
        </Typography>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleRelease}
            disabled={isLoading === "release" || isLoading === "refund"}
            className="bg-[#FEB64D] text-black hover:bg-[#FEB64D]/90 font-semibold h-10"
          >
            {isLoading === "release" ? (
              <svg
                className="animate-spin h-4 w-4 mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <CircleCheckBig className="w-4 h-4 mr-2" />
            )}
            {isLoading === "release" ? "Releasing..." : "Release Payment"}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefund}
            disabled={isLoading === "refund" || isLoading === "release"}
            className="border-[#7A7A7A] text-white hover:bg-[#404040] h-10"
          >
            {isLoading === "refund" ? (
              <svg
                className="animate-spin h-4 w-4 mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <CircleAlert className="w-4 h-4 mr-2" />
            )}
            {isLoading === "refund" ? "Refunding..." : "Refund"}
          </Button>
        </div>

        {/* Warning Banner */}
        <div className="bg-[#48351A] border border-[#BD822D] rounded-[10px] p-4">
          <div className="flex items-start space-x-3">
            <CircleAlert className="w-5 h-5 text-[#FEB64D] mt-0.5 flex-shrink-0" />
            <Typography variant="small" className="text-white">
              Note: Release payment only when you&apos;re satisfied with the delivered work or received goods.
            </Typography>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
          <div className="flex items-start space-x-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[#FEB64D]" />
            </div>
            <div className="space-y-2">
              <Typography variant="base" className="text-white font-semibold">
                Smart contract execution
              </Typography>
              <Typography variant="small" className="text-[#9F9F9F]">
                Funds are locked and will be released by smart contract logic. No human mediation.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { escrowFormSchema } from "@/validation/escrow";
import { ChevronDown, ChevronUp, Loader2, Send, Shield } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

type FormData = z.infer<typeof escrowFormSchema>;

interface MilestoneSummaryProps {
  form: UseFormReturn<FormData>;
  handleInitiateEscrow: () => void;
  newTxId?: string | null;
  isEditMode?: boolean;
  isLoading?: boolean;
}

const MilestoneSummary = ({ form, handleInitiateEscrow, isEditMode, isLoading = false }: MilestoneSummaryProps) => {
  const { watch } = form;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  const watchedMilestones = watch("milestones");
  const btcAmount = Number(watch("btcAmount")) || 0;
  const useSeiAcceleration = watch("useSeiAcceleration");

  // Fee calculations (these would typically come from API or constants)
  const CONVERSION_FEE_RATE = 0.002; // 0.2% conversion fee
  const SEI_NETWORK_FEE = 0.000001; // SEI network fee in BTC
  const BITCOIN_NETWORK_FEE = 0.000015; // Bitcoin network fee in BTC

  const calculateMilestoneFees = (milestoneAmount: number) => {
    const conversionFee = milestoneAmount * CONVERSION_FEE_RATE;
    const networkFee = useSeiAcceleration ? SEI_NETWORK_FEE : BITCOIN_NETWORK_FEE;
    const totalFees = conversionFee + networkFee;
    const totalWithFees = milestoneAmount + totalFees;

    return {
      amount: milestoneAmount,
      conversionFee,
      networkFee,
      totalFees,
      totalWithFees
    };
  };

  const totalMilestoneAmount = watchedMilestones?.reduce((sum, milestone) => sum + (Number(milestone.allocation) || 0), 0) || 0;
  const totalFees = watchedMilestones?.reduce((sum, milestone) => {
    const fees = calculateMilestoneFees(Number(milestone.allocation) || 0);
    return sum + fees.totalFees;
  }, 0) || 0;
  const grandTotal = totalMilestoneAmount + totalFees;

  const displayedMilestones = showAllMilestones ? watchedMilestones : watchedMilestones?.slice(0, 2);

  return (
    <div>
      <Card className="bg-[#2B2B2B] border-[#424444] sticky top-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Typography variant="large" className="text-white">Milestone Summary</Typography>
            <Shield className="w-5 h-5 text-[#FEB64D]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <Typography variant="base" className="text-[#A1A1A1]">Status</Typography>
            <span className="bg-[#FEB64D] text-black text-xs px-2 py-1 rounded-full font-medium">
              Pending
            </span>
          </div>

          {/* Total Deposit */}
          <div className="flex items-center justify-between">
            <Typography variant="base" className="text-[#A1A1A1]">Total deposit</Typography>
            <Typography variant="base" className="text-white font-medium">
              {btcAmount.toFixed(8)} BTC
            </Typography>
          </div>

          {/* Recipients */}
          <div className="flex items-center justify-between">
            <Typography variant="base" className="text-[#A1A1A1]">Milestones</Typography>
            <Typography variant="base" className="text-white font-medium">
              {watchedMilestones?.length || 0}
            </Typography>
          </div>

          {/* Breakdown Toggle */}
          <div className="pt-2 border-t border-[#424444]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full justify-between text-[#A1A1A1] hover:text-white hover:bg-[#404040] p-2"
            >
              <span>Milestone Breakdown</span>
              {showBreakdown ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Milestone Breakdown */}
          {showBreakdown && (
            <div className="space-y-3 pt-2">
              {displayedMilestones?.map((milestone, index) => {
                const fees = calculateMilestoneFees(Number(milestone.allocation) || 0);
                return (
                  <div key={milestone.id} className="bg-[#1F1F1F] border border-[#424444] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Typography variant="small" className="text-[#FEB64D] font-medium">
                        {milestone.title || `Milestone ${index + 1}`}
                      </Typography>
                      <Typography variant="small" className="text-white">
                        {milestone.frequency}
                      </Typography>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#A1A1A1]">Amount:</span>
                        <span className="text-white">{fees.amount.toFixed(8)} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1A1]">Conversion fee:</span>
                        <span className="text-white">-{fees.conversionFee.toFixed(8)} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1A1]">
                          {useSeiAcceleration ? 'SEI network fee:' : 'Bitcoin network fee:'}
                        </span>
                        <span className="text-white">-{fees.networkFee.toFixed(8)} BTC</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#424444]">
                        <span className="text-[#FEB64D] font-medium">Total with fees:</span>
                        <span className="text-[#FEB64D] font-medium">{fees.totalWithFees.toFixed(8)} BTC</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Show All/Show Less Toggle */}
              {watchedMilestones && watchedMilestones.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllMilestones(!showAllMilestones)}
                  className="w-full text-[#FEB64D] hover:text-[#FEB64D] hover:bg-[#FEB64D]/10"
                >
                  {showAllMilestones ? 'Show Less' : `Show All ${watchedMilestones.length} Milestones`}
                </Button>
              )}

              {/* Total Summary */}
              <div className="bg-[#1F374F] border border-[#0077FF] rounded-lg p-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#71B5FF]">Total milestone amount:</span>
                    <span className="text-white">{totalMilestoneAmount.toFixed(8)} BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71B5FF]">Total fees:</span>
                    <span className="text-white">-{totalFees.toFixed(8)} BTC</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#0077FF]">
                    <span className="text-[#71B5FF] font-medium">Grand total:</span>
                    <span className="text-[#71B5FF] font-medium">{grandTotal.toFixed(8)} BTC</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trustless Escrow Info */}
          <div className="bg-[#1F374F] border border-[#007AFF] rounded-[10px] p-3">
            <div className="flex items-start gap-2">
              <Shield size={16} color='#71B5FF' className="mt-0.5 flex-shrink-0" />
              <div>
                <Typography variant="small" className="text-[#71B5FF] font-medium mb-1">
                  Trustless Milestone Escrow
                </Typography><br />
                <Typography variant="small" className="text-white">
                  Powered by Internet
                  Computer&apos;s native Bitcoin integration. Each milestone is a separate BTC transfer with individual fees.
                </Typography>
              </div>
            </div>
          </div>

          {/* Initiate Button */}
          <Button
            onClick={() => {
              handleInitiateEscrow();
            }}
            className="w-full bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-medium gap-2"
            disabled={!watchedMilestones || watchedMilestones.length === 0 || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isLoading
              ? 'Creating Milestone...'
              : isEditMode
                ? 'Update Milestone Escrow'
                : 'Initiate Milestone Escrow'
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MilestoneSummary;

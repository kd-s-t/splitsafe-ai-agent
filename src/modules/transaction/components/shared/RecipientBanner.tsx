"use client";

import { Typography } from "@/components/ui/typography";
import { Principal } from "@dfinity/principal";
import { UserRound } from "lucide-react";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { calculateUserShare, isCurrentUserSender } from "../../utils/transactionDetailsHelpers";

export interface RecipientBannerProps {
  escrow: NormalizedTransaction;
  principal: Principal | null;
}

export function RecipientBanner({ escrow, principal }: RecipientBannerProps) {
  const statusKey = escrow.status || "unknown";
  const userShare = calculateUserShare(escrow, principal);
  const isSender = isCurrentUserSender(escrow, principal);
  
  // Only show if user is a recipient (not the sender) and escrow is not released
  const shouldShow = principal && 
    !isSender && 
    userShare.amount > 0 && 
    statusKey !== "released";

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="container-primary flex items-center gap-2 !bg-[#222222]">
      <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
        <UserRound size={18} />
      </div>
      <div>
        <Typography variant="base" className="font-semibold text-[#FEB64D]">
          You are a recipient in this escrow.
        </Typography>
        <Typography variant="small">
          Your share: {userShare.amount.toFixed(8)} BTC • {userShare.percentage}%
        </Typography>
      </div>
    </div>
  );
}

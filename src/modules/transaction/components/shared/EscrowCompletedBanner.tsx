"use client";

import type { NormalizedTransaction } from "@/modules/shared.types";
import { isMilestoneTransaction } from "@/modules/shared.types";
import { BasicEscrowCompletedBanner } from "../basic/BasicEscrowCompletedBanner";

export interface EscrowCompletedBannerProps {
  escrow: NormalizedTransaction;
}

export function EscrowCompletedBanner({ escrow }: EscrowCompletedBannerProps) {
  // Don't show banner for milestone transactions
  if (isMilestoneTransaction(escrow)) {
    return null;
  }
  
  return <BasicEscrowCompletedBanner escrow={escrow} />;
}

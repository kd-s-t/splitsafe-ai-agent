"use client";

import { motion } from "framer-motion";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { calculateTotalBTC } from "../../utils/transactionDetailsHelpers";

export interface MilestoneEscrowCompletedBannerProps {
  escrow: NormalizedTransaction;
}

export function MilestoneEscrowCompletedBanner({ escrow }: MilestoneEscrowCompletedBannerProps) {
  const statusKey = escrow.status || "unknown";
  const totalBTC = calculateTotalBTC(escrow);

  if (statusKey !== "released") {
    return null;
  }

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="rounded-xl bg-gradient-to-r from-[#FEB64D] to-[#FFD700] p-4 flex items-center justify-between mb-2"
    >
      <div>
        <div className="text-lg font-semibold text-black">Milestone Escrow completed</div>
        <div className="text-sm text-black/80">All milestone payments have been successfully distributed to recipients</div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-black">{totalBTC.toFixed(8)} BTC</div>
        <div className="text-xs text-black/80">Milestone BTC Released</div>
      </div>
    </motion.div>
  );
}

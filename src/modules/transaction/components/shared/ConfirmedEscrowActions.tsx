"use client";

import { ConfirmedEscrowActionsProps } from "@/modules/shared.types";
import ConfirmedEscrowDetails from "./ConfirmedEscrowDetails";

export default function ConfirmedEscrowActions({ onRelease, onRefund, isLoading, transaction }: ConfirmedEscrowActionsProps) {
  return (
    <ConfirmedEscrowDetails
      transaction={transaction}
      onRelease={onRelease}
      onRefund={onRefund}
      isLoading={isLoading}
    />
  );
}
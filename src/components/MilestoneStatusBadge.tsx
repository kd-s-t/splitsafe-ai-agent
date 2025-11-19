import { Badge } from '@/components/ui/badge';
import { TRANSACTION_STATUS_MAP } from '@/lib/utils';
import { isMilestoneTransaction } from '@/modules/shared.types';
import React from 'react';

import { EscrowTransaction, NormalizedTransaction } from '@/modules/shared.types';

interface MilestoneStatusBadgeProps {
  status: string;
  transaction: EscrowTransaction | NormalizedTransaction;
  className?: string;
}

const MilestoneStatusBadge: React.FC<MilestoneStatusBadgeProps> = ({
  status,
  transaction,
  className
}) => {
  // For milestone transactions, check if all milestones are completed
  if (isMilestoneTransaction(transaction) && status === "released") {
    const milestones = transaction.milestoneData?.milestones || [];
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((milestone) => 
      milestone.releasePayments && milestone.releasePayments.length > 0 && 
      milestone.releasePayments.some(payment => payment.releasedAt !== null && payment.releasedAt !== undefined)
    ).length;
    
    // If not all milestones are completed, show "Ongoing"
    if (completedMilestones < totalMilestones) {
      const variant = (TRANSACTION_STATUS_MAP["ongoing"]?.variant ?? "warning") as
        | "secondary"
        | "success"
        | "primary"
        | "error"
        | "default"
        | "outline"
        | "warning";

      return (
        <Badge variant={variant} className={className}>
          {TRANSACTION_STATUS_MAP["ongoing"]?.label || "Ongoing"}
        </Badge>
      );
    }
  }

  // Default behavior for non-milestone transactions or fully completed milestones
  const variant = (TRANSACTION_STATUS_MAP[status]?.variant ?? "default") as
    | "secondary"
    | "success"
    | "primary"
    | "error"
    | "default"
    | "outline"
    | "warning";

  return (
    <Badge variant={variant} className={className}>
      {TRANSACTION_STATUS_MAP[status]?.label || status}
    </Badge>
  );
};

export default MilestoneStatusBadge;

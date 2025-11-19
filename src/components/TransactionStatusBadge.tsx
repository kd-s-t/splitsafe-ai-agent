import { Badge } from '@/components/ui/badge';
import { TRANSACTION_STATUS_MAP } from '@/lib/utils';
import React from 'react';

interface TransactionStatusBadgeProps {
  status: string | { [key: string]: unknown };
  className?: string;
}

const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  className
}) => {
  // Handle variant objects from Motoko backend (e.g., {completed: null})
  const normalizedStatus = typeof status === 'object' && status !== null 
    ? Object.keys(status)[0] 
    : status;

  const variant = (TRANSACTION_STATUS_MAP[normalizedStatus]?.variant ?? "default") as
    | "secondary"
    | "success"
    | "primary"
    | "error"
    | "default"
    | "outline"
    | "warning";

  return (
    <Badge variant={variant} className={className}>
      {TRANSACTION_STATUS_MAP[normalizedStatus]?.label || normalizedStatus}
    </Badge>
  );
};

export default TransactionStatusBadge

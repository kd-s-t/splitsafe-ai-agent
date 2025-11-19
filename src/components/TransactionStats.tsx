"use client";

import { Bitcoin, UsersRound, Zap } from "lucide-react";
import { Typography } from "@/components/ui/typography";

interface TransactionStatsProps {
  totalBTC: number;
  recipientCount: number;
  status: string;
  statusClass?: string;
}

export default function TransactionStats({ totalBTC, recipientCount, status, statusClass }: TransactionStatsProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Active';
      case 'released':
        return 'Completed';
      case 'pending':
        return 'Awaiting Deposit';
      case 'cancelled':
        return 'Cancelled';
      case 'declined':
        return 'Declined';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-400';
      case 'released':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'cancelled':
      case 'declined':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 my-10">
      <div className="flex flex-col items-center">
        <span className="bg-[#4F3F27] p-2 rounded-full">
          <Bitcoin color="#FEB64D" />
        </span>
        <Typography variant="small" className="text-[#9F9F9F] mt-2">
          Total BTC
        </Typography>
        <span className="font-semibold">{totalBTC.toFixed(8)}</span>
      </div>

      <div className="flex flex-col items-center">
        <span className="bg-[#4F3F27] p-2 rounded-full">
          <UsersRound color="#FEB64D" />
        </span>
        <Typography variant="small" className="text-[#9F9F9F] mt-2">
          Recipients
        </Typography>
        <span className="font-semibold">{recipientCount}</span>
      </div>

      <div className="flex flex-col items-center">
        <span className="bg-[#4F3F27] p-2 rounded-full">
          <Zap color="#FEB64D" />
        </span>
        <Typography variant="small" className="text-[#9F9F9F] mt-2">
          Status
        </Typography>
        <span className={`font-semibold ${statusClass || getStatusClass(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>
    </div>
  );
} 
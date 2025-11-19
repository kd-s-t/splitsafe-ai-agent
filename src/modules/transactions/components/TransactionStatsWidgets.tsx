"use client";

import { Typography } from "@/components/ui/typography";
import { Bitcoin, Users, Zap } from "lucide-react";

interface TransactionStatsWidgetsProps {
  totalBTC: number;
  recipientCount: number;
  status: string;
  statusColor?: string;
  statusLabel?: string;
}

export function TransactionStatsWidgets({ 
  totalBTC, 
  recipientCount, 
  status, 
  statusColor = "text-white",
  statusLabel 
}: TransactionStatsWidgetsProps) {
  const getStatusLabel = (status: string) => {
    if (statusLabel) return statusLabel;
    
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
      case 'refund':
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    if (statusColor !== "text-white") return statusColor;
    
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
      case 'refund':
      case 'refunded':
        return 'text-[#F64C4C]';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total BTC Widget */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
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

      {/* Recipients Widget */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
        <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
          <Users size={24} className="text-[#FEB64D]" />
        </div>
        <div className="text-center">
          <Typography variant="small" className="text-[#9F9F9F]">Recipients</Typography>
          <Typography variant="base" className="text-white font-semibold mt-2">
            {recipientCount}
          </Typography>
        </div>
      </div>

      {/* Status Widget */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
        <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
          <Zap size={24} className="text-[#FEB64D]" />
        </div>
        <div className="text-center">
          <Typography variant="small" className="text-[#9F9F9F]">Status</Typography>
          <Typography variant="base" className={`font-semibold mt-2 ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </Typography>
        </div>
      </div>
    </div>
  );
}

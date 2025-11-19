"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Send, TrendingUp } from "lucide-react";

interface DirectTransferStats {
  totalTransfers: number;
  totalVolume: number; // in e8s
  totalFees: number; // in e8s
  averageTransferSize: number; // in e8s
  successRate: number; // percentage
}

interface DirectTransferOverviewProps {
  stats: DirectTransferStats;
}

export function DirectTransferOverview({ stats }: DirectTransferOverviewProps) {
  const formatAmount = (amount: number) => {
    return (amount / 100_000_000).toFixed(8);
  };

  const formatLargeAmount = (amount: number) => {
    const btc = amount / 100_000_000;
    if (btc >= 1) {
      return `${btc.toFixed(2)} BTC`;
    } else {
      return `${(btc * 1000).toFixed(2)} mBTC`;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Transfers */}
      <Card className="bg-[#1C1D1D] border border-[#2A2B2B]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#BCBCBC]">
            Total Transfers
          </CardTitle>
          <Send className="h-4 w-4 text-[#FEB64D]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.totalTransfers.toLocaleString()}
          </div>
          <p className="text-xs text-[#BCBCBC]">
            Direct transfers processed
          </p>
        </CardContent>
      </Card>

      {/* Total Volume */}
      <Card className="bg-[#1C1D1D] border border-[#2A2B2B]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#BCBCBC]">
            Total Volume
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatLargeAmount(stats.totalVolume)}
          </div>
          <p className="text-xs text-[#BCBCBC]">
            {formatAmount(stats.totalVolume)} BTC total
          </p>
        </CardContent>
      </Card>

      {/* Total Fees */}
      <Card className="bg-[#1C1D1D] border border-[#2A2B2B]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#BCBCBC]">
            Total Fees
          </CardTitle>
          <DollarSign className="h-4 w-4 text-[#FEB64D]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatLargeAmount(stats.totalFees)}
          </div>
          <p className="text-xs text-[#BCBCBC]">
            {formatAmount(stats.totalFees)} BTC collected
          </p>
        </CardContent>
      </Card>

      {/* Average Transfer Size */}
      <Card className="bg-[#1C1D1D] border border-[#2A2B2B]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#BCBCBC]">
            Average Size
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatLargeAmount(stats.averageTransferSize)}
          </div>
          <p className="text-xs text-[#BCBCBC]">
            {formatAmount(stats.averageTransferSize)} BTC per transfer
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

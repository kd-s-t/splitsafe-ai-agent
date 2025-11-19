"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, Hash, Send, User, XCircle } from "lucide-react";

interface DirectTransfer {
  id: string;
  from: string;
  to: string;
  amount: number; // in e8s
  memo?: string;
  merchantId?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  createdAt: number;
  completedAt?: number;
  fee: number; // in e8s
}

interface DirectTransferDisplayProps {
  transfers: DirectTransfer[];
  maxDisplay?: number;
}

export function DirectTransferDisplay({ transfers, maxDisplay = 5 }: DirectTransferDisplayProps) {
  const displayTransfers = transfers.slice(0, maxDisplay);

  const formatAmount = (amount: number) => {
    return (amount / 100_000_000).toFixed(8);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp / 1000000).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-900/20 text-green-400 border-green-500/50">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-900/20 text-red-400 border-red-500/50">Failed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/50">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-900/20 text-gray-400 border-gray-500/50">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-900/20 text-gray-400 border-gray-500/50">Unknown</Badge>;
    }
  };

  const truncatePrincipal = (principal: string) => {
    if (principal.length <= 20) return principal;
    return `${principal.slice(0, 10)}...${principal.slice(-10)}`;
  };

  return (
    <Card className="bg-[#1C1D1D] border border-[#2A2B2B]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-[#FEB64D]" />
          Direct Transfers
        </CardTitle>
        <p className="text-[#BCBCBC] text-sm">
          Recent direct transfers (no approval needed)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTransfers.length === 0 ? (
            <div className="text-center py-8">
              <Send className="w-12 h-12 text-[#BCBCBC] mx-auto mb-4" />
              <p className="text-[#BCBCBC]">No direct transfers yet</p>
              <p className="text-[#BCBCBC] text-sm">Create your first direct transfer above</p>
            </div>
          ) : (
            displayTransfers.map((transfer) => (
              <div key={transfer.id} className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transfer.status)}
                    <span className="text-white font-medium">
                      {formatAmount(transfer.amount)} BTC
                    </span>
                  </div>
                  {getStatusBadge(transfer.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#BCBCBC]" />
                    <div>
                      <span className="text-[#BCBCBC]">From:</span>
                      <p className="text-white font-mono text-xs">
                        {truncatePrincipal(transfer.from)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#BCBCBC]" />
                    <div>
                      <span className="text-[#BCBCBC]">To:</span>
                      <p className="text-white font-mono text-xs">
                        {truncatePrincipal(transfer.to)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#BCBCBC]" />
                    <div>
                      <span className="text-[#BCBCBC]">Transfer ID:</span>
                      <p className="text-white font-mono text-xs">
                        {transfer.id.slice(0, 20)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#BCBCBC]" />
                    <div>
                      <span className="text-[#BCBCBC]">Created:</span>
                      <p className="text-white text-xs">
                        {formatTimestamp(transfer.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {transfer.memo && (
                  <div className="mt-3 pt-3 border-t border-[#3A3B3B]">
                    <span className="text-[#BCBCBC] text-sm">Memo:</span>
                    <p className="text-white text-sm mt-1">{transfer.memo}</p>
                  </div>
                )}

                {transfer.merchantId && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-[#FEB64D] border-[#FEB64D]/50">
                      {transfer.merchantId}
                    </Badge>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-[#3A3B3B] flex justify-between items-center text-xs text-[#BCBCBC]">
                  <span>Fee: {formatAmount(transfer.fee)} BTC</span>
                  {transfer.completedAt && (
                    <span>Completed: {formatTimestamp(transfer.completedAt)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {transfers.length > maxDisplay && (
          <div className="mt-4 text-center">
            <p className="text-[#BCBCBC] text-sm">
              Showing {maxDisplay} of {transfers.length} transfers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

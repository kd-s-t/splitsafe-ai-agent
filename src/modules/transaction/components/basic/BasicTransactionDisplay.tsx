"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NormalizedTransaction } from "@/modules/shared.types";

interface BasicTransactionDisplayProps {
  transactions: NormalizedTransaction[];
}

export function BasicTransactionDisplay({ transactions }: BasicTransactionDisplayProps) {
  const basicTransactions = transactions.filter(tx => !tx.milestoneData || !tx.milestoneData.milestones?.length);

  return (
    <Card className="bg-[#222222] border-[#3a3a3a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Basic Escrow Transactions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {basicTransactions.slice(0, 3).map((tx) => (
            <div key={tx.id} className="bg-[#2a2a2a] rounded p-4 border-l-4 border-blue-500">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-[#BCBCBC]">ID:</label>
                  <p className="text-white font-mono">{tx.id}</p>
                </div>
                <div>
                  <label className="text-[#BCBCBC]">Title:</label>
                  <p className="text-white">{tx.title}</p>
                </div>
                <div>
                  <label className="text-[#BCBCBC]">Status:</label>
                  <p className="text-white">{tx.status}</p>
                </div>
                <div>
                  <label className="text-[#BCBCBC]">Amount:</label>
                  <p className="text-white">{parseFloat(tx.amount).toFixed(8)} BTC</p>
                </div>
                <div>
                  <label className="text-[#BCBCBC]">From:</label>
                  <p className="text-white font-mono text-xs">{tx.from}</p>
                </div>
                <div>
                  <label className="text-[#BCBCBC]">Recipients:</label>
                  <p className="text-white">{tx.to.length}</p>
                </div>
                <div>
                  <label className="text-[#BCBCBC]">Created:</label>
                  <p className="text-white">
                    {new Date(Number(tx.createdAt) / 1_000_000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-[#BCBCBC]">Type:</label>
                  <p className="text-blue-400 font-medium">Basic Escrow</p>
                </div>
              </div>
            </div>
          ))}
          {basicTransactions.length === 0 && (
            <p className="text-[#BCBCBC] text-sm text-center py-8">
              No basic escrow transactions found
            </p>
          )}
          {basicTransactions.length > 3 && (
            <p className="text-[#BCBCBC] text-sm text-center">
              ... and {basicTransactions.length - 3} more basic escrow transactions
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

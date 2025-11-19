"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { DirectTransferDisplay, DirectTransferForm, DirectTransferOverview } from "./index";

interface DirectTransfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  memo?: string;
  merchantId?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  createdAt: number;
  completedAt?: number;
  fee: number;
}

interface DirectTransferStats {
  totalTransfers: number;
  totalVolume: number;
  totalFees: number;
  averageTransferSize: number;
  successRate: number;
}

interface DirectTransferProps {
  defaultRecipient?: string;
  defaultMerchantId?: string;
}

export function DirectTransfer({ defaultRecipient, defaultMerchantId }: DirectTransferProps) {
  const { principal: userPrincipal } = useAuth();
  const [transfers, setTransfers] = useState<DirectTransfer[]>([]);
  const [stats, setStats] = useState<DirectTransferStats>({
    totalTransfers: 0,
    totalVolume: 0,
    totalFees: 0,
    averageTransferSize: 0,
    successRate: 100,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const loadDirectTransfers = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual ICP call to get user's direct transfers
        // const transfers = await getDirectTransfers(principal);
        
        // Mock data for demonstration - using dynamic user principal
        const userPrincipalText = userPrincipal?.toString() || "anonymous-user";
        const mockTransfers: DirectTransfer[] = [
          {
            id: "PGW_1234567890-sender-123456",
            from: userPrincipalText,
            to: "cebu_pacific_principal_id",
            amount: 850000000, // 0.85 BTC
            memo: "Flight: Manila → Cebu",
            merchantId: "cebu_pacific",
            status: "completed",
            createdAt: Date.now() * 1000 - 3600000000, // 1 hour ago
            completedAt: Date.now() * 1000 - 3600000000,
            fee: 850000, // 0.1% fee
          },
          {
            id: "PGW_1234567891-sender-123457",
            from: userPrincipalText,
            to: "another_merchant_principal",
            amount: 50000000, // 0.05 BTC
            memo: "Payment for services",
            merchantId: "service_provider",
            status: "completed",
            createdAt: Date.now() * 1000 - 7200000000, // 2 hours ago
            completedAt: Date.now() * 1000 - 7200000000,
            fee: 50000,
          },
        ];

        setTransfers(mockTransfers);

        // Calculate stats
        const totalTransfers = mockTransfers.length;
        const totalVolume = mockTransfers.reduce((sum, t) => sum + t.amount, 0);
        const totalFees = mockTransfers.reduce((sum, t) => sum + t.fee, 0);
        const averageTransferSize = totalTransfers > 0 ? totalVolume / totalTransfers : 0;
        const successRate = totalTransfers > 0 
          ? (mockTransfers.filter(t => t.status === "completed").length / totalTransfers) * 100 
          : 100;

        setStats({
          totalTransfers,
          totalVolume,
          totalFees,
          averageTransferSize,
          successRate,
        });
      } catch (error) {
        console.error("Failed to load direct transfers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDirectTransfers();
  }, [userPrincipal]);

  const handleTransferComplete = (transferId: string) => {
    // Refresh transfers after a new transfer is completed
    // In a real implementation, you might want to add the new transfer to the list
    console.log("Transfer completed:", transferId);
    // You could trigger a refresh here or optimistically add the transfer
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-[#2A2B2B] rounded mb-2"></div>
                <div className="h-8 bg-[#2A2B2B] rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-[#2A2B2B] rounded mb-4"></div>
            <div className="h-32 bg-[#2A2B2B] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <DirectTransferOverview stats={stats} />

      {/* Transfer Form */}
      <DirectTransferForm 
        onTransferComplete={handleTransferComplete}
        defaultRecipient={defaultRecipient}
        defaultMerchantId={defaultMerchantId}
      />

      {/* Transfer History */}
      <DirectTransferDisplay transfers={transfers} />
    </div>
  );
}

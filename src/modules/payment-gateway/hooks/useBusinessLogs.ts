import { createAnonymousActorNew } from '@/lib/internal/icp/splitDapp/splitDappNew';
import type { BusinessLog } from '@/modules/shared.types';
import { Principal } from '@dfinity/principal';
import { useCallback, useEffect, useState } from 'react';

export interface BusinessAnalytics {
  totalTransactions: number;
  totalVolume: string; // in e8s
  totalFees: string; // in e8s
  successRate: number; // percentage
  monthlyEarnings: string; // in e8s
  monthlyTransactions: number;
  apiConnectionsThisMonth: number;
}

export function useBusinessLogs(merchantPrincipal: string | null) {
  const [businessLogs, setBusinessLogs] = useState<BusinessLog[]>([]);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessLogs = useCallback(async () => {
    if (!merchantPrincipal) {
      setBusinessLogs([]);
      setAnalytics(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const actor = await createAnonymousActorNew();
      const principal = Principal.fromText(merchantPrincipal);
      const logs = await actor.getBusinessLogs(principal) as unknown[];
      
      // Convert the logs to our frontend format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const convertedLogs: BusinessLog[] = logs.map((log: any) => ({
        transactionId: String(log.transactionId),
        from: String(log.from),
        to: String(log.to),
        amount: String(log.amount),
        fee: String(log.fee),
        memo: log.memo?.[0] || undefined,
        merchantId: log.merchantId?.[0] || undefined,
        status: log.status as 'pending' | 'completed' | 'failed' | 'cancelled',
        createdAt: String(log.createdAt),
        completedAt: log.completedAt?.[0]?.toString() || undefined,
      }));

      setBusinessLogs(convertedLogs);
      
      // Calculate analytics from the logs
      const calculatedAnalytics = calculateAnalytics(convertedLogs);
      setAnalytics(calculatedAnalytics);

    } catch (err) {
      console.error('❌ [BusinessLogs] Error fetching business logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch business logs');
    } finally {
      setIsLoading(false);
    }
  }, [merchantPrincipal]);

  const calculateAnalytics = (logs: BusinessLog[]): BusinessAnalytics => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    console.log('📅 [Analytics] Current date:', now.toISOString());
    console.log('📅 [Analytics] Start of month:', startOfMonth.toISOString());
    
    // Filter logs for this month
    const monthlyLogs = logs.filter(log => {
      const logDate = new Date(Number(log.createdAt) / 1000000); // Convert from nanoseconds
      const isInMonth = logDate >= startOfMonth;
      console.log(`📅 [Analytics] Log ${log.transactionId}: ${logDate.toISOString()} - In month: ${isInMonth}`);
      return isInMonth;
    });

    console.log(`📊 [Analytics] Total logs: ${logs.length}, Monthly logs: ${monthlyLogs.length}`);

    // Calculate totals
    const totalTransactions = logs.length;
    const totalVolume = logs.reduce((sum, log) => sum + BigInt(log.amount), BigInt(0)).toString();
    const totalFees = logs.reduce((sum, log) => sum + BigInt(log.fee), BigInt(0)).toString();
    
    // Calculate success rate - check for both string and object formats
    const completedTransactions = logs.filter(log => {
      const isCompleted = log.status === 'completed' || 
                         (typeof log.status === 'object' && (log.status as { completed?: unknown })?.completed !== undefined);
      console.log(`✅ [Analytics] Log ${log.transactionId} status:`, log.status, 'isCompleted:', isCompleted);
      return isCompleted;
    }).length;
    console.log(`✅ [Analytics] Completed transactions: ${completedTransactions} out of ${totalTransactions}`);
    const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;
    
    // Calculate monthly metrics
    const completedMonthlyLogs = monthlyLogs.filter(log => {
      return log.status === 'completed' || 
             (typeof log.status === 'object' && (log.status as { completed?: unknown })?.completed !== undefined);
    });
    console.log(`💰 [Analytics] Completed monthly logs: ${completedMonthlyLogs.length}`);
    
    const monthlyEarnings = completedMonthlyLogs
      .reduce((sum, log) => sum + BigInt(log.amount), BigInt(0))
      .toString();
    
    const monthlyTransactions = monthlyLogs.length;
    console.log(`📊 [Analytics] Monthly earnings: ${monthlyEarnings}, Monthly transactions: ${monthlyTransactions}`);
    
    // Count unique API connections this month (based on unique merchantIds)
    const uniqueMerchantIds = new Set(
      monthlyLogs
        .filter(log => log.merchantId)
        .map(log => log.merchantId)
    );
    const apiConnectionsThisMonth = uniqueMerchantIds.size;

    return {
      totalTransactions,
      totalVolume,
      totalFees,
      successRate,
      monthlyEarnings,
      monthlyTransactions,
      apiConnectionsThisMonth,
    };
  };

  useEffect(() => {
    fetchBusinessLogs();
  }, [fetchBusinessLogs]);

  return {
    businessLogs,
    analytics,
    isLoading,
    error,
    refetch: fetchBusinessLogs,
  };
}

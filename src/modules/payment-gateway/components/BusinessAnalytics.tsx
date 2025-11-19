'use client';

import { useAuth } from '@/contexts/auth-context';
import { Activity, DollarSign, TrendingUp, Users, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useBusinessLogs } from '../hooks/useBusinessLogs';

interface BusinessAnalyticsProps {
  merchantPrincipal?: string;
}

interface ChartDataPoint {
  timestamp: string;
  amount: number;
  transactions: number;
  fees: number;
}

export function BusinessAnalytics({ merchantPrincipal }: BusinessAnalyticsProps) {
  const { principal } = useAuth();
  const principalToUse = merchantPrincipal || principal?.toString();
  
  const { businessLogs, analytics, isLoading, error } = useBusinessLogs(principalToUse || null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const loadChartData = useCallback(() => {
    if (!businessLogs.length) {
      setChartData([]);
      return;
    }

    const now = new Date();
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const rangeMs = timeRanges[timeRange];
    const startTime = new Date(now.getTime() - rangeMs);

    // Group transactions by time intervals
    const intervalMs = timeRange === '24h' ? 60 * 60 * 1000 : // 1 hour for 24h
                      timeRange === '7d' ? 24 * 60 * 60 * 1000 : // 1 day for 7d
                      24 * 60 * 60 * 1000; // 1 day for 30d

    const intervals: { [key: string]: ChartDataPoint } = {};

    businessLogs.forEach(log => {
      const logDate = new Date(Number(log.createdAt) / 1000000);
      if (logDate < startTime) return;

      const intervalStart = new Date(Math.floor(logDate.getTime() / intervalMs) * intervalMs);
      const intervalKey = intervalStart.toISOString();

      if (!intervals[intervalKey]) {
        intervals[intervalKey] = {
          timestamp: intervalKey,
          amount: 0,
          transactions: 0,
          fees: 0,
        };
      }

      intervals[intervalKey].amount += Number(log.amount);
      intervals[intervalKey].transactions += 1;
      intervals[intervalKey].fees += Number(log.fee);
    });

    const sortedData = Object.values(intervals).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    setChartData(sortedData);
  }, [businessLogs, timeRange]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const getTotalVolume = () => {
    return chartData.reduce((sum, point) => sum + point.amount, 0);
  };

  const getTotalTransactions = () => {
    return chartData.reduce((sum, point) => sum + point.transactions, 0);
  };

  const getTotalFees = () => {
    return chartData.reduce((sum, point) => sum + point.fees, 0);
  };

  const getMaxVolume = () => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map(point => point.amount), 1);
  };

  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '24h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '7d':
      case '30d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return '';
    }
  };

  const formatAmount = (amount: number) => {
    // Convert from satoshis to BTC
    const btc = amount / 100000000;
    return btc.toFixed(8);
  };

  if (isLoading) {
    return (
      <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-5 bg-[#2A2B2B] rounded mb-3"></div>
          <div className="h-32 bg-[#2A2B2B] rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-4">
        <div className="text-red-400 text-center">
          Error loading analytics: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-[#FEB64D]" />
          <h3 className="text-white font-semibold text-lg">Business Analytics</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-1 bg-[#2A2B2B] rounded-lg p-1">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-[#FEB64D] text-black'
                  : 'text-[#BCBCBC] hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-[#BCBCBC] text-xs">Total Volume</span>
          </div>
          <div className="text-lg font-bold text-white">{formatAmount(getTotalVolume())}</div>
          <div className="text-[#BCBCBC] text-xs">BTC</div>
        </div>
        
        <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-[#BCBCBC] text-xs">Transactions</span>
          </div>
          <div className="text-lg font-bold text-white">{getTotalTransactions()}</div>
          <div className="text-[#BCBCBC] text-xs">Payments</div>
        </div>
        
        <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-[#BCBCBC] text-xs">Total Fees</span>
          </div>
          <div className="text-lg font-bold text-white">{formatAmount(getTotalFees())}</div>
          <div className="text-[#BCBCBC] text-xs">BTC</div>
        </div>
        
        <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-[#BCBCBC] text-xs">Success Rate</span>
          </div>
          <div className="text-lg font-bold text-white">{analytics?.successRate.toFixed(1) || 0}%</div>
          <div className="text-[#BCBCBC] text-xs">Completed</div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
        <div className="h-32 relative">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#BCBCBC]">
              No transaction data available for the selected time range
            </div>
          ) : (
            <>
              <svg className="w-full h-full" viewBox="0 0 400 120">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 24" fill="none" stroke="#3A3B3B" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Line chart */}
            {chartData.length > 1 && (
              <polyline
                fill="none"
                stroke="#FEB64D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartData.map((point, index) => {
                  const x = chartData.length > 1 ? (index / (chartData.length - 1)) * 380 + 10 : 10;
                  const y = 110 - ((point.amount / getMaxVolume()) * 100);
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = chartData.length > 1 ? (index / (chartData.length - 1)) * 380 + 10 : 10;
              const y = 110 - ((point.amount / getMaxVolume()) * 100);
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#FEB64D"
                    className="hover:r-4 transition-all cursor-pointer"
                  />
                  {/* Tooltip on hover */}
                  <g className="opacity-0 hover:opacity-100 transition-opacity">
                    <rect
                      x={x - 30}
                      y={y - 40}
                      width="60"
                      height="30"
                      fill="#1C1D1D"
                      stroke="#3A3B3B"
                      rx="4"
                    />
                    <text
                      x={x}
                      y={y - 25}
                      textAnchor="middle"
                      fill="#FEB64D"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {formatAmount(point.amount)}
                    </text>
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      fill="#BCBCBC"
                      fontSize="8"
                    >
                      {point.transactions} txns
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
          
          {/* Time labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            {chartData.map((point, index) => (
              <div
                key={index}
                className="text-[#BCBCBC] text-xs transform -rotate-45 origin-left"
                style={{ 
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'left center',
                  fontSize: '10px'
                }}
              >
                {formatTimeLabel(point.timestamp)}
              </div>
            ))}
          </div>
            </>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#3A3B3B]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#FEB64D] rounded-sm"></div>
            <span className="text-[#BCBCBC] text-sm">Transaction Volume</span>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      {analytics && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
            <div className="text-[#BCBCBC] text-xs mb-1">Monthly Earnings</div>
            <div className="text-lg font-bold text-white">{formatAmount(Number(analytics.monthlyEarnings))}</div>
            <div className="text-[#BCBCBC] text-xs">BTC this month</div>
          </div>
          
          <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
            <div className="text-[#BCBCBC] text-xs mb-1">API Connections</div>
            <div className="text-lg font-bold text-white">{analytics.apiConnectionsThisMonth}</div>
            <div className="text-[#BCBCBC] text-xs">This month</div>
          </div>
        </div>
      )}
    </div>
  );
}

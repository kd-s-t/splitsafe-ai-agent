'use client';

// import { getApiKeyManager } from '@/lib/internal/blockchain/icp/apiKeys'; // Unused for now
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface UsageChartProps {
  keyId: string;
  timeRange: '24h' | '7d' | '30d';
}

interface ChartDataPoint {
  timestamp: string;
  count: number;
  success: number;
  failed: number;
}

export function UsageChart({ timeRange }: UsageChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);


  const loadChartData = useCallback(async () => {
    setLoading(true);
    try {
      // const apiKeyManager = await getApiKeyManager(); // Unused for now
      
      // For now, show empty data since usage monitoring is not fully implemented
      // TODO: Implement getUsageHistory method in ApiKeyManager
      setChartData([]);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, []); // Removed keyId and timeRange dependencies as they're not used in the function

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const getTotalUsage = () => {
    return chartData.reduce((sum, point) => sum + point.count, 0);
  };

  const getSuccessRate = () => {
    const total = getTotalUsage();
    const successful = chartData.reduce((sum, point) => sum + point.success, 0);
    return total > 0 ? Math.round((successful / total) * 100) : 0;
  };

  const getMaxUsage = () => {
    return Math.max(...chartData.map(point => point.count), 1);
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

  if (loading) {
    return (
      <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-5 bg-[#2A2B2B] rounded mb-3"></div>
          <div className="h-32 bg-[#2A2B2B] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-[#FEB64D]" />
          <h3 className="text-white font-semibold text-lg">Usage Analytics</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-1 bg-[#2A2B2B] rounded-lg p-1">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => {/* TODO: Update timeRange */}}
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
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-[#BCBCBC] text-xs">Total Usage</span>
          </div>
          <div className="text-lg font-bold text-white">{getTotalUsage()}</div>
          <div className="text-[#BCBCBC] text-xs">API calls</div>
        </div>
        
        <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-[#BCBCBC] text-xs">Success Rate</span>
          </div>
          <div className="text-lg font-bold text-white">{getSuccessRate()}%</div>
          <div className="text-[#BCBCBC] text-xs">Successful calls</div>
        </div>
        
        <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-[#BCBCBC] text-xs">Peak Usage</span>
          </div>
          <div className="text-lg font-bold text-white">{getMaxUsage()}</div>
          <div className="text-[#BCBCBC] text-xs">Max per interval</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-3">
        <div className="h-32 flex items-end justify-between gap-1">
          {chartData.map((point, index) => {
            const height = (point.count / getMaxUsage()) * 100;
            const successHeight = (point.success / point.count) * height;
            const failedHeight = height - successHeight;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 group">
                {/* Bar */}
                <div className="w-full flex flex-col justify-end h-24 mb-2">
                  {/* Failed calls (red) */}
                  {failedHeight > 0 && (
                    <div
                      className="w-full bg-red-500/60 rounded-t-sm"
                      style={{ height: `${failedHeight}%` }}
                    />
                  )}
                  {/* Successful calls (green) */}
                  {successHeight > 0 && (
                    <div
                      className="w-full bg-green-500/60 rounded-b-sm"
                      style={{ height: `${successHeight}%` }}
                    />
                  )}
                </div>
                
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-16 bg-[#1C1D1D] border border-[#3A3B3B] rounded-lg p-2 text-xs whitespace-nowrap z-10">
                  <div className="text-white font-medium">{point.count} calls</div>
                  <div className="text-green-400">{point.success} successful</div>
                  <div className="text-red-400">{point.failed} failed</div>
                </div>
                
                {/* Time label */}
                <div className="text-[#BCBCBC] text-xs transform -rotate-45 origin-left">
                  {formatTimeLabel(point.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#3A3B3B]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/60 rounded-sm"></div>
            <span className="text-[#BCBCBC] text-sm">Successful</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500/60 rounded-sm"></div>
            <span className="text-[#BCBCBC] text-sm">Failed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

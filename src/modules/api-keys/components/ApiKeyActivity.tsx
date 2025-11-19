'use client';

// import { getApiKeyManager } from '@/lib/internal/blockchain/icp/apiKeys'; // Unused for now
import { Activity, AlertTriangle, BarChart3, Clock, Globe, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ApiKeyUsage, UsageAlert, UsagePattern } from '../types';

interface ApiKeyActivityProps {
  keyId: string;
  keyName: string;
}

export function ApiKeyActivity({ keyName }: ApiKeyActivityProps) {
  const [activeTab, setActiveTab] = useState<'usage' | 'patterns' | 'alerts'>('usage');
  const [usageHistory, setUsageHistory] = useState<ApiKeyUsage[]>([]);
  const [usagePattern, setUsagePattern] = useState<UsagePattern | null>(null);
  const [alerts, setAlerts] = useState<UsageAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivityData = useCallback(async () => {
    setLoading(true);
    try {
      // const apiKeyManager = await getApiKeyManager(); // Unused for now
      
      // For now, show empty data since usage monitoring is not fully implemented
      // TODO: Implement getUsageHistory, getUsagePatterns, and getAlerts methods in ApiKeyManager
      setUsageHistory([]);
      setUsagePattern(null);
      setAlerts([]);
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Removed keyId dependency as it's not used in the function

  useEffect(() => {
    loadActivityData();
  }, [loadActivityData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20';
  };

  if (loading) {
    return (
      <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[#2A2B2B] rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#2A2B2B] rounded"></div>
            <div className="h-4 bg-[#2A2B2B] rounded w-3/4"></div>
            <div className="h-4 bg-[#2A2B2B] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-[#FEB64D]" />
        <h3 className="text-white font-semibold text-lg">Activity Monitor - {keyName}</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#2A2B2B] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('usage')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'usage'
              ? 'bg-[#FEB64D] text-black'
              : 'text-[#BCBCBC] hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Usage History
          </div>
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'patterns'
              ? 'bg-[#FEB64D] text-black'
              : 'text-[#BCBCBC] hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Patterns
          </div>
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'bg-[#FEB64D] text-black'
              : 'text-[#BCBCBC] hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts ({alerts.length})
          </div>
        </button>
      </div>

      {/* Usage History Tab */}
      {activeTab === 'usage' && (
        <div>
          <div className="mb-4">
            <h4 className="text-white font-medium mb-3">Recent API Calls</h4>
            {usageHistory.length === 0 ? (
              <div className="text-center py-8 text-[#BCBCBC]">
                <Clock className="w-12 h-12 mx-auto mb-3 text-[#3A3B3B]" />
                <p>No usage history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usageHistory.map((usage) => (
                  <div key={usage.id} className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(usage.success)}`}>
                          {usage.success ? 'Success' : 'Failed'}
                        </span>
                        <span className="text-white font-medium">{usage.method}</span>
                        <span className="text-[#BCBCBC] text-sm">{usage.endpoint}</span>
                      </div>
                      <span className="text-[#BCBCBC] text-sm">{formatDate(usage.timestamp)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#BCBCBC]">IP:</span>
                        <span className="text-white ml-2">{usage.ipAddress || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-[#BCBCBC]">Response Time:</span>
                        <span className="text-white ml-2">{usage.responseTime || 0}ms</span>
                      </div>
                    </div>
                    {usage.errorCode && (
                      <div className="mt-2 text-red-400 text-sm">
                        Error: {usage.errorCode}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Patterns Tab */}
      {activeTab === 'patterns' && (
        <div>
          <h4 className="text-white font-medium mb-4">Usage Statistics</h4>
          {usagePattern ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Usage Stats */}
              <div className="space-y-4">
                <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-[#FEB64D]" />
                    <h5 className="text-white font-medium">Daily Usage</h5>
                  </div>
                  <div className="text-2xl font-bold text-white">{usagePattern.dailyUsage}</div>
                  <div className="text-[#BCBCBC] text-sm">API calls today</div>
                </div>
                
                <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-[#FEB64D]" />
                    <h5 className="text-white font-medium">Hourly Usage</h5>
                  </div>
                  <div className="text-2xl font-bold text-white">{usagePattern.hourlyUsage}</div>
                  <div className="text-[#BCBCBC] text-sm">API calls this hour</div>
                </div>
              </div>

              {/* Common Data */}
              <div className="space-y-4">
                <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-[#FEB64D]" />
                    <h5 className="text-white font-medium">Common Endpoints</h5>
                  </div>
                  <div className="space-y-2">
                    {usagePattern.commonEndpoints.map((endpoint, index) => (
                      <div key={index} className="text-[#BCBCBC] text-sm font-mono">
                        {endpoint}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-[#FEB64D]" />
                    <h5 className="text-white font-medium">IP Addresses</h5>
                  </div>
                  <div className="space-y-2">
                    {usagePattern.commonIpAddresses.map((ip, index) => (
                      <div key={index} className="text-[#BCBCBC] text-sm font-mono">
                        {ip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#BCBCBC]">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[#3A3B3B]" />
              <p>No usage patterns available</p>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div>
          <h4 className="text-white font-medium mb-4">Security Alerts</h4>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-[#BCBCBC]">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>No alerts - your API key is secure!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-[#2A2B2B] border border-[#3A3B3B] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-white font-medium">{alert.alertType.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-[#BCBCBC] text-sm">{formatDate(alert.timestamp)}</span>
                  </div>
                  <p className="text-[#BCBCBC] text-sm mb-3">{alert.message}</p>
                  {!alert.acknowledged && (
                    <button className="bg-[#FEB64D] hover:bg-[#FEA52D] text-black px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer">
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

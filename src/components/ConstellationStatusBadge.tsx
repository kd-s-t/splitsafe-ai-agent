'use client';

import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

export function ConstellationStatusBadge() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('https://l0-lb-integrationnet.constellationnetwork.io/cluster/info');
        if (response.ok) {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch {
        setStatus('disconnected');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500 hover:bg-green-600';
      case 'disconnected': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '🔒 Legal Compliance Active';
      case 'disconnected': return ' Compliance Offline';
      default: return '🔄 Checking Compliance...';
    }
  };

  return (
    <Badge 
      className={`${getStatusColor()} text-white cursor-pointer`}
      title="Constellation Network Legal Compliance Status"
    >
      {getStatusText()}
    </Badge>
  );
}

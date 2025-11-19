// API Keys module types

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'revoked' | 'expired';
  lastUsed: string | null;
  revokedAt: string | null;
  permissions: string[];
  createdAt: string;
  owner?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions?: string[];
}


export interface ApiKeyState {
  apiKeys: ApiKey[];
  showKeys: { [key: string]: boolean };
  loading: boolean;
  error: string | null;
}

export interface ApiKeyActions {
  createNewKey: () => void;
  revokeKey: (id: string) => void;
  copyToClipboard: (text: string) => void;
  toggleKeyVisibility: (id: string) => void;
  setShowKeys: (keys: { [key: string]: boolean }) => void;
  setApiKeys: (keys: ApiKey[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface ApiKeyUtils {
  maskKey: (key: string) => string;
  generateApiKey: () => string;
  formatDate: (dateString: string) => string;
}

// Usage Monitoring Types
export interface ApiKeyUsage {
  id: string;
  keyId: string;
  timestamp: string;
  endpoint: string;
  method: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  responseTime?: number;
  errorCode?: string;
}

export interface UsagePattern {
  keyId: string;
  dailyUsage: number;
  hourlyUsage: number;
  lastUsed: string;
  commonEndpoints: string[];
  commonIpAddresses: string[];
  suspiciousActivity: boolean;
}

export interface UsageAlert {
  id: string;
  keyId: string;
  alertType: 'usage_spike' | 'new_ip_address' | 'failed_authentication' | 'unusual_pattern' | 'key_compromise_suspected';
  timestamp: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

import { useAuth } from '@/contexts/auth-context';
import { getApiKeyManager } from '@/lib/internal/icp/apiKeys';
import type { ApiKey as BackendApiKey } from '@/lib/internal/icp/types';
import { useCallback, useEffect, useState } from 'react';
import { API_KEY_CONSTANTS, API_KEY_MESSAGES } from './constants';
import { ApiKey, ApiKeyActions, ApiKeyState, ApiKeyUtils, CreateApiKeyRequest } from './types';

// Convert backend ApiKey to frontend ApiKey
const convertBackendApiKey = (backendKey: BackendApiKey): ApiKey => {
  // Helper function to safely convert timestamp to ISO string
  const safeTimestampToISO = (timestamp: unknown): string | null => {
    if (!timestamp) return null;
    try {
      const numTimestamp = Number(timestamp);
      if (isNaN(numTimestamp) || numTimestamp <= 0) return null;
      
      // Convert from nanoseconds to milliseconds if needed
      // ICP timestamps are typically in nanoseconds, JavaScript Date expects milliseconds
      let milliseconds = numTimestamp;
      if (numTimestamp > 1e15) { // If timestamp is larger than year 2001 in milliseconds
        milliseconds = numTimestamp / 1e6; // Convert nanoseconds to milliseconds
      }
      
      const date = new Date(milliseconds);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch (error) {
      console.warn('Failed to convert timestamp:', timestamp, error);
      return null;
    }
  };

  // Helper function to convert Motoko variant status to string
  const convertStatus = (status: unknown): 'active' | 'revoked' | 'expired' => {
    if (typeof status === 'string') return status as 'active' | 'revoked' | 'expired';
    if (typeof status === 'object' && status !== null) {
      if ('active' in status) return 'active';
      if ('revoked' in status) return 'revoked';
      if ('expired' in status) return 'expired';
    }
    return 'active'; // Default fallback
  };

  // Helper function to convert Motoko variant permissions to strings
  const convertPermissions = (permissions: unknown[]): string[] => {
    if (!Array.isArray(permissions)) return [];
    
    return permissions.map(permission => {
      if (typeof permission === 'string') {
        return permission;
      } else if (permission && typeof permission === 'object') {
        // Handle variant objects from canister
        if ('escrow_create' in permission) return 'escrow_create';
        if ('escrow_read' in permission) return 'escrow_read';
        if ('escrow_update' in permission) return 'escrow_update';
        if ('escrow_delete' in permission) return 'escrow_delete';
        if ('milestone_release' in permission) return 'milestone_release';
        if ('webhook_manage' in permission) return 'webhook_manage';
        if ('admin' in permission) return 'admin';
        return JSON.stringify(permission);
      } else {
        return String(permission);
      }
    });
  };

  return {
    id: backendKey.id,
    name: backendKey.name,
    key: backendKey.key,
    status: convertStatus(backendKey.status),
    lastUsed: safeTimestampToISO(backendKey.lastUsed),
    revokedAt: safeTimestampToISO(backendKey.revokedAt),
    permissions: convertPermissions(backendKey.permissions),
    createdAt: safeTimestampToISO(backendKey.createdAt) || new Date().toISOString(),
    owner: typeof backendKey.owner === 'string' ? backendKey.owner : String(backendKey.owner)
  };
};

// Initial state
const initialState: ApiKeyState = {
  apiKeys: [],
  showKeys: {},
  loading: false,
  error: null
};

/**
 * Custom hook for API key management
 */
export function useApiKeys() {
  const [state, setState] = useState<ApiKeyState>(initialState);
  const { principal } = useAuth();

  // Load API keys from backend
  const loadApiKeys = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if user is authenticated
      if (!principal) {
        setState(prev => ({ ...prev, loading: false, error: null }));
        return;
      }
      
      const apiKeyManager = await getApiKeyManager();
      
      try {
        const result = await apiKeyManager.listApiKeys(principal.toString());
        
        // Check if result has keys property (success case)
        if (result && typeof result === 'object' && 'keys' in result) {
          const okResult = result as { keys: BackendApiKey[]; total: number };
          // listApiKeys always returns ApiKeyListResult with keys and total
          const convertedKeys = okResult.keys.map(convertBackendApiKey);
          setState(prev => ({ ...prev, apiKeys: convertedKeys, loading: false }));
        } else {
          const errResult = result as unknown as { err: unknown };
          setState(prev => ({ ...prev, error: `API keys request failed: ${errResult.err}`, loading: false }));
        }
      } catch (error) {
        throw error;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to load API keys: ${error}`, 
        loading: false 
      }));
    }
  }, [principal]);

  // Load API keys on mount - but only if we have a principal
  useEffect(() => {
    // Only load API keys if we have a principal (user is authenticated)
    if (principal) {
      loadApiKeys();
    }
  }, [loadApiKeys, principal]);

  // Utility functions
  const utils: ApiKeyUtils = {
    maskKey: (key: string) => {
      if (key.length <= API_KEY_CONSTANTS.MASK_LENGTH) {
        return '•'.repeat(key.length);
      }
      return key.substring(0, API_KEY_CONSTANTS.VISIBLE_CHARS) + 
             '•'.repeat(key.length - API_KEY_CONSTANTS.MASK_LENGTH) + 
             key.substring(key.length - API_KEY_CONSTANTS.VISIBLE_CHARS);
    },

    generateApiKey: () => {
      const random1 = Math.random().toString(36).substring(2, 15);
      const random2 = Math.random().toString(36).substring(2, 15);
      const random3 = Math.random().toString(36).substring(2, 15);
      return `${API_KEY_CONSTANTS.LIVE_PREFIX}${random1}${random2}${random3}`;
    },

    formatDate: (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
    }
  };

  // Actions
  const actions: ApiKeyActions = {
    createNewKey: useCallback(async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const apiKeyManager = await getApiKeyManager();
        // Let the backend handle all validation and name generation
        if (!principal) {
          setState(prev => ({ ...prev, error: 'No principal available', loading: false }));
          return;
        }
        
        const result = await apiKeyManager.createApiKey(String(principal), {
          name: "", // Empty name - backend will generate it
          permissions: [...API_KEY_CONSTANTS.DEFAULT_PERMISSIONS]
        });

        if ('ok' in result) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: null
          }));
          // Reload API keys to get the updated list
          await loadApiKeys();
        } else {
          // Handle different backend error types
          let errorMessage = 'Failed to create API key';
          
          // Handle variant error objects from canister
          if (result.err && typeof result.err === 'object') {
            if ('rate_limit_exceeded' in result.err) {
              errorMessage = API_KEY_MESSAGES.ERROR.MAX_KEYS_REACHED;
            } else if ('invalid_permissions' in result.err) {
              errorMessage = 'Invalid permissions specified';
            } else if ('unauthorized' in result.err) {
              errorMessage = 'You are not authorized to create API keys';
            } else if ('key_not_found' in result.err) {
              errorMessage = 'API key not found';
            } else {
              errorMessage = 'An unexpected error occurred';
            }
          } else if (typeof result.err === 'string') {
            // Handle string errors
            switch (result.err) {
              case 'rate_limit_exceeded':
                errorMessage = API_KEY_MESSAGES.ERROR.MAX_KEYS_REACHED;
                break;
              case 'invalid_permissions':
                errorMessage = 'Invalid permissions specified';
                break;
              case 'unauthorized':
                errorMessage = 'You are not authorized to create API keys';
                break;
              default:
                errorMessage = result.err;
            }
          } else {
            errorMessage = 'An unexpected error occurred';
          }
          
          setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        }
      } catch {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to create API key', 
          loading: false 
        }));
      }
    }, [loadApiKeys, principal]),

    revokeKey: useCallback(async (id: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const apiKeyManager = await getApiKeyManager();
        
        const result = await apiKeyManager.revokeApiKey(id);

        if ('ok' in result) {
          setState(prev => ({ ...prev, loading: false }));
          // Reload API keys to get the updated list
          await loadApiKeys();
        } else {
          setState(prev => ({ ...prev, error: result.err || 'Unknown error', loading: false }));
        }
      } catch {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to revoke API key', 
          loading: false 
        }));
      }
    }, [loadApiKeys]),

    copyToClipboard: useCallback(async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        // Could add a toast notification here
      } catch {
        setState(prev => ({ ...prev, error: API_KEY_MESSAGES.ERROR.COPY_FAILED }));
      }
    }, []),

    toggleKeyVisibility: useCallback((id: string) => {
      setState(prev => ({
        ...prev,
        showKeys: {
          ...prev.showKeys,
          [id]: !prev.showKeys[id]
        }
      }));
    }, []),


    setShowKeys: useCallback((keys: { [key: string]: boolean }) => {
      setState(prev => ({ ...prev, showKeys: keys }));
    }, []),

    setApiKeys: useCallback((keys: ApiKey[]) => {
      setState(prev => ({ ...prev, apiKeys: keys }));
    }, []),

    setLoading: useCallback((loading: boolean) => {
      setState(prev => ({ ...prev, loading }));
    }, []),

    setError: useCallback((error: string | null) => {
      setState(prev => ({ ...prev, error }));
    }, [])
  };

  return {
    ...state,
    ...actions,
    ...utils,
    loadApiKeys
  };
}

/**
 * Hook for API key form management
 */
export function useApiKeyForm() {
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    name: '',
    permissions: [...API_KEY_CONSTANTS.DEFAULT_PERMISSIONS]
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateFormData = useCallback((updates: Partial<CreateApiKeyRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors when user starts typing
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = API_KEY_MESSAGES.ERROR.INVALID_NAME;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      permissions: [...API_KEY_CONSTANTS.DEFAULT_PERMISSIONS]
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateFormData,
    validateForm,
    resetForm
  };
}

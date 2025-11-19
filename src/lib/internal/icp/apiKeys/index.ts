import { Principal } from '@dfinity/principal';
import { ActorSubclass } from '@dfinity/agent';
import { createSplitDappActor } from '../splitDapp';
import { ApiKey, ApiKeyListResult, ApiKeyResult, CreateApiKeyRequest, ICPResult } from '../types';


/**
 * API Key Manager for ICP blockchain
 * Handles creation, revocation, and management of API keys
 */
export class ApiKeyManager {
  private actor: ActorSubclass<Record<string, unknown>>; // ICP Actor instance
  private canisterId: string;

  constructor(actor: ActorSubclass<Record<string, unknown>>, canisterId: string) {
    this.actor = actor;
    this.canisterId = canisterId;
  }

  /**
   * Create a new API key
   * @param targetPrincipal - The principal that will own the API key
   * @param request - API key creation request
   * @returns Promise with the created API key or error
   */
  async createApiKey(targetPrincipal: string, request: CreateApiKeyRequest): Promise<ApiKeyResult> {
    try {
      if (!this.actor) {
        return { err: 'Actor not initialized' };
      }


      const principalObj = Principal.fromText(targetPrincipal);
      const result = await (this.actor as any).createApiKey(principalObj, request); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      if ('ok' in result) {
        return { ok: this.formatApiKey(result.ok as Record<string, unknown>) };
      } else {
        return { err: result.err };
      }
    } catch (error) {
      return { err: `Failed to create API key: ${error}` };
    }
  }

  /**
   * Revoke an API key
   * @param keyId - The ID of the API key to revoke
   * @returns Promise with success or error
   */
  async revokeApiKey(keyId: string): Promise<ICPResult<void>> {
    try {
      if (!this.actor) {
        return { err: 'Actor not initialized' };
      }


      const result = await (this.actor as any).revokeApiKey(keyId); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      if ('ok' in result) {
        return { ok: undefined };
      } else {
        return { err: result.err };
      }
    } catch (error) {
      return { err: `Failed to revoke API key: ${error}` };
    }
  }

  /**
   * Get all API keys for a specific principal (admin function)
   * @param principal - The principal to get API keys for
   * @returns Promise with list of API keys
   */
  async listApiKeysForPrincipal(principal: string): Promise<ApiKeyListResult> {
    try {
      if (!this.actor) {
        return { keys: [], total: 0 };
      }


      const principalObj = Principal.fromText(principal);
      const result = await (this.actor as any).listApiKeysForPrincipal(principalObj); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      if ('ok' in result) {
        const formattedKeys = result.ok.keys.map((key: unknown) => this.formatApiKey(key as Record<string, unknown>));
        return {
          keys: formattedKeys,
          total: result.ok.total
        };
      } else {
        return { keys: [], total: 0 };
      }
    } catch {
      return { keys: [], total: 0 };
    }
  }

  /**
   * Get all API keys for a specific principal
   * @param principal - The principal to get API keys for
   * @returns Promise with list of API keys
   */
  async listApiKeys(principal: string): Promise<ApiKeyListResult> {
    try {
      if (!this.actor) {
        return { keys: [], total: 0 };
      }

      const principalObj = Principal.fromText(principal);
      const result = await (this.actor as any).listApiKeys(principalObj); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      if ('ok' in result) {
        const formattedKeys = result.ok.keys.map((key: unknown) => this.formatApiKey(key as Record<string, unknown>));
        return {
          keys: formattedKeys,
          total: result.ok.total
        };
      } else {
        return { keys: [], total: 0 };
      }
    } catch {
      return { keys: [], total: 0 };
    }
  }

  /**
   * Get a specific API key by ID
   * @param keyId - The ID of the API key
   * @returns Promise with the API key or error
   */
  async getApiKey(keyId: string): Promise<ApiKeyResult> {
    try {
      if (!this.actor) {
        return { err: 'Actor not initialized' };
      }

      const result = await (this.actor as any).getApiKey(keyId); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      if ('ok' in result) {
        return { ok: this.formatApiKey(result.ok as Record<string, unknown>) };
      } else {
        return { err: result.err };
      }
    } catch (error) {
      return { err: `Failed to fetch API key: ${error}` };
    }
  }

  async getApiKeyByKey(key: string): Promise<ApiKeyResult> {
    try {
      if (!this.actor) {
        return { err: 'Actor not initialized' };
      }

      const result = await (this.actor as any).getApiKeyByKey(key); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      if ('ok' in result) {
        return { ok: this.formatApiKey(result.ok as Record<string, unknown>) };
      } else {
        return { err: result.err };
      }
    } catch (error) {
      return { err: `Failed to get API key: ${error}` };
    }
  }

  /**
   * Validate API key and update last used timestamp
   * @param key - API key string to validate
   * @param requiredPermission - Required permission for the operation
   * @returns Promise with principal or error
   */
  async validateApiKey(key: string, requiredPermission: string): Promise<{ ok: unknown; err?: never } | { err: string; ok?: never }> {
    try {
      if (!this.actor) {
        return { err: 'Actor not initialized' };
      }

      const result = await (this.actor as any).validateApiKey(key, requiredPermission); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      if ('ok' in result) {
        return { ok: result.ok };
      } else {
        return { err: result.err };
      }
    } catch (error) {
      return { err: `Failed to validate API key: ${error}` };
    }
  }

  /**
   * Format API key data from ICP response
   * @param rawKey - Raw API key data from ICP
   * @returns Formatted API key
   */
  private formatApiKey(rawKey: Record<string, unknown>): ApiKey {
    const convertedPermissions = this.convertPermissions((rawKey.permissions as unknown[]) || []);
    
    let ownerString = '';
    if (rawKey.owner) {
      if (typeof rawKey.owner === 'string') {
        ownerString = rawKey.owner;
      } else if (rawKey.owner.toString) {
        ownerString = rawKey.owner.toString();
      } else {
        ownerString = String(rawKey.owner);
      }
    }
    
    
    const formattedKey: ApiKey = {
      id: (rawKey.id as string) || '',
      name: (rawKey.name as string) || '',
      key: (rawKey.key as string) || '',
      status: (rawKey.status as string) || 'active',
      lastUsed: (rawKey.lastUsed as bigint) || null,
      revokedAt: (rawKey.revokedAt as bigint) || null,
      permissions: convertedPermissions,
      createdAt: (rawKey.createdAt as bigint) || BigInt(0),
      owner: ownerString
    };
    
    return formattedKey;
  }

  private convertPermissions(permissions: unknown[]): string[] {
    if (!Array.isArray(permissions)) {
      return [];
    }
    
    const result = permissions.map((permission) => {
      if (typeof permission === 'string') {
        return permission;
      } else if (permission && typeof permission === 'object') {
        if ('escrow_create' in permission) {
          return 'escrow_create';
        }
        if ('escrow_read' in permission) {
          return 'escrow_read';
        }
        if ('escrow_update' in permission) {
          return 'escrow_update';
        }
        if ('escrow_delete' in permission) {
          return 'escrow_delete';
        }
        if ('milestone_release' in permission) {
          return 'milestone_release';
        }
        if ('webhook_manage' in permission) {
          return 'webhook_manage';
        }
        if ('admin' in permission) {
          return 'admin';
        }
        return JSON.stringify(permission);
      } else {
        return String(permission);
      }
    });
    
    return result;
  }

  /**
   * Validate API key format
   * @param key - API key string to validate
   * @returns True if valid format
   */
  static isValidApiKeyFormat(key: string): boolean {
    return key.startsWith('sk_live_') && key.length > 20;
  }

  /**
   * Mask API key for display
   * @param key - API key to mask
   * @returns Masked API key string
   */
  static maskApiKey(key: string): string {
    if (key.length <= 24) {
      return '•'.repeat(key.length);
    }
    return key.substring(0, 12) + '•'.repeat(key.length - 24) + key.substring(key.length - 12);
  }
}

/**
 * Factory function to create API Key Manager instance
 * @param actor - ICP Actor instance
 * @param canisterId - Canister ID for API key management
 * @returns ApiKeyManager instance
 */
export function createApiKeyManager(actor: ActorSubclass<Record<string, unknown>>, canisterId: string): ApiKeyManager {
  return new ApiKeyManager(actor, canisterId);
}

/**
 * Get the API key manager with dynamic actor creation
 * @returns Promise<ApiKeyManager> - API key manager instance
 */
export async function getApiKeyManager(): Promise<ApiKeyManager> {
  try {
    const actor = await createSplitDappActor();
    const canisterId = process.env.VITE_CANISTER_ID_SPLIT_DAPP || '';
    return new ApiKeyManager(actor, canisterId);
  } catch {
    throw new Error('Failed to initialize API key manager');
  }
}
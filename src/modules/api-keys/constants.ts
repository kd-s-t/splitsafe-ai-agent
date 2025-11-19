// API Keys module constants

export const API_KEY_CONSTANTS = {
  // Key prefixes
  LIVE_PREFIX: 'sk_live_',
  TEST_PREFIX: 'sk_test_',
  
  // Key limits
  MAX_KEYS_PER_USER: 10,
  KEY_LENGTH: 64,
  
  // Default permissions
  DEFAULT_PERMISSIONS: ['escrow_create', 'escrow_read', 'escrow_update'],
  
  // Status values
  STATUS: {
    ACTIVE: 'active',
    REVOKED: 'revoked',
    EXPIRED: 'expired'
  },
  
  // UI constants
  MASK_LENGTH: 24,
  VISIBLE_CHARS: 12
} as const;

export const API_KEY_PERMISSIONS = [
  'escrow_create',
  'escrow_read', 
  'escrow_update',
  'escrow_delete',
  'milestone_release',
  'webhook_manage',
  'admin'
] as const;

/**
 * Convert string permissions to Motoko variant format
 */
export function convertToMotokoPermissions(permissions: string[]) {
  return permissions.map(perm => {
    switch (perm) {
      case 'escrow_create': return { escrow_create: null };
      case 'escrow_read': return { escrow_read: null };
      case 'escrow_update': return { escrow_update: null };
      case 'escrow_delete': return { escrow_delete: null };
      case 'milestone_release': return { milestone_release: null };
      case 'webhook_manage': return { webhook_manage: null };
      case 'admin': return { admin: null };
      default: throw new Error(`Unknown permission: ${perm}`);
    }
  });
}

export const API_KEY_MESSAGES = {
  SUCCESS: {
    CREATED: 'API key created successfully',
    REVOKED: 'API key revoked successfully',
    COPIED: 'API key copied to clipboard'
  },
  ERROR: {
    CREATE_FAILED: 'Failed to create API key',
    REVOKE_FAILED: 'Failed to revoke API key',
    COPY_FAILED: 'Failed to copy to clipboard',
    INVALID_NAME: 'Please enter a name for your API key',
    MAX_KEYS_REACHED: 'Maximum number of API keys reached (2)'
  },
  PLACEHOLDER: {
    KEY_NAME: 'API Key Name (e.g., Production, Development)'
  }
} as const;

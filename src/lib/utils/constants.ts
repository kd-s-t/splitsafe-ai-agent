export const TRANSACTION_STATUS_MAP: Record<string, { label: string; variant: string }> = {
    released: { label: "Completed", variant: "success" },
    draft: { label: "Draft", variant: "secondary" },
    pending: { label: "Pending", variant: "primary" },
    confirmed: { label: "Active", variant: "secondary" },
    cancelled: { label: "Cancelled", variant: "error" },
    declined: { label: "Declined", variant: "error" },
    refund: { label: "Refunded", variant: "error" },
    active: { label: "Active", variant: "secondary" },
    completed: { label: "Completed", variant: "success" },
};

// Transaction Status Constants
export const TRANSACTION_STATUS = {
    RELEASED: "released",
    CONFIRMED: "confirmed",
    PENDING: "pending",
    CANCELLED: "cancelled",
    REFUND: "refund",
    DECLINED: "declined",
} as const;

// SEI Network Configuration
export const SEI_NETWORKS = {
  MAINNET: {
    name: 'Mainnet',
    chainId: 'pacific-1',
    rpcUrl: 'https://rpc.seinetwork.io',
    explorerUrl: 'https://sei.explorers.guru',
    prefix: 'sei'
  },
  ATLANTIC_2: {
    name: 'Atlantic-2 Testnet',
    chainId: 'atlantic-2',
    rpcUrl: 'https://rpc.atlantic-2.seinetwork.io',
    explorerUrl: 'https://atlantic-2.sei.explorers.guru',
    prefix: 'sei'
  },
  PACIFIC_1: {
    name: 'Pacific-1 Testnet',
    chainId: 'pacific-1',
    rpcUrl: 'https://rpc.pacific-1.seinetwork.io',
    explorerUrl: 'https://pacific-1.sei.explorers.guru',
    prefix: 'sei'
  },
  ARCTIC_1: {
    name: 'Arctic-1 Testnet',
    chainId: 'arctic-1',
    rpcUrl: 'https://rpc.arctic-1.seinetwork.io',
    explorerUrl: 'https://arctic-1.sei.explorers.guru',
    prefix: 'sei'
  }
} as const;

export const SEI_DECIMALS = 6;
export const SEI_MIN_DENOM = 'usei';
export const SEI_DISPLAY_DENOM = 'SEI';

// SEI Faucet URLs for testnets
export const SEI_FAUCETS = {
  ATLANTIC_2: 'https://atlantic-2.sei.explorers.guru/faucet',
  PACIFIC_1: 'https://pacific-1.sei.explorers.guru/faucet',
  ARCTIC_1: 'https://arctic-1.sei.explorers.guru/faucet'
} as const;
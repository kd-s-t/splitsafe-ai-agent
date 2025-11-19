// Story Network Types and Interfaces
// Centralized type definitions for Story Network integration

export interface StoryNetworkConfig {
  rpcUrl: string;
  chainId: number;
  contracts: {
    ipRegistry: string;
    attributionChain: string;
    licenseManager: string;
  };
  apiKey?: string;
  environment: 'testnet' | 'mainnet' | 'development';
}

export interface StoryNetworkResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
  ipAssetId?: string;
  licenseId?: string;
}

export interface IPAsset {
  id: string;
  title: string;
  description: string;
  creator: string;
  type: 'escrow' | 'milestone_document' | 'template' | 'creative_work';
  metadata: IPAssetMetadata;
  createdAt: number;
  transactionHash: string;
}

export interface IPAssetMetadata {
  escrowId?: string;
  milestoneId?: string;
  templateId?: string;
  workType?: 'code' | 'design' | 'content' | 'media' | 'documentation' | 'contract' | 'proof_of_work' | 'signed_agreement' | 'screenshot' | 'file';
  fileHash?: string;
  originalCreator: string;
  source: 'splitsafe';
  version: string;
}

export interface AttributionChain {
  id: string;
  parentIPAssetId: string;
  childIPAssetId: string;
  relationshipType: 'escrow_derivative' | 'milestone_document' | 'template_usage' | 'creative_derivative';
  createdAt: number;
  transactionHash: string;
}

export interface License {
  id: string;
  ipAssetId: string;
  licenseType: 'escrow_license' | 'document_license' | 'template_license' | 'creative_license';
  royaltyRate: number; // 0-100 percentage
  restrictions: string[];
  validFrom: number;
  validUntil?: number;
  transactionHash: string;
}

export interface EscrowIPData {
  escrowId: string;
  title: string;
  description: string;
  creator: string;
  participants: Array<{
    principal: string;
    amount: string;
    percentage: number;
    nickname?: string;
  }>;
  totalAmount: string;
  useSeiAcceleration: boolean;
  createdAt: number;
}

export interface MilestoneDocumentIPData {
  escrowId: string;
  milestoneId: string;
  documentId: string;
  documentType: 'contract' | 'proof_of_work' | 'signed_agreement' | 'screenshot' | 'file';
  content: string;
  fileHash: string;
  uploader: string;
  createdAt: number;
}

export interface TemplateIPData {
  templateId: string;
  name: string;
  description: string;
  category: 'freelance' | 'dao_treasury' | 'milestone_bounty' | 'marketplace' | 'booking' | 'gaming';
  creator: string;
  useCases: string[];
  isPublic: boolean;
  createdAt: number;
}

export interface CreativeWorkIPData {
  escrowId: string;
  workId: string;
  workType: 'code' | 'design' | 'content' | 'media' | 'documentation';
  workHash: string;
  creator: string;
  license: 'exclusive' | 'non-exclusive' | 'royalty-free' | 'custom';
  description: string;
  createdAt: number;
}

export interface StoryNetworkClient {
  // IP Asset Management
  createEscrowIPAsset(data: EscrowIPData): Promise<StoryNetworkResponse<IPAsset>>;
  createMilestoneDocumentIP(data: MilestoneDocumentIPData): Promise<StoryNetworkResponse<IPAsset>>;
  createTemplateIP(data: TemplateIPData): Promise<StoryNetworkResponse<IPAsset>>;
  createCreativeWorkIP(data: CreativeWorkIPData): Promise<StoryNetworkResponse<IPAsset>>;
  
  // Attribution Chain Management
  createAttributionChain(parentIPAssetId: string, childIPAssetId: string, relationshipType: string): Promise<StoryNetworkResponse<AttributionChain>>;
  getAttributionChain(ipAssetId: string): Promise<StoryNetworkResponse<AttributionChain[]>>;
  verifyAttributionChain(ipAssetId: string): Promise<StoryNetworkResponse<boolean>>;
  
  // License Management
  createLicense(ipAssetId: string, licenseType: string, royaltyRate: number, restrictions: string[]): Promise<StoryNetworkResponse<License>>;
  getLicense(ipAssetId: string): Promise<StoryNetworkResponse<License>>;
  validateLicense(ipAssetId: string, user: string, action: string): Promise<StoryNetworkResponse<boolean>>;
  
  // IP Asset Queries
  getIPAsset(ipAssetId: string): Promise<StoryNetworkResponse<IPAsset>>;
  getIPAssetsByEscrow(escrowId: string): Promise<StoryNetworkResponse<IPAsset[]>>;
  getIPAssetsByCreator(creator: string): Promise<StoryNetworkResponse<IPAsset[]>>;
  
  // Network Status
  getNetworkStatus(): Promise<StoryNetworkResponse<{ connected: boolean; chainId: number; blockNumber: number }>>;
}

export interface StoryNetworkError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Event types for Story Network integration
export type StoryNetworkEvent = 
  | { type: 'IP_ASSET_CREATED'; data: IPAsset }
  | { type: 'ATTRIBUTION_CHAIN_CREATED'; data: AttributionChain }
  | { type: 'LICENSE_CREATED'; data: License }
  | { type: 'IP_ASSET_QUERIED'; data: IPAsset }
  | { type: 'ERROR'; data: StoryNetworkError };

// Configuration for different environments
export const STORY_NETWORK_ENVIRONMENTS = {
  testnet: {
    rpcUrl: process.env.STORY_RPC_URL || 'https://aeneid.storyrpc.io',
    chainId: Number(process.env.STORY_CHAIN_ID || 1513),
    contracts: {
      ipRegistry: process.env.STORY_CONTRACT_IP_REGISTRY || '0x0000000000000000000000000000000000000000',
      attributionChain: process.env.STORY_CONTRACT_ATTRIBUTION || '0x0000000000000000000000000000000000000000',
      licenseManager: process.env.STORY_CONTRACT_LICENSE || '0x0000000000000000000000000000000000000000'
    }
  },
  mainnet: {
    rpcUrl: process.env.STORY_RPC_URL || 'https://mainnet.storyrpc.io',
    chainId: Number(process.env.STORY_CHAIN_ID || 1514),
    contracts: {
      ipRegistry: process.env.STORY_CONTRACT_IP_REGISTRY || '0x0000000000000000000000000000000000000000',
      attributionChain: process.env.STORY_CONTRACT_ATTRIBUTION || '0x0000000000000000000000000000000000000000',
      licenseManager: process.env.STORY_CONTRACT_LICENSE || '0x0000000000000000000000000000000000000000'
    }
  }
} as const;

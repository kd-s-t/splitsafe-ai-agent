// Story Network Client
// Centralized client for all Story Network interactions using blockchain RPC

import { ethers } from 'ethers';
import {
  AttributionChain,
  CreativeWorkIPData,
  EscrowIPData,
  IPAsset,
  License,
  MilestoneDocumentIPData,
  STORY_NETWORK_ENVIRONMENTS,
  StoryNetworkClient,
  StoryNetworkConfig,
  StoryNetworkResponse,
  TemplateIPData
} from './types';

// Story Network IP Asset ABI (from prototype - real ABI)
const STORY_IP_ABI = [
  // Prototype create method (kept for backward compatibility in our demo)
  "function createIPAsset(string title, string description, address creator) external returns (uint256)",
  // Official registry surface (subset used):
  "function register(uint256 chainid, address tokenContract, uint256 tokenId) external returns (address)",
  "function ipId(uint256 chainId, address tokenContract, uint256 tokenId) external view returns (address)",
  // Attribution
  "function createAttributionChain(uint256 parentIP, uint256 childIP, string relationshipType) external",
  "function getAttributionChain(uint256 ipAssetId) external view returns (uint256[])",
  "function getOriginalCreator(uint256 ipAssetId) external view returns (address)",
  "function verifyAttributionChain(uint256 ipAssetId) external view returns (bool)",
  // License Management
  "function createLicense(uint256 ipAssetId, string licenseType, uint256 royaltyRate, string restrictions) external returns (uint256)",
  "function getLicense(uint256 ipAssetId) external view returns (string, uint256, string)",
  "function validateLicense(uint256 ipAssetId, address user, string action) external view returns (bool)",
  "function enforceLicense(uint256 ipAssetId, address from, address to, uint256 amount) external returns (bool)"
];

export class StoryNetworkClientImpl implements StoryNetworkClient {
  private provider: ethers.JsonRpcProvider;
  private wallet?: ethers.Wallet;
  private ipRegistry: ethers.Contract;
  private config: StoryNetworkConfig;

  constructor(config?: Partial<StoryNetworkConfig>) {
    const environment = (process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet') as keyof typeof STORY_NETWORK_ENVIRONMENTS;
    this.config = {
      ...STORY_NETWORK_ENVIRONMENTS[environment],
      ...config,
      environment: environment
    };

    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    
    // Initialize wallet if private key is provided
    if (process.env.STORY_PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(process.env.STORY_PRIVATE_KEY, this.provider);
    }

    // Initialize IP Registry contract
    this.ipRegistry = new ethers.Contract(
      this.config.contracts.ipRegistry,
      STORY_IP_ABI,
      this.wallet || this.provider
    );
  }

  // IP Asset Management
  async createEscrowIPAsset(data: EscrowIPData): Promise<StoryNetworkResponse<IPAsset>> {
    try {
      if (!this.wallet) {
        throw new Error('Story Network wallet not configured');
      }

      const creatorAddress = await this.wallet.getAddress();
      // Try to predict ipAssetId (some contracts return it in callStatic)
      let predictedId: string | undefined;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sim = await (this.ipRegistry as any).callStatic.createIPAsset(
          data.title,
          data.description,
          creatorAddress
        );
        if (sim && typeof sim.toString === 'function') predictedId = sim.toString();
      } catch {}

      const tx = await this.ipRegistry.createIPAsset(
        data.title,
        data.description,
        creatorAddress
      );

      const receipt = await tx.wait();
      // Safely attempt to extract ipAssetId from logs; fall back if not emitted
      let ipAssetId: string | undefined = predictedId;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const firstLog: any = (receipt as any)?.logs?.[0];
        const maybeId = firstLog?.args?.ipAssetId ?? firstLog?.args?.[0];
        if (maybeId !== undefined && maybeId !== null) {
          ipAssetId = maybeId.toString();
        }
      } catch {
        // ignore, will fall back below
      }

      const ipAsset: IPAsset = {
        id: ipAssetId || 'unknown',
        title: data.title,
        description: data.description,
        creator: creatorAddress,
        type: 'escrow',
        metadata: {
          escrowId: data.escrowId,
          originalCreator: creatorAddress,
          source: 'splitsafe',
          version: '1.0.0'
        },
        createdAt: data.createdAt,
        transactionHash: tx.hash
      };

      return {
        success: true,
        data: ipAsset,
        transactionHash: tx.hash,
        ipAssetId: ipAssetId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Register an existing ERC-721 as an IP asset via official registry
  async registerIpFromNft(
    chainId: number,
    tokenContract: string,
    tokenId: string | number
  ): Promise<StoryNetworkResponse<{ ipAssetId: string }>> {
    try {
      if (!this.wallet) {
        throw new Error('Story Network wallet not configured');
      }

      // Try static call to get returned ip address without spending gas (sanity)
      let predicted: string | undefined;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await (this.ipRegistry as any).callStatic.register(chainId, tokenContract, tokenId);
        if (res && typeof res === 'string') predicted = res;
      } catch {}

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (this.ipRegistry as any).register(chainId, tokenContract, tokenId);
      await tx.wait();

      // If no event parsing available, return predicted value if present
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ipAssetId = predicted || (await (this.ipRegistry as any).ipId(chainId, tokenContract, tokenId));

      return {
        success: true,
        data: { ipAssetId },
        transactionHash: tx.hash,
        ipAssetId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createMilestoneDocumentIP(data: MilestoneDocumentIPData): Promise<StoryNetworkResponse<IPAsset>> {
    try {
      if (!this.wallet) {
        throw new Error('Story Network wallet not configured');
      }

      const tx = await this.ipRegistry.createIPAsset(
        `Milestone Document: ${data.documentType}`,
        data.content,
        data.uploader
      );

      const receipt = await tx.wait();
      const ipAssetId = receipt.logs[0].args.ipAssetId.toString();

      const ipAsset: IPAsset = {
        id: ipAssetId,
        title: `Milestone Document: ${data.documentType}`,
        description: data.content,
        creator: data.uploader,
        type: 'milestone_document',
        metadata: {
          escrowId: data.escrowId,
          milestoneId: data.milestoneId,
          workType: data.documentType,
          fileHash: data.fileHash,
          originalCreator: data.uploader,
          source: 'splitsafe',
          version: '1.0.0'
        },
        createdAt: data.createdAt,
        transactionHash: tx.hash
      };

      return {
        success: true,
        data: ipAsset,
        transactionHash: tx.hash,
        ipAssetId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createTemplateIP(data: TemplateIPData): Promise<StoryNetworkResponse<IPAsset>> {
    try {
      if (!this.wallet) {
        throw new Error('Story Network wallet not configured');
      }

      const tx = await this.ipRegistry.createIPAsset(
        data.name,
        data.description,
        data.creator
      );

      const receipt = await tx.wait();
      const ipAssetId = receipt.logs[0].args.ipAssetId.toString();

      const ipAsset: IPAsset = {
        id: ipAssetId,
        title: data.name,
        description: data.description,
        creator: data.creator,
        type: 'template',
        metadata: {
          templateId: data.templateId,
          originalCreator: data.creator,
          source: 'splitsafe',
          version: '1.0.0'
        },
        createdAt: data.createdAt,
        transactionHash: tx.hash
      };

      return {
        success: true,
        data: ipAsset,
        transactionHash: tx.hash,
        ipAssetId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createCreativeWorkIP(data: CreativeWorkIPData): Promise<StoryNetworkResponse<IPAsset>> {
    try {
      if (!this.wallet) {
        throw new Error('Story Network wallet not configured');
      }

      // Use wallet address as creator (same pattern as createEscrowIPAsset)
      const creatorAddress = await this.wallet.getAddress();

      const tx = await this.ipRegistry.createIPAsset(
        `Creative Work: ${data.workType}`,
        data.description,
        creatorAddress
      );

      const receipt = await tx.wait();
      const ipAssetId = receipt.logs[0].args.ipAssetId.toString();

      const ipAsset: IPAsset = {
        id: ipAssetId,
        title: `Creative Work: ${data.workType}`,
        description: data.description,
        creator: creatorAddress,
        type: 'creative_work',
        metadata: {
          escrowId: data.escrowId,
          workType: data.workType,
          fileHash: data.workHash,
          originalCreator: data.creator,
          source: 'splitsafe',
          version: '1.0.0'
        },
        createdAt: data.createdAt,
        transactionHash: tx.hash
      };

      return {
        success: true,
        data: ipAsset,
        transactionHash: tx.hash,
        ipAssetId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Attribution Chain Management
  async createAttributionChain(parentIPAssetId: string, childIPAssetId: string, relationshipType: string): Promise<StoryNetworkResponse<AttributionChain>> {
    try {
      if (!this.wallet) {
        throw new Error('Story Network wallet not configured');
      }

      const tx = await this.ipRegistry.createAttributionChain(
        parentIPAssetId,
        childIPAssetId,
        relationshipType
      );

      const receipt = await tx.wait();
      const chainId = receipt.logs[0].args.chainId?.toString() || 'unknown';

      const attributionChain: AttributionChain = {
        id: chainId,
        parentIPAssetId,
        childIPAssetId,
        relationshipType: relationshipType as 'milestone_document' | 'escrow_derivative' | 'template_usage' | 'creative_derivative',
        createdAt: Date.now(),
        transactionHash: tx.hash
      };

      return {
        success: true,
        data: attributionChain,
        transactionHash: tx.hash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAttributionChain(ipAssetId: string): Promise<StoryNetworkResponse<AttributionChain[]>> {
    try {
      const chains = await this.ipRegistry.getAttributionChain(ipAssetId);
      
      // Convert blockchain data to AttributionChain objects
      const attributionChains: AttributionChain[] = chains.map((chain: Record<string, unknown>, index: number) => ({
        id: `chain_${ipAssetId}_${index}`,
        parentIPAssetId: chain.toString(),
        childIPAssetId: ipAssetId,
        relationshipType: 'derivative' as string,
        createdAt: Date.now(),
        transactionHash: ''
      }));

      return {
        success: true,
        data: attributionChains
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async verifyAttributionChain(ipAssetId: string): Promise<StoryNetworkResponse<boolean>> {
    try {
      const isValid = await this.ipRegistry.verifyAttributionChain(ipAssetId);
      
      return {
        success: true,
        data: isValid
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // License Management
  async createLicense(ipAssetId: string, licenseType: string, royaltyRate: number, restrictions: string[]): Promise<StoryNetworkResponse<License>> {
    try {
      if (!this.wallet) {
        throw new Error('Story Network wallet not configured');
      }

      const tx = await this.ipRegistry.createLicense(
        ipAssetId,
        licenseType,
        royaltyRate,
        restrictions.join(',')
      );

      const receipt = await tx.wait();
      const licenseId = receipt.logs[0].args.licenseId?.toString() || 'unknown';

      const license: License = {
        id: licenseId,
        ipAssetId,
        licenseType: licenseType as 'escrow_license' | 'document_license' | 'template_license' | 'creative_license',
        royaltyRate,
        restrictions,
        validFrom: Date.now(),
        transactionHash: tx.hash
      };

      return {
        success: true,
        data: license,
        transactionHash: tx.hash,
        licenseId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getLicense(ipAssetId: string): Promise<StoryNetworkResponse<License>> {
    try {
      const [licenseType, royaltyRate, restrictions] = await this.ipRegistry.getLicense(ipAssetId);
      
      const license: License = {
        id: ipAssetId,
        ipAssetId,
        licenseType,
        royaltyRate: royaltyRate.toNumber(),
        restrictions: restrictions.split(','),
        validFrom: Date.now(),
        validUntil: undefined,
        transactionHash: ''
      };

      return {
        success: true,
        data: license
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async validateLicense(ipAssetId: string, user: string, action: string): Promise<StoryNetworkResponse<boolean>> {
    try {
      const isValid = await this.ipRegistry.validateLicense(ipAssetId, user, action);
      
      return {
        success: true,
        data: isValid
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // IP Asset Queries - These would need to be implemented based on actual Story Network contract methods
  async getIPAsset(): Promise<StoryNetworkResponse<IPAsset>> {
    try {
      // This would need to be implemented based on actual Story Network contract
      // For now, return a placeholder
      return {
        success: false,
        error: 'getIPAsset not implemented - needs actual Story Network contract method'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getIPAssetsByEscrow(): Promise<StoryNetworkResponse<IPAsset[]>> {
    try {
      // This would need to be implemented based on actual Story Network contract
      return {
        success: false,
        error: 'getIPAssetsByEscrow not implemented - needs actual Story Network contract method'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getIPAssetsByCreator(): Promise<StoryNetworkResponse<IPAsset[]>> {
    try {
      // This would need to be implemented based on actual Story Network contract
      return {
        success: false,
        error: 'getIPAssetsByCreator not implemented - needs actual Story Network contract method'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Network Status
  async getNetworkStatus(): Promise<StoryNetworkResponse<{ connected: boolean; chainId: number; blockNumber: number }>> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      
      return {
        success: true,
        data: {
          connected: true,
          chainId: Number(network.chainId),
          blockNumber
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          connected: false,
          chainId: 0,
          blockNumber: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const storyNetworkClient = new StoryNetworkClientImpl();
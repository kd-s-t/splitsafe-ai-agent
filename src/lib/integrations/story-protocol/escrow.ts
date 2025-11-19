// Story Network Escrow Integration
// Functions for creating and managing IP assets for escrow transactions

import { storyNetworkClient } from './client';
import { AttributionChain, EscrowIPData, IPAsset, StoryNetworkResponse } from './types';

export interface EscrowStoryData {
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

export interface EscrowStoryResult {
  success: boolean;
  ipAssetId?: string;
  licenseId?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Create IP asset for escrow creation
 * This makes each escrow an intellectual property asset on Story Network
 */
export async function createEscrowIPAsset(escrowData: EscrowStoryData): Promise<EscrowStoryResult> {
  try {
    console.log('🎨 Creating Story Network IP asset for escrow:', escrowData.escrowId);

    const ipData: EscrowIPData = {
      escrowId: escrowData.escrowId,
      title: escrowData.title,
      description: escrowData.description,
      creator: escrowData.creator,
      participants: escrowData.participants,
      totalAmount: escrowData.totalAmount,
      useSeiAcceleration: escrowData.useSeiAcceleration,
      createdAt: escrowData.createdAt
    };

    const result = await storyNetworkClient.createEscrowIPAsset(ipData);

    if (result.success && result.data) {
      console.log('✅ Escrow IP asset created:', {
        escrowId: escrowData.escrowId,
        ipAssetId: result.ipAssetId,
        transactionHash: result.transactionHash
      });

      return {
        success: true,
        ipAssetId: result.ipAssetId,
        transactionHash: result.transactionHash
      };
    } else {
      console.error('❌ Failed to create escrow IP asset:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error creating escrow IP asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create license for escrow IP asset
 * This controls how the escrow data can be used and by whom
 */
export async function createEscrowLicense(
  ipAssetId: string, 
  licenseType: 'escrow_license' = 'escrow_license',
  royaltyRate: number = 0,
  restrictions: string[] = ['NO_BLACKLISTED_ADDRESSES']
): Promise<EscrowStoryResult> {
  try {
    console.log('📜 Creating license for escrow IP asset:', ipAssetId);

    const result = await storyNetworkClient.createLicense(
      ipAssetId,
      licenseType,
      royaltyRate,
      restrictions
    );

    if (result.success && result.data) {
      console.log('✅ Escrow license created:', {
        ipAssetId,
        licenseId: result.licenseId,
        licenseType,
        royaltyRate,
        restrictions
      });

      return {
        success: true,
        licenseId: result.licenseId,
        transactionHash: result.transactionHash
      };
    } else {
      console.error('❌ Failed to create escrow license:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error creating escrow license:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create attribution chain between related escrows
 * This tracks how escrows relate to each other (e.g., one escrow funding another)
 */
export async function createEscrowAttributionChain(
  parentEscrowId: string,
  childEscrowId: string,
  parentIPAssetId: string,
  childIPAssetId: string,
  relationshipType: 'escrow_derivative' | 'escrow_funding' | 'escrow_continuation' = 'escrow_derivative'
): Promise<EscrowStoryResult> {
  try {
    console.log('🔗 Creating attribution chain between escrows:', {
      parent: parentEscrowId,
      child: childEscrowId,
      relationshipType
    });

    const result = await storyNetworkClient.createAttributionChain(
      parentIPAssetId,
      childIPAssetId,
      relationshipType
    );

    if (result.success && result.data) {
      console.log('✅ Escrow attribution chain created:', {
        parentEscrowId,
        childEscrowId,
        chainId: result.data.id,
        relationshipType
      });

      return {
        success: true,
        transactionHash: result.transactionHash
      };
    } else {
      console.error('❌ Failed to create escrow attribution chain:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error creating escrow attribution chain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get all IP assets related to an escrow
 * This retrieves all intellectual property associated with an escrow
 */
export async function getEscrowIPAssets(escrowId: string): Promise<StoryNetworkResponse<IPAsset[]>> {
  try {
    console.log('🔍 Getting IP assets for escrow:', escrowId);

    const result = await storyNetworkClient.getIPAssetsByEscrow();

    if (result.success) {
      console.log('✅ Retrieved escrow IP assets:', {
        escrowId,
        count: result.data?.length || 0
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Error getting escrow IP assets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get attribution chain for an escrow IP asset
 * This shows how the escrow relates to other escrows in the network
 */
export async function getEscrowAttributionChain(ipAssetId: string): Promise<StoryNetworkResponse<AttributionChain[]>> {
  try {
    console.log('🔍 Getting attribution chain for IP asset:', ipAssetId);

    const result = await storyNetworkClient.getAttributionChain(ipAssetId);

    if (result.success) {
      console.log('✅ Retrieved attribution chain:', {
        ipAssetId,
        chainLength: result.data?.length || 0
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Error getting attribution chain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate license for escrow IP asset
 * This checks if a user can perform an action on the escrow IP asset
 */
export async function validateEscrowLicense(
  ipAssetId: string,
  user: string,
  action: 'view' | 'use' | 'modify' | 'transfer' = 'view'
): Promise<StoryNetworkResponse<boolean>> {
  try {
    console.log('🔍 Validating license for escrow IP asset:', {
      ipAssetId,
      user,
      action
    });

    const result = await storyNetworkClient.validateLicense(ipAssetId, user, action);

    if (result.success) {
      console.log('✅ License validation result:', {
        ipAssetId,
        user,
        action,
        allowed: result.data
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Error validating escrow license:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Complete escrow IP setup
 * This creates both IP asset and license for an escrow in one call
 */
export async function setupEscrowIP(escrowData: EscrowStoryData): Promise<EscrowStoryResult> {
  try {
    console.log('🚀 Setting up complete IP protection for escrow:', escrowData.escrowId);

    // Step 1: Create IP asset
    const ipResult = await createEscrowIPAsset(escrowData);
    if (!ipResult.success || !ipResult.ipAssetId) {
      return ipResult;
    }

    // Step 2: Create license
    const licenseResult = await createEscrowLicense(ipResult.ipAssetId);
    if (!licenseResult.success) {
      console.warn('⚠️ IP asset created but license creation failed:', licenseResult.error);
      // Still return success for IP asset creation
      return {
        success: true,
        ipAssetId: ipResult.ipAssetId,
        transactionHash: ipResult.transactionHash,
        error: `IP asset created but license failed: ${licenseResult.error}`
      };
    }

    console.log('✅ Complete escrow IP setup successful:', {
      escrowId: escrowData.escrowId,
      ipAssetId: ipResult.ipAssetId,
      licenseId: licenseResult.licenseId
    });

    return {
      success: true,
      ipAssetId: ipResult.ipAssetId,
      licenseId: licenseResult.licenseId,
      transactionHash: ipResult.transactionHash
    };
  } catch (error) {
    console.error('❌ Error setting up escrow IP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

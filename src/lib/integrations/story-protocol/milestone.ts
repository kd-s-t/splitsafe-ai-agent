// Story Network Milestone Document Integration
// Functions for creating IP assets for milestone documents and creative work

import { storyNetworkClient } from './client';
import { CreativeWorkIPData, IPAsset, MilestoneDocumentIPData, StoryNetworkResponse } from './types';

export interface MilestoneDocumentData {
  escrowId: string;
  milestoneId: string;
  documentId: string;
  documentType: 'contract' | 'proof_of_work' | 'signed_agreement' | 'screenshot' | 'file';
  content: string;
  fileHash: string;
  uploader: string;
  createdAt: number;
}

export interface CreativeWorkData {
  escrowId: string;
  workId: string;
  workType: 'code' | 'design' | 'content' | 'media' | 'documentation';
  workHash: string;
  creator: string;
  license: 'exclusive' | 'non-exclusive' | 'royalty-free' | 'custom';
  description: string;
  createdAt: number;
}

export interface MilestoneStoryResult {
  success: boolean;
  ipAssetId?: string;
  licenseId?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Create IP asset for milestone document
 * This protects milestone documents as intellectual property
 */
export async function createMilestoneDocumentIP(documentData: MilestoneDocumentData): Promise<MilestoneStoryResult> {
  try {

    const ipData: MilestoneDocumentIPData = {
      escrowId: documentData.escrowId,
      milestoneId: documentData.milestoneId,
      documentId: documentData.documentId,
      documentType: documentData.documentType,
      content: documentData.content,
      fileHash: documentData.fileHash,
      uploader: documentData.uploader,
      createdAt: documentData.createdAt
    };

    const result = await storyNetworkClient.createMilestoneDocumentIP(ipData);

    if (result.success && result.data) {

      return {
        success: true,
        ipAssetId: result.ipAssetId,
        transactionHash: result.transactionHash
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create IP asset for creative work submitted in milestone
 * This protects creative work as intellectual property
 */
export async function createCreativeWorkIP(workData: CreativeWorkData): Promise<MilestoneStoryResult> {
  try {

    const ipData: CreativeWorkIPData = {
      escrowId: workData.escrowId,
      workId: workData.workId,
      workType: workData.workType,
      workHash: workData.workHash,
      creator: workData.creator,
      license: workData.license,
      description: workData.description,
      createdAt: workData.createdAt
    };

    const result = await storyNetworkClient.createCreativeWorkIP(ipData);

    if (result.success && result.data) {

      return {
        success: true,
        ipAssetId: result.ipAssetId,
        transactionHash: result.transactionHash
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create license for milestone document IP asset
 * This controls how milestone documents can be used
 */
export async function createMilestoneDocumentLicense(
  ipAssetId: string,
  documentType: string,
  royaltyRate: number = 0,
  restrictions: string[] = ['NO_UNAUTHORIZED_DISTRIBUTION']
): Promise<MilestoneStoryResult> {
  try {

    const licenseType = `milestone_${documentType}_license`;
    const result = await storyNetworkClient.createLicense(
      ipAssetId,
      licenseType,
      royaltyRate,
      restrictions
    );

    if (result.success && result.data) {

      return {
        success: true,
        licenseId: result.licenseId,
        transactionHash: result.transactionHash
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create license for creative work IP asset
 * This controls how creative work can be used and distributed
 */
export async function createCreativeWorkLicense(
  ipAssetId: string,
  workType: string,
  licenseType: 'exclusive' | 'non-exclusive' | 'royalty-free' | 'custom',
  royaltyRate: number = 0,
  restrictions: string[] = []
): Promise<MilestoneStoryResult> {
  try {

    // Set royalty rate based on license type
    let finalRoyaltyRate = royaltyRate;
    if (licenseType === 'royalty-free') {
      finalRoyaltyRate = 0;
    } else if (licenseType === 'exclusive') {
      finalRoyaltyRate = Math.max(royaltyRate, 5); // Minimum 5% for exclusive
    }

    // Set restrictions based on license type
    const finalRestrictions = [...restrictions];
    if (licenseType === 'exclusive') {
      finalRestrictions.push('NO_REDISTRIBUTION', 'NO_DERIVATIVE_WORKS');
    } else if (licenseType === 'non-exclusive') {
      finalRestrictions.push('ATTRIBUTION_REQUIRED');
    }

    const result = await storyNetworkClient.createLicense(
      ipAssetId,
      `creative_${workType}_${licenseType}_license`,
      finalRoyaltyRate,
      finalRestrictions
    );

    if (result.success && result.data) {

      return {
        success: true,
        licenseId: result.licenseId,
        transactionHash: result.transactionHash
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create attribution chain between milestone document and escrow
 * This links milestone documents to their parent escrow
 */
export async function createMilestoneEscrowAttribution(
  escrowIPAssetId: string,
  milestoneIPAssetId: string,
  relationshipType: 'milestone_document' | 'creative_work' = 'milestone_document'
): Promise<MilestoneStoryResult> {
  try {

    const result = await storyNetworkClient.createAttributionChain(
      escrowIPAssetId,
      milestoneIPAssetId,
      relationshipType
    );

    if (result.success && result.data) {

      return {
        success: true,
        transactionHash: result.transactionHash
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get all IP assets for a milestone
 * This retrieves all intellectual property associated with a milestone
 */
export async function getMilestoneIPAssets(escrowId: string, milestoneId: string): Promise<StoryNetworkResponse<IPAsset[]>> {
  try {

    // Get all IP assets for the escrow
    const escrowResult = await storyNetworkClient.getIPAssetsByEscrow();
    
    if (!escrowResult.success || !escrowResult.data) {
      return escrowResult;
    }

    // Filter for milestone-related IP assets
    const milestoneAssets = escrowResult.data.filter(asset => 
      asset.metadata.milestoneId === milestoneId ||
      asset.type === 'milestone_document' ||
      asset.type === 'creative_work'
    );


    return {
      success: true,
      data: milestoneAssets
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Complete milestone IP setup
 * This creates IP asset and license for a milestone document in one call
 */
export async function setupMilestoneDocumentIP(documentData: MilestoneDocumentData): Promise<MilestoneStoryResult> {
  try {

    // Step 1: Create IP asset
    const ipResult = await createMilestoneDocumentIP(documentData);
    if (!ipResult.success || !ipResult.ipAssetId) {
      return ipResult;
    }

    // Step 2: Create license
    const licenseResult = await createMilestoneDocumentLicense(
      ipResult.ipAssetId,
      documentData.documentType
    );
    
    if (!licenseResult.success) {
      // Still return success for IP asset creation
      return {
        success: true,
        ipAssetId: ipResult.ipAssetId,
        transactionHash: ipResult.transactionHash,
        error: `IP asset created but license failed: ${licenseResult.error}`
      };
    }


    return {
      success: true,
      ipAssetId: ipResult.ipAssetId,
      licenseId: licenseResult.licenseId,
      transactionHash: ipResult.transactionHash
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

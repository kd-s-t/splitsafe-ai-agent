// Story Network Template Integration
// Functions for creating and managing IP assets for escrow templates

import { storyNetworkClient } from './client';
import { IPAsset, StoryNetworkResponse, TemplateIPData } from './types';

export interface EscrowTemplateData {
  templateId: string;
  name: string;
  description: string;
  category: 'freelance' | 'dao_treasury' | 'milestone_bounty' | 'marketplace' | 'booking' | 'gaming';
  creator: string;
  useCases: string[];
  isPublic: boolean;
  createdAt: number;
}

export interface TemplateStoryResult {
  success: boolean;
  ipAssetId?: string;
  licenseId?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Create IP asset for escrow template
 * This makes escrow templates reusable intellectual property
 */
export async function createTemplateIP(templateData: EscrowTemplateData): Promise<TemplateStoryResult> {
  try {
    console.log('📋 Creating Story Network IP asset for escrow template:', {
      templateId: templateData.templateId,
      name: templateData.name,
      category: templateData.category
    });

    const ipData: TemplateIPData = {
      templateId: templateData.templateId,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      creator: templateData.creator,
      useCases: templateData.useCases,
      isPublic: templateData.isPublic,
      createdAt: templateData.createdAt
    };

    const result = await storyNetworkClient.createTemplateIP(ipData);

    if (result.success && result.data) {
      console.log('✅ Template IP asset created:', {
        templateId: templateData.templateId,
        ipAssetId: result.ipAssetId,
        transactionHash: result.transactionHash
      });

      return {
        success: true,
        ipAssetId: result.ipAssetId,
        transactionHash: result.transactionHash
      };
    } else {
      console.error('❌ Failed to create template IP asset:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error creating template IP asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create license for template IP asset
 * This controls how templates can be used and distributed
 */
export async function createTemplateLicense(
  ipAssetId: string,
  templateCategory: string,
  isPublic: boolean,
  royaltyRate: number = 0,
  restrictions: string[] = []
): Promise<TemplateStoryResult> {
  try {
    console.log('📜 Creating license for template IP asset:', {
      ipAssetId,
      templateCategory,
      isPublic,
      royaltyRate
    });

    // Set restrictions based on template visibility
    const finalRestrictions = [...restrictions];
    if (isPublic) {
      finalRestrictions.push('ATTRIBUTION_REQUIRED', 'SHARE_ALIKE');
    } else {
      finalRestrictions.push('PRIVATE_USE_ONLY', 'NO_REDISTRIBUTION');
    }

    // Set royalty rate based on template category
    let finalRoyaltyRate = royaltyRate;
    if (templateCategory === 'dao_treasury' || templateCategory === 'milestone_bounty') {
      finalRoyaltyRate = Math.max(royaltyRate, 2); // Minimum 2% for DAO/bounty templates
    }

    const licenseType = `template_${templateCategory}_${isPublic ? 'public' : 'private'}_license`;
    const result = await storyNetworkClient.createLicense(
      ipAssetId,
      licenseType,
      finalRoyaltyRate,
      finalRestrictions
    );

    if (result.success && result.data) {
      console.log('✅ Template license created:', {
        ipAssetId,
        licenseId: result.licenseId,
        licenseType,
        royaltyRate: finalRoyaltyRate,
        restrictions: finalRestrictions
      });

      return {
        success: true,
        licenseId: result.licenseId,
        transactionHash: result.transactionHash
      };
    } else {
      console.error('❌ Failed to create template license:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error creating template license:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create attribution chain between template and escrow created from it
 * This tracks which escrows were created using which templates
 */
export async function createTemplateEscrowAttribution(
  templateIPAssetId: string,
  escrowIPAssetId: string,
  relationshipType: 'template_usage' | 'template_derivative' = 'template_usage'
): Promise<TemplateStoryResult> {
  try {
    console.log('🔗 Creating attribution chain between template and escrow:', {
      templateIPAssetId,
      escrowIPAssetId,
      relationshipType
    });

    const result = await storyNetworkClient.createAttributionChain(
      templateIPAssetId,
      escrowIPAssetId,
      relationshipType
    );

    if (result.success && result.data) {
      console.log('✅ Template-escrow attribution chain created:', {
        templateIPAssetId,
        escrowIPAssetId,
        chainId: result.data.id,
        relationshipType
      });

      return {
        success: true,
        transactionHash: result.transactionHash
      };
    } else {
      console.error('❌ Failed to create template-escrow attribution chain:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error creating template-escrow attribution chain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get all IP assets for a template creator
 * This retrieves all templates created by a user
 */
export async function getCreatorTemplates(creator: string): Promise<StoryNetworkResponse<IPAsset[]>> {
  try {
    console.log('🔍 Getting templates for creator:', creator);

    const result = await storyNetworkClient.getIPAssetsByCreator();
    
    if (result.success && result.data) {
      // Filter for template IP assets only
      const templateAssets = result.data.filter(asset => asset.type === 'template');
      
      console.log('✅ Retrieved creator templates:', {
        creator,
        count: templateAssets.length
      });

      return {
        success: true,
        data: templateAssets
      };
    }

    return result;
  } catch (error) {
    console.error('❌ Error getting creator templates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get template by ID
 * This retrieves a specific template IP asset
 */
export async function getTemplate(templateIPAssetId: string): Promise<StoryNetworkResponse<IPAsset>> {
  try {
    console.log('🔍 Getting template by IP asset ID:', templateIPAssetId);

    const result = await storyNetworkClient.getIPAsset();

    if (result.success && result.data) {
      console.log('✅ Retrieved template:', {
        templateIPAssetId,
        name: result.data.title,
        category: result.data.metadata.templateId
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Error getting template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate template license for usage
 * This checks if a user can use a template to create an escrow
 */
export async function validateTemplateUsage(
  templateIPAssetId: string,
  user: string,
  action: 'view' | 'use' | 'modify' | 'distribute' = 'use'
): Promise<StoryNetworkResponse<boolean>> {
  try {
    console.log('🔍 Validating template usage:', {
      templateIPAssetId,
      user,
      action
    });

    const result = await storyNetworkClient.validateLicense(templateIPAssetId, user, action);

    if (result.success) {
      console.log('✅ Template usage validation result:', {
        templateIPAssetId,
        user,
        action,
        allowed: result.data
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Error validating template usage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Complete template IP setup
 * This creates IP asset and license for a template in one call
 */
export async function setupTemplateIP(templateData: EscrowTemplateData): Promise<TemplateStoryResult> {
  try {
    console.log('🚀 Setting up complete IP protection for template:', {
      templateId: templateData.templateId,
      name: templateData.name,
      category: templateData.category
    });

    // Step 1: Create IP asset
    const ipResult = await createTemplateIP(templateData);
    if (!ipResult.success || !ipResult.ipAssetId) {
      return ipResult;
    }

    // Step 2: Create license
    const licenseResult = await createTemplateLicense(
      ipResult.ipAssetId,
      templateData.category,
      templateData.isPublic
    );
    
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

    console.log('✅ Complete template IP setup successful:', {
      templateId: templateData.templateId,
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
    console.error('❌ Error setting up template IP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Story Network Integration Examples
// Examples of how to integrate Story Network calls into SplitSafe flows

import {
    createMilestoneEscrowAttribution,
    createTemplateEscrowAttribution,
    getEscrowIPAssets,
    setupEscrowIP,
    setupMilestoneDocumentIP,
    setupTemplateIP,
    validateEscrowLicense
} from './index';

/**
 * Example: Integrate Story Network into escrow creation flow
 * This would be called after an escrow is successfully created
 */
export async function integrateStoryNetworkIntoEscrowCreation(
  escrowId: string,
  title: string,
  description: string,
  creator: string,
  participants: Array<{
    principal: string;
    amount: string;
    percentage: number;
    nickname?: string;
  }>,
  totalAmount: string,
  useSeiAcceleration: boolean = false
) {
  try {
    console.log('🎨 Integrating Story Network into escrow creation:', escrowId);

    // Create IP asset and license for the escrow
    const storyResult = await setupEscrowIP({
      escrowId,
      title,
      description,
      creator,
      participants,
      totalAmount,
      useSeiAcceleration,
      createdAt: Date.now()
    });

    if (storyResult.success) {
      console.log('✅ Story Network integration successful:', {
        escrowId,
        ipAssetId: storyResult.ipAssetId,
        licenseId: storyResult.licenseId,
        transactionHash: storyResult.transactionHash
      });

      // Store the IP asset ID in your escrow record
      // This would be added to your escrow data structure
      return {
        success: true,
        ipAssetId: storyResult.ipAssetId,
        licenseId: storyResult.licenseId,
        transactionHash: storyResult.transactionHash
      };
    } else {
      console.warn('⚠️ Story Network integration failed (non-blocking):', storyResult.error);
      return {
        success: false,
        error: storyResult.error
      };
    }
  } catch (error) {
    console.error('❌ Error in Story Network integration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Example: Integrate Story Network into milestone document upload
 * This would be called when a user uploads a document to a milestone
 */
export async function integrateStoryNetworkIntoMilestoneDocument(
  escrowId: string,
  milestoneId: string,
  documentId: string,
  documentType: 'contract' | 'proof_of_work' | 'signed_agreement' | 'screenshot' | 'file',
  content: string,
  fileHash: string,
  uploader: string
) {
  try {
    console.log('📄 Integrating Story Network into milestone document upload:', {
      escrowId,
      milestoneId,
      documentType
    });

    // Create IP asset and license for the milestone document
    const storyResult = await setupMilestoneDocumentIP({
      escrowId,
      milestoneId,
      documentId,
      documentType,
      content,
      fileHash,
      uploader,
      createdAt: Date.now()
    });

    if (storyResult.success) {
      console.log('✅ Milestone document IP protection successful:', {
        escrowId,
        milestoneId,
        ipAssetId: storyResult.ipAssetId,
        licenseId: storyResult.licenseId
      });

      // Store the IP asset ID in your milestone document record
      return {
        success: true,
        ipAssetId: storyResult.ipAssetId,
        licenseId: storyResult.licenseId,
        transactionHash: storyResult.transactionHash
      };
    } else {
      console.warn('⚠️ Milestone document IP protection failed (non-blocking):', storyResult.error);
      return {
        success: false,
        error: storyResult.error
      };
    }
  } catch (error) {
    console.error('❌ Error in milestone document IP protection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Example: Integrate Story Network into template creation
 * This would be called when a user creates a new escrow template
 */
export async function integrateStoryNetworkIntoTemplateCreation(
  templateId: string,
  name: string,
  description: string,
  category: 'freelance' | 'dao_treasury' | 'milestone_bounty' | 'marketplace' | 'booking' | 'gaming',
  creator: string,
  useCases: string[],
  isPublic: boolean
) {
  try {
    console.log('📋 Integrating Story Network into template creation:', {
      templateId,
      name,
      category
    });

    // Create IP asset and license for the template
    const storyResult = await setupTemplateIP({
      templateId,
      name,
      description,
      category,
      creator,
      useCases,
      isPublic,
      createdAt: Date.now()
    });

    if (storyResult.success) {
      console.log('✅ Template IP protection successful:', {
        templateId,
        ipAssetId: storyResult.ipAssetId,
        licenseId: storyResult.licenseId
      });

      // Store the IP asset ID in your template record
      return {
        success: true,
        ipAssetId: storyResult.ipAssetId,
        licenseId: storyResult.licenseId,
        transactionHash: storyResult.transactionHash
      };
    } else {
      console.warn('⚠️ Template IP protection failed (non-blocking):', storyResult.error);
      return {
        success: false,
        error: storyResult.error
      };
    }
  } catch (error) {
    console.error('❌ Error in template IP protection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Example: Create attribution chain when escrow is created from template
 * This would be called when a user creates an escrow using a template
 */
export async function createTemplateEscrowAttributionChain(
  templateIPAssetId: string,
  escrowIPAssetId: string
) {
  try {
    console.log('🔗 Creating template-escrow attribution chain:', {
      templateIPAssetId,
      escrowIPAssetId
    });

    const result = await createTemplateEscrowAttribution(
      templateIPAssetId,
      escrowIPAssetId,
      'template_usage'
    );

    if (result.success) {
      console.log('✅ Template-escrow attribution chain created:', {
        templateIPAssetId,
        escrowIPAssetId,
        transactionHash: result.transactionHash
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Error creating template-escrow attribution chain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Example: Create attribution chain when milestone document is uploaded
 * This would be called when a document is uploaded to link it to the escrow
 */
export async function createMilestoneEscrowAttributionChain(
  escrowIPAssetId: string,
  milestoneIPAssetId: string
) {
  try {
    console.log('🔗 Creating milestone-escrow attribution chain:', {
      escrowIPAssetId,
      milestoneIPAssetId
    });

    const result = await createMilestoneEscrowAttribution(
      escrowIPAssetId,
      milestoneIPAssetId,
      'milestone_document'
    );

    if (result.success) {
      console.log('✅ Milestone-escrow attribution chain created:', {
        escrowIPAssetId,
        milestoneIPAssetId,
        transactionHash: result.transactionHash
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Error creating milestone-escrow attribution chain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Example: Validate user permissions for escrow IP asset
 * This would be called before allowing a user to perform actions on an escrow
 */
export async function validateUserEscrowPermissions(
  escrowId: string,
  user: string,
  action: 'view' | 'use' | 'modify' | 'transfer'
) {
  try {
    console.log('🔍 Validating user permissions for escrow:', {
      escrowId,
      user,
      action
    });

    // Get all IP assets for the escrow
    const ipAssetsResult = await getEscrowIPAssets(escrowId);
    
    if (!ipAssetsResult.success || !ipAssetsResult.data || ipAssetsResult.data.length === 0) {
      console.log('ℹ️ No IP assets found for escrow, allowing action');
      return { success: true, allowed: true };
    }

    // Check permissions for each IP asset
    for (const ipAsset of ipAssetsResult.data) {
      const validationResult = await validateEscrowLicense(ipAsset.id, user, action);
      
      if (!validationResult.success || !validationResult.data) {
        console.log('❌ User not authorized for IP asset:', {
          ipAssetId: ipAsset.id,
          user,
          action
        });
        return {
          success: true,
          allowed: false,
          reason: `Not authorized for IP asset ${ipAsset.id}`
        };
      }
    }

    console.log('✅ User authorized for all IP assets:', {
      escrowId,
      user,
      action
    });

    return {
      success: true,
      allowed: true
    };
  } catch (error) {
    console.error('❌ Error validating user permissions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Example: Get complete IP asset overview for an escrow
 * This would be called to show users all IP assets associated with their escrow
 */
export async function getEscrowIPOverview(escrowId: string) {
  try {
    console.log('📊 Getting IP overview for escrow:', escrowId);

    // Get all IP assets for the escrow
    const ipAssetsResult = await getEscrowIPAssets(escrowId);
    
    if (!ipAssetsResult.success) {
      return ipAssetsResult;
    }

    const ipAssets = ipAssetsResult.data || [];
    
    // Categorize IP assets
    const escrowAssets = ipAssets.filter(asset => asset.type === 'escrow');
    const milestoneAssets = ipAssets.filter(asset => asset.type === 'milestone_document');
    const creativeAssets = ipAssets.filter(asset => asset.type === 'creative_work');

    console.log('✅ IP overview retrieved:', {
      escrowId,
      totalAssets: ipAssets.length,
      escrowAssets: escrowAssets.length,
      milestoneAssets: milestoneAssets.length,
      creativeAssets: creativeAssets.length
    });

    return {
      success: true,
      data: {
        escrowId,
        totalAssets: ipAssets.length,
        escrowAssets,
        milestoneAssets,
        creativeAssets,
        allAssets: ipAssets
      }
    };
  } catch (error) {
    console.error('❌ Error getting escrow IP overview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

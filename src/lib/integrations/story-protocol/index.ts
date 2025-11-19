// Story Network Integration - Main Export
// Centralized exports for all Story Network functionality

// Core types and client
export { storyNetworkClient, StoryNetworkClientImpl } from './client';
export * from './types';

// Module-specific functions
export * from './escrow';
export * from './milestone';
export * from './template';

// Re-export commonly used types for convenience
export type {
    AttributionChain, CreativeWorkIPData, EscrowIPData, IPAsset, License, MilestoneDocumentIPData, StoryNetworkConfig, StoryNetworkResponse, TemplateIPData
} from './types';

// Re-export commonly used functions for convenience
export {
    createEscrowAttributionChain,
    // Escrow functions
    createEscrowIPAsset,
    createEscrowLicense, getEscrowAttributionChain, getEscrowIPAssets, setupEscrowIP, validateEscrowLicense
} from './escrow';

export {
    createCreativeWorkIP, createCreativeWorkLicense,
    // Milestone functions
    createMilestoneDocumentIP, createMilestoneDocumentLicense, createMilestoneEscrowAttribution,
    getMilestoneIPAssets,
    setupMilestoneDocumentIP
} from './milestone';

export {
    createTemplateEscrowAttribution,
    // Template functions
    createTemplateIP,
    createTemplateLicense, getCreatorTemplates,
    getTemplate, setupTemplateIP, validateTemplateUsage
} from './template';


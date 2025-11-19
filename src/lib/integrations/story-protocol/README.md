# Story Network Integration for SplitSafe

This module provides comprehensive Story Network integration for SplitSafe, enabling intellectual property protection and attribution tracking for escrow transactions, milestone documents, and templates.

## 🎯 **What This Adds to SplitSafe**

### **Intellectual Property Protection**
- **Escrow IP Assets** - Every escrow becomes an IP asset on Story Network
- **Document Protection** - Milestone documents are protected as IP
- **Template IP** - Escrow templates become reusable IP assets
- **Creative Work Protection** - Creative work in escrows gets IP protection

### **Attribution Tracking**
- **Relationship Mapping** - Track how escrows relate to each other
- **Template Usage** - Track which escrows were created from templates
- **Document Lineage** - Track document relationships within escrows

### **Licensing System**
- **Flexible Licensing** - Different license types for different content
- **Royalty Management** - Support for royalty payments
- **Usage Control** - Control how IP assets can be used

## 📁 **Module Structure**

```
src/lib/internal/blockchain/story/
├── types.ts              # Centralized type definitions
├── client.ts             # Story Network API client
├── escrow.ts             # Escrow-specific functions
├── milestone.ts          # Milestone document functions
├── template.ts           # Template management functions
├── integration-examples.ts # Usage examples
├── index.ts              # Main exports
└── README.md             # This file
```

## 🚀 **Quick Start**

### **1. Environment Setup**

Add to your `.env.local`:
```bash
# Story Network Configuration (Real Testnet)
STORY_PRIVATE_KEY=your_ethereum_private_key_here
STORY_RPC_URL=https://testnet.storyrpc.io
STORY_CHAIN_ID=1315
```

### **2. Basic Usage**

```typescript
import { 
  setupEscrowIP, 
  setupMilestoneDocumentIP, 
  setupTemplateIP 
} from '@/lib/internal/blockchain/story';

// Create IP protection for an escrow
const escrowResult = await setupEscrowIP({
  escrowId: 'escrow_123',
  title: 'Freelance Payment',
  description: 'Payment for web development work',
  creator: 'user_principal_id',
  participants: [/* participant data */],
  totalAmount: '1000000000', // in e8s
  useSeiAcceleration: false,
  createdAt: Date.now()
});

// Create IP protection for a milestone document
const documentResult = await setupMilestoneDocumentIP({
  escrowId: 'escrow_123',
  milestoneId: 'milestone_1',
  documentId: 'doc_456',
  documentType: 'proof_of_work',
  content: 'Screenshot of completed work',
  fileHash: 'sha256_hash_here',
  uploader: 'user_principal_id',
  createdAt: Date.now()
});
```

## 🔧 **Integration Points**

### **Escrow Creation Flow**
```typescript
// After escrow is created successfully
const storyResult = await integrateStoryNetworkIntoEscrowCreation(
  escrowId,
  title,
  description,
  creator,
  participants,
  totalAmount,
  useSeiAcceleration
);
```

### **Milestone Document Upload**
```typescript
// When user uploads a document to milestone
const storyResult = await integrateStoryNetworkIntoMilestoneDocument(
  escrowId,
  milestoneId,
  documentId,
  documentType,
  content,
  fileHash,
  uploader
);
```

### **Template Creation**
```typescript
// When user creates a new template
const storyResult = await integrateStoryNetworkIntoTemplateCreation(
  templateId,
  name,
  description,
  category,
  creator,
  useCases,
  isPublic
);
```

## 📊 **Available Functions**

### **Escrow Functions**
- `setupEscrowIP()` - Complete IP setup for escrow
- `createEscrowIPAsset()` - Create IP asset only
- `createEscrowLicense()` - Create license only
- `getEscrowIPAssets()` - Get all IP assets for escrow
- `validateEscrowLicense()` - Validate user permissions

### **Milestone Functions**
- `setupMilestoneDocumentIP()` - Complete IP setup for document
- `createMilestoneDocumentIP()` - Create IP asset for document
- `createCreativeWorkIP()` - Create IP asset for creative work
- `getMilestoneIPAssets()` - Get all IP assets for milestone

### **Template Functions**
- `setupTemplateIP()` - Complete IP setup for template
- `createTemplateIP()` - Create IP asset for template
- `getCreatorTemplates()` - Get all templates by creator
- `validateTemplateUsage()` - Validate template usage permissions

### **Attribution Functions**
- `createEscrowAttributionChain()` - Link related escrows
- `createTemplateEscrowAttribution()` - Link template to escrow
- `createMilestoneEscrowAttribution()` - Link milestone to escrow

## 🎨 **IP Asset Types**

### **Escrow IP Assets**
- **Type**: `escrow`
- **Purpose**: Protect escrow transaction data
- **License**: `escrow_license` (0% royalty by default)
- **Restrictions**: `NO_BLACKLISTED_ADDRESSES`

### **Milestone Document IP Assets**
- **Type**: `milestone_document`
- **Purpose**: Protect milestone documents
- **License**: `milestone_{documentType}_license`
- **Restrictions**: `NO_UNAUTHORIZED_DISTRIBUTION`

### **Creative Work IP Assets**
- **Type**: `creative_work`
- **Purpose**: Protect creative work in escrows
- **License**: `creative_{workType}_{licenseType}_license`
- **Restrictions**: Varies by license type

### **Template IP Assets**
- **Type**: `template`
- **Purpose**: Protect escrow templates
- **License**: `template_{category}_{visibility}_license`
- **Restrictions**: Varies by visibility (public/private)

## 🔗 **Attribution Chain Types**

- `escrow_derivative` - One escrow derived from another
- `escrow_funding` - One escrow funding another
- `template_usage` - Escrow created from template
- `milestone_document` - Document linked to escrow
- `creative_derivative` - Creative work derived from another

## 🛡️ **Security Features**

### **License Validation**
- **Permission Checking** - Validate user actions against licenses
- **Action Types** - `view`, `use`, `modify`, `transfer`
- **Automatic Enforcement** - Built into all IP asset operations

### **Attribution Integrity**
- **Chain Verification** - Verify attribution chain integrity
- **Relationship Tracking** - Track all IP asset relationships
- **Tamper Detection** - Detect unauthorized modifications

## 📈 **Benefits for SplitSafe**

### **Legal Protection**
- **IP Rights** - Protect creative work and documents
- **Attribution** - Ensure proper credit for creators
- **Licensing** - Control how content can be used

### **Business Value**
- **Template Marketplace** - Enable template sharing and monetization
- **Creator Economy** - Support for creative work monetization
- **Enterprise Features** - Professional IP management

### **User Experience**
- **Seamless Integration** - Works transparently with existing flows
- **Non-blocking** - IP creation doesn't block core functionality
- **Optional** - Can be enabled/disabled per user preference

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required
STORY_PRIVATE_KEY=your_ethereum_private_key

# Optional (has defaults)
STORY_RPC_URL=https://testnet.storyrpc.io
STORY_CHAIN_ID=1315
NODE_ENV=development
```

### **Network Configuration**
- **Testnet**: Story Network Aeneid testnet (chain ID: 1315)
- **Mainnet**: TBD (when available)
- **Development**: Uses testnet for development

## 🚨 **Error Handling**

All functions return a consistent response format:
```typescript
interface StoryNetworkResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
  ipAssetId?: string;
  licenseId?: string;
}
```

### **Non-blocking Design**
- IP creation failures don't block core SplitSafe functionality
- Errors are logged but don't prevent escrow operations
- Users can continue using SplitSafe even if Story Network is unavailable

## 📝 **Usage Examples**

See `integration-examples.ts` for complete usage examples showing how to integrate Story Network calls into SplitSafe's existing flows.

## 🔮 **Future Enhancements**

- **Royalty Distribution** - Automatic royalty payments
- **IP Marketplace** - Buy/sell IP assets
- **Advanced Licensing** - Complex license terms
- **Cross-chain Support** - Multi-blockchain IP assets
- **Analytics Dashboard** - IP asset usage analytics




REFRESH token ip here for store:
https://cloud.google.com/application/web3/faucet/story/aeneid

Example transaction:
https://aeneid.storyscan.io/tx/0x4ba5c37b917cba95fc1f9f0782bf7a496b3a522ff5eccd77c8509c14742a25c1
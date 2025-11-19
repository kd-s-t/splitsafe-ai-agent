# ICP Blockchain Integration

This directory contains all centralized ICP blockchain method calls for the SplitSafe application. All ICP interactions should go through these centralized methods to ensure consistency and maintainability.

## Structure

### Core Files

- **`types.ts`** - Centralized TypeScript types and interfaces
- **`splitDapp/`** - Actor creation and configuration
- **`index.ts`** - Main exports for all ICP methods

### Method Categories

#### Admin Methods (`admin/`)
- `getAdmin()` - Get admin principal from backend
- `isUserAdmin(userPrincipal)` - Check if user is admin

#### API Key Management (`apiKeys/`)
- `ApiKeyManager` - Class for managing API keys
- `createApiKeyManager()` - Factory function for API key manager
- `createApiKey()`, `revokeApiKey()`, `listApiKeys()` - API key operations

#### Balance Methods (`balance/`)
- `getIcpBalance(principal)` - Get ICP balance
- `getCkbtcBalance(principal)` - Get cKBTC (Bitcoin) balance  
- `getAllBalances(principal)` - Get all balances at once

#### Chat Methods (`chat/`)
- `ICPChatService` - Singleton service for escrow chat functionality
- `sendMessage(escrowId, message, senderName, sender)` - Send chat message
- `getMessages(escrowId, caller, limit)` - Get chat messages
- `getMessageCount(escrowId)` - Get message count
- `searchMessages(escrowId, searchQuery)` - Search chat messages

#### Contact Methods (`contacts/`)
- `getContacts(ownerId)` - Get user's contacts
- `addContact(ownerPrincipal, contactPrincipal, nickname)` - Add new contact
- `updateContact(contactId, nickname)` - Update contact nickname
- `deleteContact(contactId)` - Delete contact
- `searchContacts(ownerId, query)` - Search contacts by nickname or principal ID

#### Escrow Methods (`escrow/`)
- `initiateEscrow(caller, participants, title, useSeiAcceleration)` - Create new escrow
- `approveEscrow(senderPrincipal, transactionId, recipientPrincipal)` - Approve as recipient
- `declineEscrow(senderPrincipal, transactionIndex, recipientPrincipal)` - Decline as recipient
- `cancelEscrow(initiatorPrincipal, transactionIndex)` - Cancel as initiator
- `releaseEscrow(initiatorPrincipal, transactionIndex)` - Release as initiator
- `refundEscrow(initiatorPrincipal, transactionIndex)` - Refund as initiator

#### Feedback Methods (`feedback/`)
- `submitFeedback(feedback)` - Submit anonymous feedback
- `getFeedbackStats()` - Get feedback statistics
- `getAllFeedback()` - Get all feedback (admin only)

#### File Storage Methods (`fileStorage/`)
- `FileStorageActor` - Class for file storage operations
- `uploadFile()`, `downloadFile()`, `deleteFile()` - File operations
- `getFileInfo()`, `listFiles()` - File management

#### Milestone Methods (`milestone/`)
- `initiateMultipleMilestones()` - Create multiple milestones
- `approveMilestone()` - Approve a milestone
- `declineMilestone()` - Decline a milestone
- `releaseMilestone()` - Release milestone payment
- `completeMilestone()` - Mark milestone as complete
- `recipientSignContract()` - Upload signed contract
- `clientApprovedSignedContract()` - Client approves signed contract
- `clientReleaseMilestonePayment()` - Client releases milestone payment
- `submitProofOfWork()` - Submit proof of work

#### Notification Methods (`notifications/`)
- `sendNotification()` - Send push notification
- `getUserNotifications()` - Get user notifications
- `markNotificationRead()` - Mark notification as read

#### Transaction Creation (`transaction/`)
- `createBasicEscrow()` - Create basic escrow transaction
- `createMilestoneEscrow()` - Create milestone escrow transaction
- `createWithdrawTransaction()` - Create withdrawal transaction
- `createTransaction()` - Unified transaction creation

#### Transaction Queries (`transactions/`)
- `getTransaction(transactionId, callerPrincipal)` - Get specific transaction
- `getTransactionsPaginated(principal, offset, limit)` - Get paginated transactions
- `getAllTransactions(principal)` - Get all user transactions
- `getEscrowDetails(transactionId, callerPrincipal)` - Get escrow details
- `approveTransactionById(transactionId, callerPrincipal)` - Approve transaction by ID
- `approveSpecificTransaction(callerPrincipal)` - Approve specific transaction

#### User Methods (`user/`)
- `getInfo(principal)` - Get complete user info
- `getAllUsers()` - Get all users (admin only)
- `saveInfo(principal, request)` - Save user information

#### Voucher Methods (`vouchers/`)
- `createVoucher(formData, userPrincipal)` - Create new voucher
- `createVoucherWithRateLimit()` - Create voucher with rate limiting
- `redeemVoucher(voucherCode, userPrincipal)` - Redeem voucher
- `cancelVoucher(voucherId, userPrincipal)` - Cancel voucher
- `getUserVouchers(ownerId)` - Get user's vouchers
- `updateVoucher()` - Update voucher details
- `getVoucher(voucherId)` - Get specific voucher

#### Withdrawal Methods (`withdraw/`)
- `withdrawIcp(principal, amount, address)` - Withdraw ICP
- `withdrawBtc(principal, amount, address)` - Withdraw cKBTC to Bitcoin
- `withdrawSei(principal, amount, address)` - **Not supported** (SEI is used for escrow acceleration only)

## Usage Examples

### Import Methods and Types
```typescript
import { 
  // Balance methods
  getIcpBalance, 
  getAllBalances,
  
  // Escrow methods
  initiateEscrow,
  approveEscrow,
  releaseEscrow,
  
  // Transaction methods
  getTransaction,
  getTransactionsPaginated,
  
  // Withdrawal methods
  withdrawIcp,
  withdrawBtc,
  
  // Chat methods
  icpChatService,
  
  // Contact methods
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  searchContacts,
  
  // Voucher methods
  createVoucher,
  redeemVoucher,
  getUserVouchers,
  
  // Admin methods
  isUserAdmin,
  
  // Types
  ParticipantShare,
  UserBalances,
  ICPTransaction,
  WithdrawalResult,
  Contact,
  ContactResult,
  Voucher,
  VoucherFormData
} from '@/lib/internal/blockchain/icp';
```

### Get User Balances
```typescript
import { Principal } from '@dfinity/principal';

const principal = Principal.fromText('user-principal-id');
const balances = await getAllBalances(principal);
console.log('ICP:', balances.icp);
console.log('cKBTC:', balances.ckbtc);
console.log('SEI:', balances.sei);
```

### Create Escrow
```typescript
import { Principal } from '@dfinity/principal';
import { ParticipantShare } from '@/lib/internal/blockchain/icp';

const caller = Principal.fromText('caller-principal');
const participants: ParticipantShare[] = [
  {
    principal: Principal.fromText('recipient-1'),
    amount: BigInt(100000000), // 1 ICP in e8s
    percentage: 50
  }
];

const txId = await initiateEscrow(caller, participants, 'Split dinner bill', false);
```

### Send Chat Message
```typescript
const result = await icpChatService.sendMessage(
  'escrow-id',
  'Hello everyone!',
  'John Doe',
  'user-principal-id'
);

if (result.success) {
  console.log('Message sent:', result.messageId);
}
```

### Manage Contacts
```typescript
import { Principal } from '@dfinity/principal';

// Get all contacts
const contacts = await getContacts(ownerPrincipal);
console.log('User contacts:', contacts);

// Add a new contact
const contactPrincipal = Principal.fromText('contact-principal-id');
const addResult = await addContact(ownerPrincipal, contactPrincipal, 'John Doe');
if (addResult.ok) {
  console.log('Contact added:', addResult.ok);
}

// Search contacts
const searchResults = await searchContacts(ownerPrincipal, 'John');
console.log('Search results:', searchResults);

// Update contact nickname
const updateResult = await updateContact('contact-id', 'Johnny');
if (updateResult.ok) {
  console.log('Contact updated:', updateResult.ok);
}

// Delete contact
const deleteResult = await deleteContact('contact-id');
if (deleteResult.ok) {
  console.log('Contact deleted:', deleteResult.ok);
}
```

### Create and Redeem Vouchers
```typescript
import { Principal } from '@dfinity/principal';

const userPrincipal = Principal.fromText('user-principal-id');

// Create voucher
const voucherData = {
  code: 'SAVE20',
  amount: 0.1, // 0.1 BTC
  description: '10% off voucher',
  expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
};

const createResult = await createVoucher(voucherData, userPrincipal);
if (createResult.ok) {
  console.log('Voucher created:', createResult.ok);
}

// Redeem voucher
const redeemResult = await redeemVoucher('SAVE20', userPrincipal);
if (redeemResult.success) {
  console.log('Voucher redeemed successfully');
}

// Get user's vouchers
const vouchers = await getUserVouchers(userPrincipal);
console.log('User vouchers:', vouchers);
```

### Admin Operations
```typescript
import { Principal } from '@dfinity/principal';

const userPrincipal = Principal.fromText('user-principal-id');

// Check if user is admin
const isAdmin = await isUserAdmin(userPrincipal);
console.log('Is admin:', isAdmin);

// Get all users (admin only)
if (isAdmin) {
  const allUsers = await getAllUsers();
  console.log('All users:', allUsers);
}
```

## Migration Guide

### Before (Scattered calls)
```typescript
// Old way - direct actor calls scattered throughout codebase
const actor = await createSplitDappActor();
const balance = await actor.getBalance(principal);
const tx = await actor.getTransaction(id, principal);
const contacts = await actor.getContacts();
const result = await actor.addContact(contactPrincipal, nickname);
```

### After (Centralized)
```typescript
// New way - centralized methods
import { 
  getIcpBalance, 
  getTransaction, 
  getContacts, 
  addContact 
} from '@/lib/internal/blockchain/icp';

const balance = await getIcpBalance(principal);
const tx = await getTransaction(id, principal);
const contacts = await getContacts(ownerPrincipal);
const result = await addContact(ownerPrincipal, contactPrincipal, nickname);
```

## Benefits

1. **Consistency** - All ICP calls use the same error handling and logging
2. **Maintainability** - Changes to ICP integration only need to be made in one place
3. **Type Safety** - Centralized type definitions and interfaces
4. **Error Handling** - Consistent error handling and user notifications
5. **Testing** - Easier to mock and test ICP interactions
6. **Documentation** - Clear API surface for all ICP operations
7. **Organization** - Functions grouped by domain for better discoverability

## Environment Configuration

The ICP integration automatically handles different environments:

- **Development**: Uses local canister IDs and localhost
- **Production**: Uses mainnet canister IDs and icp0.io
- **Environment Variables**: Can be overridden with specific env vars

See `splitDapp/` directory for detailed environment configuration logic.

## File Organization

All files are organized into logical folders with barrel exports (`index.ts`) for easy importing:

- **`admin/`** - Admin operations and permissions
- **`apiKeys/`** - API key management
- **`balance/`** - Balance checking methods
- **`chat/`** - Chat functionality
- **`contacts/`** - Contact management
- **`escrow/`** - Escrow operations
- **`feedback/`** - Feedback system
- **`fileStorage/`** - File storage operations
- **`milestone/`** - Milestone management
- **`notifications/`** - Push notifications
- **`splitDapp/`** - Actor creation and configuration
- **`transaction/`** - Transaction creation
- **`transactions/`** - Transaction queries
- **`user/`** - User management
- **`vouchers/`** - Voucher system
- **`withdraw/`** - Withdrawal operations

Each folder contains:
- Individual method files
- `index.ts` - Barrel export file
- `types.ts` - Folder-specific types (if needed)

All types are centralized in the main `types.ts` file for consistency.
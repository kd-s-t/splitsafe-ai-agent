// Shared types across all modules - only types used in multiple modules

// Phone number interface
export interface PhoneNumber {
  country: string; // Country code like "+63"
  number: string;  // Phone number like "9606075119"
}

// Common recipient interface - used in escrow and transactions modules
export interface Recipient {
  id: string;
  principal: string;
  percentage: number;
  name?: string;
  email?: string;
  phone?: PhoneNumber;
  billingAddress?: string;
}

// Common message interface for chat functionality - used in agent module
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Chat message interface for escrow chat - used in agent module
export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  message: string;
  timestamp: Date;
  escrowId: string;
}

// Escrow type definitions - used in escrow module
export type EscrowType = 'basic' | 'milestone';

// Release payment types for monthly payment tracking
export type PaymentStatus = 'pending' | 'proof_submitted' | 'approved' | 'paid' | 'failed';
export type ReleaseStatus = 'pending' | 'partial' | 'completed' | 'failed' | 'skipped';
export type ReleaseType = 'automatic' | 'manual' | 'catchup';

export interface RecipientPayment {
  recipientId: string; // Recipient identifier
  recipientName: string; // Recipient name for display
  amount: string; // Amount paid to this recipient (bigint as string)
}

export interface RecipientPayment {
  recipientId: string; // Recipient ID
  recipientName: string; // Recipient name
  amount: string; // Amount paid to this recipient (bigint as string)
}

export interface ReleasePayment {
  id: number; // Release payment ID (1, 2, 3, etc.)
  monthNumber: number; // Which month this is (1-6)
  releasedAt?: string; // Timestamp when released (bigint as string, null if pending)
  total: string; // Total amount released this month (bigint as string)
  recipientPayments: RecipientPayment[]; // Individual recipient payments
}

// Milestone interface - used in escrow module
export interface Milestone {
  id: string; // Unique milestone ID
  title: string; // Milestone title/description
  allocation: string; // Total allocation amount (bigint as string)
  coin: string; // Coin type (e.g., "ckbtc", "icp", "sei")
  recipients: MilestoneRecipient[]; // Array of recipients
  startDate: string; // Start date timestamp (bigint as string)
  endDate: string; // End date timestamp (bigint as string)
  createdAt: string; // When milestone was created (bigint as string)
  frequency: string; // Milestone frequency (e.g., "day-1", "day-15", etc.)
  duration: number; // Duration in months
  // Contract file content or reference (optional)
  releasePayments: ReleasePayment[]; // NEW: Track monthly payments
  completedAt?: string; // When milestone was completed (bigint as string)
}

export interface MonthlyProofOfWork {
  monthNumber: number;
  description?: string;
  screenshotIds: string[];
  fileIds: string[];
  submittedAt?: string;
  approvedAt?: string;
}

export interface MilestoneRecipient {
  id: string;
  name: string;
  principal: string;
  share: string; // Amount as string (bigint)
  email?: string; // Optional email address
  phone?: PhoneNumber; // Optional phone number
  billingAddress?: string; // Optional billing address
  approvedAt?: string; // When approved (bigint as string)
  declinedAt?: string; // When declined (bigint as string)
  monthlyProofOfWork: MonthlyProofOfWork[]; // Array of monthly proof of work
  proofOfWorkDescription?: string; // Rich text description of work accomplished (DEPRECATED)
  proofOfWorkScreenshotIds: string[]; // Array of file IDs for screenshots (DEPRECATED)
  proofOfWorkFileIds: string[]; // Array of file IDs for additional files (DEPRECATED)
  proofOfWorkSubmittedAt?: string; // When proof of work was submitted (bigint as string) (DEPRECATED)
  proofOfWorkApprovedAt?: string; // When proof of work was approved (bigint as string) (DEPRECATED)
}

// Milestone escrow recipient - for contract signing at milestone escrow level
export interface MilestoneEscrowRecipient {
  id: string;
  name: string;
  principal: string;
  signedContractFile?: string; // The signed contract file uploaded by recipient
  signedContractAt?: string; // When the signed contract was uploaded (bigint as string)
  clientApprovedSignedContractAt?: string; // When the client approved the signed contract (bigint as string)
}

// Transaction status types - used in transactions module
export type TransactionStatus = "pending" | "confirmed" | "released" | "cancelled" | "refund" | "declined";

// Common loading states - used in transactions module
export type LoadingState = "approve" | "decline" | "cancel" | "release" | "refund" | "edit" | null | false | true | string;

// Common step interface for multi-step processes - used in transactions module
export interface Step {
  label: string;
  description: string;
}

// ===== TRANSACTION TYPES =====

// Core transaction recipient entry - matches ICP ToEntry schema exactly
export interface ToEntry {
  principal: string; // Principal as string representation
  name: string; // Text in blockchain
  amount: bigint; // Nat in blockchain
  percentage: number; // Nat in blockchain
  status: { pending?: null } | { approved?: null } | { declined?: null } | { noaction?: null }; // Matches blockchain enum
  approvedAt?: string; // ?Nat in blockchain
  declinedAt?: string; // ?Nat in blockchain
  readAt?: string; // ?Nat in blockchain
}

// Main escrow transaction interface - matches ICP Transaction schema exactly
export interface EscrowTransaction {
  id: string; // Text in blockchain
  from: string; // Principal as string representation
  to: ToEntry[]; // [ToEntry] in blockchain
  amount: bigint; // Nat in blockchain - main transaction amount
  funds_allocated?: bigint; // Nat in blockchain - funds allocated for the transaction
  readAt?: string; // ?Nat in blockchain
  status: TransactionStatus; // TransactionStatus (Text) in blockchain
  title: string; // Text in blockchain
  kind?: string | object; // Transaction kind (basic_escrow, milestone_escrow, etc.) - can be string or variant object
  createdAt: string; // Nat in blockchain
  confirmedAt?: string; // ?Nat in blockchain
  cancelledAt?: string; // ?Nat in blockchain
  refundedAt?: string; // ?Nat in blockchain
  releasedAt?: string; // ?Nat in blockchain
  chatId?: string; // ?Text in blockchain
  constellationHashes?: Array<{
    action: string;
    hash: string;
    timestamp: string;
  }>; // [ConstellationHashEntry] in blockchain - Constellation Network tamper-proof hashes array
  // Story Protocol (Aeneid) tracking
  storyIpAssetId?: string[]; // IP Account address representing this escrow
  storyTxs?: Array<{
    action: string;
    txHash: string;
    timestamp: string;
  }>;
  basicData?: Array<{
    to: ToEntry[];
    useSeiAcceleration: boolean;
  }>;
  milestoneData?: {
    milestones: Milestone[];
    contractSigningDateBefore?: string;
    contractFile?: string;
    contractFileId?: string[];
    clientApprovedSignedAt?: string;
    recipients?: MilestoneEscrowRecipient[];
  }; // Milestone data from backend
}

// Normalized transaction interface for Redux storage and UI components
// This maintains compatibility with existing Redux state while using blockchain schema structure
export interface NormalizedTransaction {
  id: string;
  status: string;
  title: string;
  kind?: string | object;
  from: string;
  amount: string; // Main transaction amount - converted to string for Redux storage
  funds_allocated?: string; // Funds allocated for the transaction - converted to string for Redux storage
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  releasedAt?: string;
  readAt?: string;
  chatId?: string;
  constellationHashes?: Array<{
    action: string;
    hash: string;
    timestamp: string;
  }>;
  // Story Protocol (Aeneid) tracking
  storyIpAssetId?: string[]; // IP Account address representing this escrow
  storyTxs?: Array<{
    action: string;
    txHash: string;
    timestamp: string;
  }>;
  milestoneData?: {
    milestones: Milestone[];
    contractSigningDateBefore?: string;
    contractFile?: string;
    contractFileId?: string[];
    clientApprovedSignedAt?: string;
    recipients?: MilestoneEscrowRecipient[];
  }; // Milestone data from backend
  to: Array<{
    principal: string;
    amount: string; // Converted to string for Redux storage
    percentage: string; // Converted to string for Redux storage
    status: { pending?: null } | { approved?: null } | { declined?: null } | { noaction?: null };
    name: string;
    approvedAt?: string;
    declinedAt?: string;
    readAt?: string;
  }>;
}

// Payment Gateway Transaction Types
export interface PaymentGatewayTransaction {
  id: string;
  from: string;
  to: string;
  amount: string; // in e8s
  memo?: string;
  merchantId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  fee: string; // in e8s
}

// Business Log Types for Payment Gateway Analytics
export interface BusinessLog {
  transactionId: string;
  from: string;
  to: string;
  amount: string; // in e8s
  fee: string; // in e8s
  memo?: string;
  merchantId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

// Unified Transaction Type - combines escrow and payment gateway transactions
export interface UnifiedTransaction {
  id: string;
  type: 'escrow' | 'payment_gateway';
  status: string;
  title: string;
  from: string;
  amount: string;
  createdAt: string;
  // Escrow-specific fields
  kind?: string | object;
  confirmedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  releasedAt?: string;
  readAt?: string;
  chatId?: string;
  milestoneData?: {
    milestones: Milestone[];
    contractSigningDateBefore?: string;
    contractFile?: string;
    contractFileId?: string[];
    clientApprovedSignedAt?: string;
    recipients?: MilestoneEscrowRecipient[];
  };
  to?: Array<{
    principal: string;
    amount: string;
    percentage: string;
    status: { pending?: null } | { approved?: null } | { declined?: null } | { noaction?: null };
    name: string;
    approvedAt?: string;
    declinedAt?: string;
    readAt?: string;
  }>;
  // Payment Gateway-specific fields
  memo?: string;
  merchantId?: string;
  completedAt?: string;
  fee?: string;
}

// API response types for better type safety with ICP backend
// These match the raw ICP response format before type conversion
export interface ApiToEntry {
  principal: unknown; // Principal from ICP
  amount: unknown; // Nat from ICP
  percentage: unknown; // Nat from ICP
  status: unknown; // Enum from ICP
  name: string; // Text from ICP
  approvedAt?: unknown; // ?Nat from ICP
  declinedAt?: unknown; // ?Nat from ICP
  readAt?: unknown; // ?Nat from ICP
}

export interface ApiTransaction {
  id: string; // Text from ICP
  from: unknown; // Principal from ICP
  to: ApiToEntry[]; // [ToEntry] from ICP
  amount?: unknown; // Nat from ICP - main transaction amount
  readAt?: unknown; // ?Nat from ICP
  status: string; // TransactionStatus (Text) from ICP
  title: string; // Text from ICP
  createdAt: unknown; // Nat from ICP
  confirmedAt?: unknown; // ?Nat from ICP
  cancelledAt?: unknown; // ?Nat from ICP
  refundedAt?: unknown; // ?Nat from ICP
  releasedAt?: unknown; // ?Nat from ICP
  chatId?: unknown; // ?Text from ICP
  milestones?: unknown; // [Milestone] from ICP - array of full milestone objects
}

// Activity types for dashboard
export interface ActivityItem {
  id?: string;
  from: unknown;
  to?: Array<{
    principal: unknown;
    amount?: unknown;
    percentage?: unknown;
    status?: unknown;
    name?: string;
  }>;
  kind?: unknown;
  status?: string;
  title?: string;
  createdAt?: unknown;
}

// Transaction filter types
export interface TransactionFilters {
  searchTerm: string;
  statusFilter: string;
  transactionsFilter: string;
}

// Transaction component prop types
export interface TransactionDetailsModalProps {
  transaction: EscrowTransaction | null;
  onClose: () => void;
}

export interface PendingEscrowDetailsProps {
  hideOverview?: boolean;
  transaction: EscrowTransaction | NormalizedTransaction;
  escrow?: EscrowTransaction | NormalizedTransaction;
  currentUserPrincipal?: string;
  onCancel?: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
  isLoading?: LoadingState;
}

export interface EditEscrowDetailsProps {
  transaction: EscrowTransaction | NormalizedTransaction;
  escrow?: EscrowTransaction | NormalizedTransaction;
  onCancel?: () => void;
  onEdit?: () => void;
  isLoading?: LoadingState;
}

export interface CancelledEscrowDetailsProps {
  transaction: EscrowTransaction | NormalizedTransaction;
  escrow?: EscrowTransaction | NormalizedTransaction;
}

export interface RefundedEscrowDetailsProps {
  transaction: EscrowTransaction | NormalizedTransaction;
  escrow?: EscrowTransaction | NormalizedTransaction;
}

export interface ConfirmedEscrowActionsProps {
  transaction: EscrowTransaction | NormalizedTransaction;
  escrow?: EscrowTransaction | NormalizedTransaction;
  isLoading: LoadingState;
  onRelease: (id: unknown) => void;
  onRefund: () => void;
}

export interface ReleasedEscrowDetailsProps {
  transaction: EscrowTransaction | NormalizedTransaction;
}

export interface ApprovalSuggestionsProps {
  transactions: NormalizedTransaction[];
}

export interface TransactionExplorerLinksProps {
  transaction: EscrowTransaction | NormalizedTransaction;
}

export interface TimeRemainingProps {
  endTime: string;
  onTimeUp?: () => void;
}

export interface RecipientsListProps {
  recipients: ToEntry[];
  currentUserPrincipal?: string;
  showTimestamps?: boolean;
}

export interface ConfirmedEscrowDetailsProps {
  transaction: EscrowTransaction | NormalizedTransaction;
  onRelease?: (id: unknown) => void;
  onRefund?: () => void;
  isLoading?: boolean | string | null;
}

export interface TransactionLifecycleProps {
  currentStep: number; // 0-based index
  steps?: Step[];
  status?: string; // Transaction status for inactive state
}

// ===== COMMON FORM TYPES =====

// Common form data interface for withdrawal forms
export interface WithdrawFormData {
  amount: string;
  address: string;
  isAcceptedTerms: boolean;
}

// Common form props interface
export interface FormProps {
  form: import('react-hook-form').UseFormReturn<Record<string, unknown>>;
  isLoading?: boolean;
  error?: string | null;
}

// Common dialog/modal props
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

// Common button props
export interface ButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ===== USER/AUTH TYPES =====

// User profile interface
export interface UserProfile {
  principal: string;
  nickname?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  principal: string | null;
  isLoading: boolean;
  error?: string | null;
}

// ===== COMMON UI TYPES =====

// Loading state for async operations
export interface AsyncState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// ===== SHARED BLOCKCHAIN TYPES =====

/**
 * Generic operation result
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Batch operation result
 */
export interface BatchResult<T = unknown> {
  results: OperationResult<T>[];
  successCount: number;
  errorCount: number;
}

// Pagination interface
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Search/filter state
export interface SearchState {
  query: string;
  filters: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Helper function to convert NormalizedTransaction.to to ToEntry[]
export function convertNormalizedToToEntry(normalizedTo: NormalizedTransaction['to']): ToEntry[] {
  return normalizedTo.map(entry => {
    // Debug logging to see what we're working with
    console.log('🔍 convertNormalizedToToEntry Debug:', {
      entry,
      amountType: typeof entry.amount,
      amountValue: entry.amount,
      percentageType: typeof entry.percentage,
      percentageValue: entry.percentage,
      hasAmount: 'amount' in entry,
      hasFundsAllocated: 'funds_allocated' in entry
    });

    // Handle amount - check for both 'amount' and 'funds_allocated' fields
    let amountValue = '0';
    if (entry.amount !== undefined && entry.amount !== null && entry.amount !== '' && entry.amount !== 'undefined') {
      amountValue = String(entry.amount);
    } else if ('funds_allocated' in entry && entry.funds_allocated !== undefined && entry.funds_allocated !== null && entry.funds_allocated !== '' && entry.funds_allocated !== 'undefined') {
      amountValue = String(entry.funds_allocated);
    }

    // Handle percentage
    let percentageValue = '0';
    if (entry.percentage !== undefined && entry.percentage !== null && entry.percentage !== '' && entry.percentage !== 'undefined') {
      percentageValue = String(entry.percentage);
    }

    return {
      principal: entry.principal,
      name: entry.name,
      amount: BigInt(amountValue),
      percentage: Number(percentageValue),
      status: entry.status,
      approvedAt: entry.approvedAt,
      declinedAt: entry.declinedAt,
      readAt: entry.readAt,
    };
  });
}

// Helper function to check if transaction.to is from NormalizedTransaction
export function isNormalizedTransactionTo(transaction: EscrowTransaction | NormalizedTransaction): transaction is NormalizedTransaction {
  return transaction.to.length > 0 && typeof transaction.to[0].amount === 'string';
}

// Helper function to get ToEntry[] from either transaction type
export function getToEntryArray(transaction: EscrowTransaction | NormalizedTransaction): ToEntry[] {
  if (isNormalizedTransactionTo(transaction)) {
    return convertNormalizedToToEntry(transaction.to);
  }
  return transaction.to;
}

// Helper function to check if a transaction is a milestone transaction
export function isMilestoneTransaction(transaction: EscrowTransaction | NormalizedTransaction): boolean {
  // First check the kind field if available (most reliable)
  if (transaction.kind) {
    // Handle variant object from Motoko backend
    if (typeof transaction.kind === 'object' && transaction.kind !== null) {
      const kindStr = JSON.stringify(transaction.kind);
      return kindStr.includes('milestone');
    }
    // Handle string kind
    if (typeof transaction.kind === 'string') {
      return transaction.kind.includes('milestone');
    }
  }

  // Fallback to checking milestoneData array
  return !!(transaction.milestoneData && transaction.milestoneData.milestones?.length > 0);
}

// Helper function to check if a transaction is a basic escrow
export function isBasicEscrowTransaction(transaction: EscrowTransaction | NormalizedTransaction): boolean {
  // First check the kind field if available (most reliable)
  if (transaction.kind) {
    // Handle variant object from Motoko backend
    if (typeof transaction.kind === 'object' && transaction.kind !== null) {
      const kindStr = JSON.stringify(transaction.kind);
      return kindStr.includes('basic');
    }
    // Handle string kind
    if (typeof transaction.kind === 'string') {
      return transaction.kind.includes('basic');
    }
  }

  // Fallback: if it's not a milestone, it's likely a basic escrow
  return !isMilestoneTransaction(transaction);
}

// Helper functions for unified transactions
export function isPaymentGatewayTransaction(transaction: UnifiedTransaction): boolean {
  return transaction.type === 'payment_gateway';
}

export function isEscrowTransaction(transaction: UnifiedTransaction): boolean {
  return transaction.type === 'escrow';
}

export function convertToUnifiedTransaction(
  escrowTx: NormalizedTransaction | null,
  paymentGatewayTx: PaymentGatewayTransaction | null
): UnifiedTransaction | null {
  if (escrowTx) {
    return {
      id: escrowTx.id,
      type: 'escrow',
      status: escrowTx.status,
      title: escrowTx.title,
      from: escrowTx.from,
      amount: escrowTx.amount,
      createdAt: escrowTx.createdAt,
      kind: escrowTx.kind,
      confirmedAt: escrowTx.confirmedAt,
      cancelledAt: escrowTx.cancelledAt,
      refundedAt: escrowTx.refundedAt,
      releasedAt: escrowTx.releasedAt,
      readAt: escrowTx.readAt,
      chatId: escrowTx.chatId,
      milestoneData: escrowTx.milestoneData,
      to: escrowTx.to,
    };
  } else if (paymentGatewayTx) {
    return {
      id: paymentGatewayTx.id,
      type: 'payment_gateway',
      status: paymentGatewayTx.status,
      title: paymentGatewayTx.memo || `Payment to ${paymentGatewayTx.merchantId || 'Merchant'}`,
      from: paymentGatewayTx.from,
      amount: paymentGatewayTx.amount,
      createdAt: paymentGatewayTx.createdAt,
      memo: paymentGatewayTx.memo,
      merchantId: paymentGatewayTx.merchantId,
      completedAt: paymentGatewayTx.completedAt,
      fee: paymentGatewayTx.fee,
    };
  }
  return null;
}


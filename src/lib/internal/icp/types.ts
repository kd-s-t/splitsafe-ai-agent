import { Principal } from '@dfinity/principal';


export interface PrincipalObject {
  _isPrincipal: boolean;
  toString(): string;
}

export interface PrincipalWithInternals {
  _arr?: number[];
  _isPrincipal?: boolean;
  toText(): string;
}


export type TransactionKind = { 'milestone_escrow': null } | { 'basic_escrow': null } | { 'withdraw': null };

export type CreateBasicEscrowRequest = {
  title: string;
  participants: ParticipantShare[];
  useSeiAcceleration: boolean;
};

export type CreateWithdrawRequest = {
  withdrawData: {
    icp?: {
      recipientAddress: string;
      amount: bigint;
    };
    btc?: {
      recipientAddress: string;
      amount: bigint;
    };
  };
};

export type CreateTransactionRequest = 
  | { basic_escrow: CreateBasicEscrowRequest }
  | { withdraw: CreateWithdrawRequest };

export type CreateTransactionResult = {
  ok?: { transactionId: string };
  err?: string;
};


export interface PhoneNumber {
  country: string; // Country code like "+63"
  number: string;  // Phone number like "9606075119"
}

export interface MilestoneRecipientRequest {
  id: string;
  name: string;
  principal: Principal;
  share: bigint; // Share amount in satoshis
}

export interface MilestoneRecipient {
  id: string;
  name: string;
  principal: Principal;
  share: bigint; // Share amount in satoshis
  email: [] | [string]; // Motoko optional type - empty array for null
  phone: [] | [PhoneNumber]; // Motoko optional type - empty array for null
  billingAddress: [] | [string]; // Motoko optional type - empty array for null
  approvedAt: [] | [bigint]; // Motoko optional type
  declinedAt: [] | [bigint]; // Motoko optional type
  recipientSignedAt: [] | [bigint]; // Motoko optional type
  signedContractFile: [] | [string]; // Motoko optional type
  signedContractAt: [] | [bigint]; // Motoko optional type
}

export interface InitiateMilestoneRequest {
  title: string;
  allocation: bigint; // Total allocation in satoshis
  coin: string;
  recipients: MilestoneRecipientRequest[];
  startDate: bigint; // Start date timestamp
  frequency: { day: bigint }; // Motoko variant format
  duration: bigint; // Duration in months/weeks/years
  contractSigningPeriod?: [] | [bigint]; // Contract signing period in days
  contractFile?: [] | [string]; // Contract file content or reference (Motoko optional type)
}

export interface InitiateMultipleMilestonesRequest {
  title: string; // Transaction title
  milestones: InitiateMilestoneRequest[]; // Array of milestone requests
  contractFile?: [] | [string]; // Contract file for the entire milestone escrow (Motoko optional type)
}

export type MilestoneResult = 
  | { err: string }
  | { ok: { milestoneId: string; transactionId: string } };


export interface UserInfo {
  nickname: [] | [string];
  username: [] | [string];
  picture: [] | [string];
  email: [] | [string];
  balance: bigint;
}

export interface UserWithPrincipal {
  principal: Principal;
  userInfo: UserInfo;
}

export interface SaveInfoRequest {
  nickname: [] | [string];
  username: [] | [string];
  picture: [] | [string];
  email: [] | [string];
}


export interface Voucher {
  id: string;
  code: string;
  amount: bigint;
  description: string;
  createdBy: Principal;
  expiredAt: bigint;
  createdAt: bigint;
  redeemAt: bigint; // 0 means not redeemed
}

export interface VoucherFormData {
  code: string;
  amount: number;
  description: string;
  expiredAt: Date;
}

export interface CreateVoucherResult {
  success: boolean;
  voucher?: Voucher;
  error?: string;
}

export interface RedeemVoucherResult {
  success: boolean;
  amount?: bigint;
  newBalance?: bigint;
  redeemAt?: bigint;
  error?: string;
}

export interface ValidateVoucherResult {
  valid: boolean;
  voucher?: Voucher;
  error?: string;
}

export interface VoucherResult {
  ok?: string;
  err?: string;
}


export interface ChatMessage {
  id: string;
  senderPrincipalId: { toString(): string };
  senderName: string;
  message: string;
  senderAt: bigint;
  chatId: string;
}

export interface ProcessedChatMessage {
  id: string;
  sender: string;
  senderName: string;
  name: string;
  message: string;
  timestamp: Date;
  escrowId: string;
}

export interface ICPActor {
  sendMessage: (escrowId: string, message: string, senderName: string, sender: string) => Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  getMessages: (escrowId: string, limit: number[], caller: string) => Promise<ChatMessage[]>;
  getMessageCount: (escrowId: string) => Promise<bigint>;
  searchMessages: (escrowId: string, searchQuery: string) => Promise<ChatMessage[]>;
}


export interface Contact {
  id: string;
  ownerId: string;
  nickname: string;
  principalid: string;
  createdAt: number;
  updatedAt?: number;
}

export interface ContactResult {
  ok?: string;
  err?: string;
}


export interface SubmitFeedbackRequest {
  name: string;
  email: string;
  rating: number;
  message: string;
  userAgent?: string;
  ipAddress?: string;
  principal?: Principal;
}

export interface AnonymousFeedback {
  id: string;
  rating: number;
  message: string;
  timestamp: number;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  userAgent?: string;
  timestamp: number;
  submittedBy?: string;
}

export interface FeedbackStats {
  totalCount: number;
  averageRating: number;
}


export type FileType = 
  | { png: null }
  | { jpg: null }
  | { jpeg: null }
  | { pdf: null }
  | { svg: null }
  | { txt: null }
  | { doc: null }
  | { docx: null }
  | { other: null };

export interface FileStorageActor {
  uploadFile: (filename: string, fileType: FileType, base64Data: string) => Promise<string>;
  getFileInfo: (fileId: string) => Promise<FileInfo[]>;
  getFileBase64: (fileId: string) => Promise<string[]>;
  deleteFile: (fileId: string) => Promise<boolean>;
  getFilesByUser: () => Promise<StoredFile[]>;
}

export interface StoredFile {
  id: string;
  filename: string;
  fileType: FileType;
  uploadedAt: bigint;
  uploadedBy: string; // Principal as string
}

export interface FileInfo {
  id: string;
  filename: string;
  fileType: FileType;
  uploadedAt: bigint;
  uploadedBy: string; // Principal as string
}


export interface CanisterTransaction {
  id: string;
  status: string;
  title: string;
  [key: string]: unknown;
}

export interface CanisterPaginatedResult {
  transactions: CanisterTransaction[];
  totalCount: bigint | number;
  totalPages: bigint | number;
}


export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: string;
  lastUsed: bigint | null;
  revokedAt: bigint | null;
  permissions: string[];
  createdAt: bigint;
  owner: string;
}

export interface ApiKeyListResult {
  keys: ApiKey[];
  total: number;
}

export interface ApiKeyResult {
  ok?: ApiKey;
  err?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
}

export interface ICPResult<T> {
  ok?: T;
  err?: string;
}

// ===== ICP-SPECIFIC TYPES MOVED FROM blockchain/types.ts =====

/**
 * ICP Principal type - re-exported for convenience
 */
export type ICPPrincipal = Principal;

/**
 * Standard ICP result type for operations that can succeed or fail
 */
export type ICPResultType<T = string> = { ok: T } | { err: string };

/**
 * Participant in an escrow transaction
 */
export interface ParticipantShare {
  principal: Principal;
  nickname: string;
  amount: bigint;
  percentage: number;
}

/**
 * Escrow creation parameters
 */
export interface EscrowParams {
  caller: Principal;
  participants: ParticipantShare[];
  title: string;
  useSeiAcceleration?: boolean;
}

/**
 * User balance information
 */
export interface UserBalances {
  icp: string | null;
  ckbtc: string | null;
  sei: string | null;
}

/**
 * Paginated transactions result
 */
export interface PaginatedTransactions {
  transactions: Record<string, unknown>[]; // Will be replaced with proper transaction type from shared.types.ts
  totalCount: number;
  totalPages: number;
}

/**
 * Transaction query parameters
 */
export interface TransactionQuery {
  principal: Principal;
  offset?: bigint;
  limit?: bigint;
}

/**
 * Withdrawal parameters
 */
export interface WithdrawalParams {
  principal: Principal;
  amount: bigint;
  address: string;
}

/**
 * Withdrawal result
 */
export type WithdrawalResult = ICPResultType<string>;

/**
 * Supported withdrawal currencies
 */
export type WithdrawalCurrency = 'ICP' | 'BTC' | 'SEI';

/**
 * SplitDapp actor interface - core methods available on the actor
 */
export interface SplitDappActor {
  getBalance: (principal: Principal) => Promise<bigint>;
  getUserBitcoinBalance: (principal: Principal) => Promise<number>;
  getUserSeiBalance: (principal: Principal) => Promise<number>;
  
  getUserName: (principal: Principal) => Promise<string>;
  getUserNickname: (principal: Principal) => Promise<string>;
  
  initiateEscrow: (caller: Principal, participants: ParticipantShare[], title: string, useSeiAcceleration: boolean) => Promise<string>;
  recipientApproveEscrow: (senderPrincipal: Principal, transactionId: string, recipientPrincipal: Principal) => Promise<void>;
  recipientDeclineEscrow: (senderPrincipal: Principal, transactionIndex: number, recipientPrincipal: Principal) => Promise<void>;
  cancelSplit: (initiatorPrincipal: Principal) => Promise<void>;
  releaseSplit: (initiatorPrincipal: Principal, transactionId: string) => Promise<void>;
  refundSplit: (initiatorPrincipal: Principal) => Promise<void>;
  
  getTransaction: (transactionId: string, callerPrincipal: Principal) => Promise<Record<string, unknown>>; // Will be replaced with proper transaction type from shared.types.ts
  getTransactionsPaginated: (principal: Principal, page: number, pageSize: number) => Promise<PaginatedTransactions>;
  
  withdrawIcp: (principal: Principal, amount: bigint, address: string) => Promise<WithdrawalResult>;
  withdrawBtc: (principal: Principal, amount: bigint, address: string) => Promise<WithdrawalResult>;
  
  sendMessage?: (escrowId: string, message: string, senderName: string, sender: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  getMessages?: (escrowId: string, limit: number[], caller: string) => Promise<ChatMessage[]>;
  getMessageCount?: (escrowId: string) => Promise<bigint>;
  searchMessages?: (escrowId: string, searchQuery: string) => Promise<ChatMessage[]>;
}

/**
 * Environment configuration for ICP
 */
export interface ICPEnvironment {
  host: string;
  canisterId: string;
  isLocal: boolean;
  isMainnet: boolean;
}

/**
 * Network configuration
 */
export type ICPNetwork = 'local' | 'mainnet' | 'testnet';

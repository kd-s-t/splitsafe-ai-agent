import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ActivitySeverity = { 'low' : null } |
  { 'high' : null } |
  { 'critical' : null } |
  { 'medium' : null };
export type AlertType = { 'usage_spike' : null } |
  { 'failed_authentication' : null } |
  { 'unusual_pattern' : null } |
  { 'key_compromise_suspected' : null } |
  { 'new_ip_address' : null };
export type ApiKeyError = { 'invalid_permissions' : null } |
  { 'not_found' : null } |
  { 'invalid_key_format' : null } |
  { 'rate_limit_exceeded' : null } |
  { 'key_already_exists' : null } |
  { 'suspicious_activity' : null } |
  { 'usage_limit_exceeded' : null } |
  { 'unauthorized' : null } |
  { 'key_expired' : null };
export type ApiKeyId = string;
export interface ApiKeyListResponse {
  'total' : bigint,
  'keys' : Array<ApiKeyResponse>,
}
export type ApiKeyListResult = { 'ok' : ApiKeyListResponse } |
  { 'err' : ApiKeyError };
export interface ApiKeyResponse {
  'id' : ApiKeyId,
  'key' : string,
  'status' : ApiKeyStatus,
  'permissions' : Array<Permission>,
  'expiresAt' : [] | [Time],
  'owner' : Principal,
  'name' : string,
  'createdAt' : Time,
  'usageCount' : bigint,
  'lastUsedFrom' : [] | [string],
  'lastUsed' : [] | [Time],
  'revokedAt' : [] | [Time],
}
export type ApiKeyResult = { 'ok' : ApiKeyResponse } |
  { 'err' : ApiKeyError };
export type ApiKeyStatus = { 'active' : null } |
  { 'revoked' : null } |
  { 'expired' : null };
export interface ApiKeyUsage {
  'id' : string,
  'method' : string,
  'endpoint' : string,
  'errorCode' : [] | [string],
  'timestamp' : Time,
  'success' : boolean,
  'userAgent' : [] | [string],
  'responseTime' : [] | [bigint],
  'keyId' : ApiKeyId,
  'ipAddress' : [] | [string],
}
export interface BasicEscrowData {
  'to' : Array<ToEntry>,
  'useSeiAcceleration' : boolean,
}
export interface BusinessLog {
  'to' : Principal,
  'fee' : bigint,
  'status' : PaymentStatus,
  'completedAt' : [] | [bigint],
  'from' : Principal,
  'memo' : [] | [string],
  'createdAt' : bigint,
  'merchantId' : [] | [string],
  'amount' : bigint,
  'transactionId' : string,
}
export interface ChatMessage {
  'id' : string,
  'senderPrincipalId' : Principal,
  'message' : string,
  'senderName' : string,
  'chatId' : string,
  'senderAt' : bigint,
}
export interface ChatMessageResult {
  'messageId' : [] | [string],
  'error' : [] | [string],
  'success' : boolean,
}
export interface ConstellationHashEntry {
  'action' : string,
  'hash' : string,
  'timestamp' : bigint,
}
export interface Contact {
  'id' : string,
  'nickname' : string,
  'ownerId' : Principal,
  'createdAt' : bigint,
  'updatedAt' : [] | [bigint],
  'principalid' : Principal,
}
export interface CreateApiKeyRequest {
  'permissions' : Array<Permission>,
  'name' : string,
}
export interface CreateBasicEscrowRequest {
  'title' : string,
  'participants' : Array<ParticipantShare>,
  'useSeiAcceleration' : boolean,
}
export interface CreatePaymentGatewayRequest {
  'to' : Principal,
  'memo' : [] | [string],
  'merchantId' : [] | [string],
  'amount' : bigint,
  'useSeiAcceleration' : boolean,
}
export type CreateTransactionRequest = { 'withdraw' : CreateWithdrawRequest } |
  { 'basic_escrow' : CreateBasicEscrowRequest } |
  { 'payment_gateway' : CreatePaymentGatewayRequest };
export type CreateTransactionResult = {
    'ok' : {
      'title' : [] | [string],
      'recipients' : [] | [Array<ParticipantShare>],
      'recipientCount' : [] | [bigint],
      'amount' : [] | [bigint],
      'transactionId' : string,
    }
  } |
  { 'err' : string };
export interface CreateWithdrawRequest { 'withdrawData' : WithdrawData }
export interface Feedback {
  'id' : string,
  'name' : string,
  'submittedBy' : [] | [Principal],
  'message' : string,
  'timestamp' : bigint,
  'rating' : bigint,
  'userAgent' : [] | [string],
  'ipAddress' : [] | [string],
}
export type FeedbackResult = { 'ok' : string } |
  { 'err' : string };
export interface FeedbackStats {
  'totalCount' : bigint,
  'averageRating' : number,
}
export type FileType = { 'doc' : null } |
  { 'jpg' : null } |
  { 'pdf' : null } |
  { 'png' : null } |
  { 'svg' : null } |
  { 'txt' : null } |
  { 'other' : null } |
  { 'docx' : null } |
  { 'jpeg' : null };
export interface FraudActivity {
  'activityType' : string,
  'timestamp' : bigint,
  'transactionId' : string,
}
export type GetFeedbackByPrincipalResult = { 'ok' : [] | [Feedback] } |
  { 'err' : string };
export type HasSubmittedFeedbackByIPResult = { 'ok' : boolean } |
  { 'err' : string };
export type HasSubmittedFeedbackByPrincipalResult = { 'ok' : boolean } |
  { 'err' : string };
export type HasSubmittedFeedbackResult = { 'ok' : boolean } |
  { 'err' : string };
export interface InitiateMilestoneRequest {
  'contractSigningPeriod' : [] | [bigint],
  'title' : string,
  'duration' : bigint,
  'coin' : string,
  'contractFile' : [] | [string],
  'recipients' : Array<MilestoneRecipientRequest>,
  'frequency' : MilestoneFrequency,
  'allocation' : bigint,
  'startDate' : bigint,
}
export interface InitiateMultipleMilestonesRequest {
  'title' : string,
  'contractFile' : [] | [string],
  'milestones' : Array<InitiateMilestoneRequest>,
}
export interface Milestone {
  'id' : string,
  'title' : string,
  'duration' : bigint,
  'endDate' : bigint,
  'coin' : string,
  'createdAt' : bigint,
  'recipients' : Array<MilestoneRecipient>,
  'frequency' : MilestoneFrequency,
  'allocation' : bigint,
  'startDate' : bigint,
  'releasePayments' : Array<ReleasePayment>,
}
export interface MilestoneEscrowData {
  'contractSigningDateBefore' : [] | [bigint],
  'clientApprovedSignedAt' : [] | [bigint],
  'contractFileId' : [] | [string],
  'recipients' : Array<MilestoneEscrowRecipient>,
  'milestones' : Array<Milestone>,
}
export interface MilestoneEscrowRecipient {
  'id' : string,
  'signedContractAt' : [] | [bigint],
  'principal' : Principal,
  'name' : string,
  'signedContractFileId' : [] | [string],
  'clientApprovedSignedContractAt' : [] | [bigint],
}
export type MilestoneFrequency = { 'day' : bigint };
export interface MilestoneRecipient {
  'id' : string,
  'principal' : Principal,
  'billingAddress' : [] | [string],
  'approvedAt' : [] | [bigint],
  'name' : string,
  'email' : [] | [string],
  'share' : bigint,
  'monthlyProofOfWork' : Array<MonthlyProofOfWork>,
  'declinedAt' : [] | [bigint],
  'phone' : [] | [PhoneNumber],
}
export interface MilestoneRecipientRequest {
  'id' : string,
  'principal' : Principal,
  'name' : string,
  'share' : bigint,
}
export type MilestoneResult = {
    'ok' : { 'milestoneId' : string, 'transactionId' : string }
  } |
  { 'err' : string };
export interface MonthlyProofOfWork {
  'approvedAt' : [] | [bigint],
  'screenshotIds' : Array<string>,
  'submittedAt' : [] | [bigint],
  'description' : [] | [string],
  'monthNumber' : bigint,
  'fileIds' : Array<string>,
}
export interface ParticipantShare {
  'principal' : Principal,
  'nickname' : string,
  'amount' : bigint,
  'percentage' : bigint,
}
export type PaymentStatus = { 'cancelled' : null } |
  { 'pending' : null } |
  { 'completed' : null } |
  { 'failed' : null };
export type Permission = { 'admin' : null } |
  { 'escrow_delete' : null } |
  { 'webhook_manage' : null } |
  { 'escrow_create' : null } |
  { 'escrow_update' : null } |
  { 'milestone_release' : null } |
  { 'escrow_read' : null };
export interface PhoneNumber { 'country' : string, 'number' : string }
export interface RecipientPayment {
  'amount' : bigint,
  'recipientName' : string,
  'recipientId' : string,
}
export interface ReleasePayment {
  'id' : bigint,
  'total' : bigint,
  'monthNumber' : bigint,
  'releasedAt' : [] | [bigint],
  'recipientPayments' : Array<RecipientPayment>,
}
export type Result = { 'ok' : Principal } |
  { 'err' : ApiKeyError };
export type Result_1 = { 'ok' : null } |
  { 'err' : string };
export type Result_2 = { 'ok' : null } |
  { 'err' : ApiKeyError };
export type Result_3 = { 'ok' : UsagePattern } |
  { 'err' : ApiKeyError };
export type Result_4 = { 'ok' : Array<ApiKeyUsage> } |
  { 'err' : ApiKeyError };
export type Result_5 = {
    'ok' : {
      'totalKeys' : bigint,
      'revokedKeys' : bigint,
      'activeKeys' : bigint,
    }
  } |
  { 'err' : ApiKeyError };
export type Result_6 = { 'ok' : Array<UsageAlert> } |
  { 'err' : ApiKeyError };
export type Result_7 = { 'ok' : bigint } |
  { 'err' : ApiKeyError };
export interface SaveInfoRequest {
  'nickname' : [] | [string],
  'username' : [] | [string],
  'email' : [] | [string],
  'picture' : [] | [string],
}
export type ShouldShowFeedbackResult = { 'ok' : boolean } |
  { 'err' : string };
export interface SplitDApp {
  'addBitcoinBalance' : ActorMethod<[Principal, Principal, bigint], boolean>,
  'addContact' : ActorMethod<
    [Principal, Principal, string],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'adminSetBitcoinAddress' : ActorMethod<[Principal, string], boolean>,
  'canUserCreateEscrow' : ActorMethod<[Principal], boolean>,
  'cancelTransaction' : ActorMethod<[Principal], [] | [Transaction]>,
  'cancelVoucher' : ActorMethod<
    [string],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'cleanupExpiredKeys' : ActorMethod<[], Result_7>,
  'clearAllFeedbacks' : ActorMethod<
    [],
    { 'message' : string, 'success' : boolean }
  >,
  'clearUserProfile' : ActorMethod<[Principal, Principal], boolean>,
  'clientApprovedSignedContract' : ActorMethod<
    [string, string, string, Principal],
    Result_1
  >,
  'clientReleaseMilestonePayment' : ActorMethod<
    [string, bigint, Principal],
    Result_1
  >,
  'convertCkBtcToIcp' : ActorMethod<[Principal, Principal, bigint], boolean>,
  'convertIcpToBitcoin' : ActorMethod<[Principal, Principal, bigint], boolean>,
  'convertIcpToSei' : ActorMethod<[Principal, Principal, bigint], boolean>,
  'createApiKey' : ActorMethod<[Principal, CreateApiKeyRequest], ApiKeyResult>,
  'createTransaction' : ActorMethod<
    [Principal, TransactionKind, CreateTransactionRequest],
    CreateTransactionResult
  >,
  'createVoucher' : ActorMethod<
    [Principal, string, bigint, string, bigint],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'deleteContact' : ActorMethod<
    [string],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'deleteEscrowMessages' : ActorMethod<[string], boolean>,
  'deleteFeedback' : ActorMethod<
    [string],
    { 'message' : string, 'success' : boolean }
  >,
  'deleteFile' : ActorMethod<[string], boolean>,
  'generateBitcoinAddress' : ActorMethod<[], [] | [string]>,
  'generateBitcoinAddressForUser' : ActorMethod<[Principal], [] | [string]>,
  'getAdmin' : ActorMethod<[], Principal>,
  'getAlerts' : ActorMethod<[], Result_6>,
  'getAllFeedbacks' : ActorMethod<[], Array<Feedback>>,
  'getAllFeedbacksAnonymous' : ActorMethod<[], Array<Feedback>>,
  'getAllFiles' : ActorMethod<[], Array<StoredFile>>,
  'getAllUsers' : ActorMethod<[], Array<UserWithPrincipal>>,
  'getApiKey' : ActorMethod<[ApiKeyId], ApiKeyResult>,
  'getApiKeyByKey' : ActorMethod<[string], ApiKeyResult>,
  'getBitcoinAddress' : ActorMethod<[Principal], [] | [string]>,
  'getBusinessLogs' : ActorMethod<[Principal], Array<BusinessLog>>,
  'getCkbtcAddressAnonymous' : ActorMethod<
    [],
    {
        'ok' : {
          'owner' : Principal,
          'subaccount' : Subaccount,
          'btcAddress' : string,
        }
      } |
      { 'err' : string }
  >,
  'getCkbtcBalance' : ActorMethod<
    [Principal],
    { 'ok' : bigint } |
      { 'err' : string }
  >,
  'getCkbtcBalanceAnonymous' : ActorMethod<
    [],
    { 'ok' : bigint } |
      { 'err' : string }
  >,
  'getContacts' : ActorMethod<[Principal], Array<Contact>>,
  'getEscrowsWithMessages' : ActorMethod<[], Array<string>>,
  'getFeedbackByPrincipal' : ActorMethod<[], GetFeedbackByPrincipalResult>,
  'getFeedbackCount' : ActorMethod<[], bigint>,
  'getFeedbackStats' : ActorMethod<[], FeedbackStats>,
  'getFile' : ActorMethod<[string], [] | [StoredFile]>,
  'getFileBase64' : ActorMethod<[string], [] | [string]>,
  'getFileCount' : ActorMethod<[], bigint>,
  'getFileInfo' : ActorMethod<
    [string],
    [] | [
      {
        'id' : string,
        'fileType' : FileType,
        'filename' : string,
        'uploadedAt' : bigint,
        'uploadedBy' : Principal,
      }
    ]
  >,
  'getFilesByUser' : ActorMethod<[], Array<StoredFile>>,
  'getFraudHistory' : ActorMethod<[Principal], Array<FraudActivity>>,
  'getInfo' : ActorMethod<[Principal, Principal], [] | [UserInfo]>,
  'getKeyStats' : ActorMethod<[], Result_5>,
  'getLatestMessage' : ActorMethod<[string], [] | [ChatMessage]>,
  'getMessageCount' : ActorMethod<[string], bigint>,
  'getMessages' : ActorMethod<[string, [] | [bigint]], Array<ChatMessage>>,
  'getMyFeedbacks' : ActorMethod<[], Array<Feedback>>,
  'getOrCreateChat' : ActorMethod<
    [string],
    { 'error' : [] | [string], 'chatId' : [] | [string], 'success' : boolean }
  >,
  'getOrRequestCkbtcWallet' : ActorMethod<
    [],
    {
        'ok' : {
          'owner' : Principal,
          'subaccount' : Subaccount,
          'btcAddress' : string,
        }
      } |
      { 'err' : string }
  >,
  'getOrRequestSeiWallet' : ActorMethod<
    [],
    { 'ok' : { 'owner' : Principal, 'seiAddress' : string } } |
      { 'err' : string }
  >,
  'getOrRequestSeiWalletForUser' : ActorMethod<
    [Principal],
    { 'ok' : { 'owner' : Principal, 'seiAddress' : string } } |
      { 'err' : string }
  >,
  'getReputationStats' : ActorMethod<
    [Principal],
    {
      'fraudCount' : bigint,
      'canCreateEscrow' : boolean,
      'reputation' : bigint,
      'isFlagged' : boolean,
    }
  >,
  'getSeiAddress' : ActorMethod<[Principal], [] | [string]>,
  'getSeiBalance' : ActorMethod<
    [Principal],
    { 'ok' : bigint } |
      { 'err' : string }
  >,
  'getSeiBalanceAnonymous' : ActorMethod<
    [],
    { 'ok' : bigint } |
      { 'err' : string }
  >,
  'getSeiFaucetUrl' : ActorMethod<[], [] | [string]>,
  'getSeiNetworkInfo' : ActorMethod<
    [],
    {
      'name' : string,
      'rpcUrl' : string,
      'explorerUrl' : string,
      'prefix' : string,
      'isTestnet' : boolean,
      'chainId' : string,
    }
  >,
  'getTransaction' : ActorMethod<[Principal, string], [] | [Transaction]>,
  'getTransactionsPaginated' : ActorMethod<
    [Principal, bigint, bigint],
    {
      'totalCount' : bigint,
      'totalPages' : bigint,
      'transactions' : Array<Transaction>,
    }
  >,
  'getUnreadCount' : ActorMethod<[Principal], bigint>,
  'getUsageHistory' : ActorMethod<[ApiKeyId], Result_4>,
  'getUsagePatterns' : ActorMethod<[ApiKeyId], Result_3>,
  'getUserBitcoinBalance' : ActorMethod<[Principal], bigint>,
  'getUserReputationScore' : ActorMethod<[Principal], bigint>,
  'getUserSeiBalance' : ActorMethod<[Principal], bigint>,
  'getUserVouchers' : ActorMethod<[Principal], Array<Voucher>>,
  'hasSubmittedFeedback' : ActorMethod<
    [[] | [string]],
    HasSubmittedFeedbackResult
  >,
  'hasSubmittedFeedbackByIP' : ActorMethod<
    [string],
    HasSubmittedFeedbackByIPResult
  >,
  'hasSubmittedFeedbackByPrincipal' : ActorMethod<
    [],
    HasSubmittedFeedbackByPrincipalResult
  >,
  'initiateMultipleMilestones' : ActorMethod<
    [Principal, InitiateMultipleMilestonesRequest],
    MilestoneResult
  >,
  'isUserFlaggedForFraud' : ActorMethod<[Principal], boolean>,
  'listApiKeys' : ActorMethod<[Principal], ApiKeyListResult>,
  'listApiKeysForPrincipal' : ActorMethod<[Principal], ApiKeyListResult>,
  'logApiKeyUsage' : ActorMethod<
    [
      ApiKeyId,
      string,
      string,
      [] | [string],
      [] | [string],
      boolean,
      [] | [bigint],
      [] | [string],
    ],
    Result_2
  >,
  'markTransactionsAsRead' : ActorMethod<[], undefined>,
  'processPaymentGatewayTransfer' : ActorMethod<
    [Principal, Principal, bigint, [] | [string], [] | [string], boolean],
    TransferResult
  >,
  'recipientApproveEscrow' : ActorMethod<
    [Principal, string, Principal],
    undefined
  >,
  'recipientDeclineEscrow' : ActorMethod<
    [Principal, bigint, Principal],
    undefined
  >,
  'recipientSignContract' : ActorMethod<
    [string, string, string, Principal, string],
    Result_1
  >,
  'redeemVoucher' : ActorMethod<
    [string, Principal],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'refundSplit' : ActorMethod<[Principal], undefined>,
  'releaseBasicEscrow' : ActorMethod<[Principal, string], [] | [Transaction]>,
  'removeBitcoinAddress' : ActorMethod<[], boolean>,
  'removeSeiAddress' : ActorMethod<[], boolean>,
  'requestCkbtcWallet' : ActorMethod<
    [],
    {
        'ok' : {
          'owner' : Principal,
          'subaccount' : Subaccount,
          'btcAddress' : string,
        }
      } |
      { 'err' : string }
  >,
  'requestSeiWalletAnonymous' : ActorMethod<
    [],
    { 'ok' : { 'owner' : Principal, 'seiAddress' : string } } |
      { 'err' : string }
  >,
  'resetUserReputation' : ActorMethod<[Principal, Principal], undefined>,
  'revokeApiKey' : ActorMethod<[ApiKeyId], VoidResult>,
  'saveInfo' : ActorMethod<[Principal, SaveInfoRequest], undefined>,
  'searchContacts' : ActorMethod<[Principal, string], Array<Contact>>,
  'searchMessages' : ActorMethod<[string, string], Array<ChatMessage>>,
  'sendMessage' : ActorMethod<[string, string, string], ChatMessageResult>,
  'setBitcoinAddress' : ActorMethod<[string], boolean>,
  'setBitcoinBalance' : ActorMethod<[Principal, Principal, bigint], boolean>,
  'setInitialBalance' : ActorMethod<[Principal, bigint, Principal], undefined>,
  'setSeiAddress' : ActorMethod<[string], boolean>,
  'shouldShowFeedback' : ActorMethod<[[] | [bigint]], ShouldShowFeedbackResult>,
  'storeConstellationHash' : ActorMethod<
    [string, string, string, Principal],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'storeStoryRegistration' : ActorMethod<
    [string, string, string, Principal],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'storeStoryTx' : ActorMethod<
    [string, string, string, Principal],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'submitFeedback' : ActorMethod<[SubmitFeedbackRequest], FeedbackResult>,
  'submitProofOfWork' : ActorMethod<
    [string, string, Principal, bigint, string, Array<string>, Array<string>],
    Result_1
  >,
  'updateApiKeyPermissions' : ActorMethod<
    [ApiKeyId, Array<Permission>],
    VoidResult
  >,
  'updateContact' : ActorMethod<
    [string, string],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'updateEscrow' : ActorMethod<[string, Array<ParticipantShare>], undefined>,
  'updateVoucher' : ActorMethod<
    [string, string, bigint],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'uploadFile' : ActorMethod<[string, FileType, string], string>,
  'validateApiKey' : ActorMethod<[string, Permission], Result>,
  'withdrawBtc' : ActorMethod<
    [bigint, string],
    { 'ok' : string } |
      { 'err' : string }
  >,
  'withdrawIcp' : ActorMethod<
    [bigint, string],
    { 'ok' : string } |
      { 'err' : string }
  >,
}
export interface StoredFile {
  'id' : string,
  'base64Data' : string,
  'fileType' : FileType,
  'filename' : string,
  'uploadedAt' : bigint,
  'uploadedBy' : Principal,
}
export type Subaccount = Uint8Array | number[];
export interface SubmitFeedbackRequest {
  'principal' : [] | [Principal],
  'name' : string,
  'email' : string,
  'message' : string,
  'rating' : bigint,
  'userAgent' : [] | [string],
  'ipAddress' : [] | [string],
}
export type Time = bigint;
export interface ToEntry {
  'status' : { 'pending' : null } |
    { 'approved' : null } |
    { 'noaction' : null } |
    { 'declined' : null },
  'principal' : Principal,
  'approvedAt' : [] | [bigint],
  'name' : string,
  'funds_allocated' : bigint,
  'declinedAt' : [] | [bigint],
  'percentage' : bigint,
  'readAt' : [] | [bigint],
}
export interface Transaction {
  'id' : string,
  'status' : TransactionStatus,
  'storyIpAssetId' : [] | [string],
  'title' : string,
  'constellationHashes' : Array<ConstellationHashEntry>,
  'from' : Principal,
  'basicData' : [] | [BasicEscrowData],
  'kind' : TransactionKind,
  'createdAt' : bigint,
  'confirmedAt' : [] | [bigint],
  'refundedAt' : [] | [bigint],
  'funds_allocated' : bigint,
  'cancelledAt' : [] | [bigint],
  'withdrawData' : [] | [WithdrawData],
  'releasedAt' : [] | [bigint],
  'chatId' : [] | [string],
  'storyTxs' : Array<
    { 'action' : string, 'timestamp' : bigint, 'txHash' : string }
  >,
  'milestoneData' : MilestoneEscrowData,
  'readAt' : [] | [bigint],
}
export type TransactionKind = { 'withdraw' : null } |
  { 'basic_escrow' : null } |
  { 'milestone_escrow' : null } |
  { 'payment_gateway' : null };
export type TransactionStatus = string;
export type TransferResult = {
    'ok' : {
      'to' : Principal,
      'from' : Principal,
      'memo' : [] | [string],
      'transferId' : string,
      'timestamp' : bigint,
      'amount' : bigint,
    }
  } |
  { 'err' : string };
export interface UsageAlert {
  'id' : string,
  'alertType' : AlertType,
  'acknowledged' : boolean,
  'message' : string,
  'timestamp' : Time,
  'severity' : ActivitySeverity,
  'keyId' : ApiKeyId,
}
export interface UsagePattern {
  'dailyUsage' : bigint,
  'hourlyUsage' : bigint,
  'suspiciousActivity' : boolean,
  'commonEndpoints' : Array<string>,
  'keyId' : ApiKeyId,
  'lastUsed' : Time,
  'commonIpAddresses' : Array<string>,
}
export interface UserInfo {
  'nickname' : [] | [string],
  'username' : [] | [string],
  'balance' : bigint,
  'email' : [] | [string],
  'picture' : [] | [string],
}
export interface UserWithPrincipal {
  'userInfo' : UserInfo,
  'principal' : Principal,
}
export type VoidResult = { 'ok' : null } |
  { 'err' : ApiKeyError };
export interface Voucher {
  'id' : string,
  'expiredAt' : bigint,
  'code' : string,
  'redeemAt' : bigint,
  'createdAt' : bigint,
  'createdBy' : Principal,
  'description' : string,
  'amount' : bigint,
}
export type WithdrawData = {
    'btc' : { 'recipientAddress' : string, 'amount' : bigint }
  } |
  { 'icp' : { 'recipientAddress' : string, 'amount' : bigint } };
export interface _SERVICE extends SplitDApp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

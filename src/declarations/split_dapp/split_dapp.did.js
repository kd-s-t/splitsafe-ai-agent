export const idlFactory = ({ IDL }) => {
  const TransactionStatus = IDL.Text;
  const ConstellationHashEntry = IDL.Record({
    'action' : IDL.Text,
    'hash' : IDL.Text,
    'timestamp' : IDL.Nat,
  });
  const ToEntry = IDL.Record({
    'status' : IDL.Variant({
      'pending' : IDL.Null,
      'approved' : IDL.Null,
      'noaction' : IDL.Null,
      'declined' : IDL.Null,
    }),
    'principal' : IDL.Principal,
    'approvedAt' : IDL.Opt(IDL.Nat),
    'name' : IDL.Text,
    'funds_allocated' : IDL.Nat,
    'declinedAt' : IDL.Opt(IDL.Nat),
    'percentage' : IDL.Nat,
    'readAt' : IDL.Opt(IDL.Nat),
  });
  const BasicEscrowData = IDL.Record({
    'to' : IDL.Vec(ToEntry),
    'useSeiAcceleration' : IDL.Bool,
  });
  const TransactionKind = IDL.Variant({
    'withdraw' : IDL.Null,
    'basic_escrow' : IDL.Null,
    'milestone_escrow' : IDL.Null,
    'payment_gateway' : IDL.Null,
  });
  const WithdrawData = IDL.Variant({
    'btc' : IDL.Record({ 'recipientAddress' : IDL.Text, 'amount' : IDL.Nat }),
    'icp' : IDL.Record({ 'recipientAddress' : IDL.Text, 'amount' : IDL.Nat }),
  });
  const MilestoneEscrowRecipient = IDL.Record({
    'id' : IDL.Text,
    'signedContractAt' : IDL.Opt(IDL.Nat),
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'signedContractFileId' : IDL.Opt(IDL.Text),
    'clientApprovedSignedContractAt' : IDL.Opt(IDL.Nat),
  });
  const MonthlyProofOfWork = IDL.Record({
    'approvedAt' : IDL.Opt(IDL.Nat),
    'screenshotIds' : IDL.Vec(IDL.Text),
    'submittedAt' : IDL.Opt(IDL.Nat),
    'description' : IDL.Opt(IDL.Text),
    'monthNumber' : IDL.Nat,
    'fileIds' : IDL.Vec(IDL.Text),
  });
  const PhoneNumber = IDL.Record({ 'country' : IDL.Text, 'number' : IDL.Text });
  const MilestoneRecipient = IDL.Record({
    'id' : IDL.Text,
    'principal' : IDL.Principal,
    'billingAddress' : IDL.Opt(IDL.Text),
    'approvedAt' : IDL.Opt(IDL.Nat),
    'name' : IDL.Text,
    'email' : IDL.Opt(IDL.Text),
    'share' : IDL.Nat,
    'monthlyProofOfWork' : IDL.Vec(MonthlyProofOfWork),
    'declinedAt' : IDL.Opt(IDL.Nat),
    'phone' : IDL.Opt(PhoneNumber),
  });
  const MilestoneFrequency = IDL.Variant({ 'day' : IDL.Nat });
  const RecipientPayment = IDL.Record({
    'amount' : IDL.Nat,
    'recipientName' : IDL.Text,
    'recipientId' : IDL.Text,
  });
  const ReleasePayment = IDL.Record({
    'id' : IDL.Nat,
    'total' : IDL.Nat,
    'monthNumber' : IDL.Nat,
    'releasedAt' : IDL.Opt(IDL.Nat),
    'recipientPayments' : IDL.Vec(RecipientPayment),
  });
  const Milestone = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'duration' : IDL.Nat,
    'endDate' : IDL.Nat,
    'coin' : IDL.Text,
    'createdAt' : IDL.Nat,
    'recipients' : IDL.Vec(MilestoneRecipient),
    'frequency' : MilestoneFrequency,
    'allocation' : IDL.Nat,
    'startDate' : IDL.Nat,
    'releasePayments' : IDL.Vec(ReleasePayment),
  });
  const MilestoneEscrowData = IDL.Record({
    'contractSigningDateBefore' : IDL.Opt(IDL.Nat),
    'clientApprovedSignedAt' : IDL.Opt(IDL.Nat),
    'contractFileId' : IDL.Opt(IDL.Text),
    'recipients' : IDL.Vec(MilestoneEscrowRecipient),
    'milestones' : IDL.Vec(Milestone),
  });
  const Transaction = IDL.Record({
    'id' : IDL.Text,
    'status' : TransactionStatus,
    'storyIpAssetId' : IDL.Opt(IDL.Text),
    'title' : IDL.Text,
    'constellationHashes' : IDL.Vec(ConstellationHashEntry),
    'from' : IDL.Principal,
    'basicData' : IDL.Opt(BasicEscrowData),
    'kind' : TransactionKind,
    'createdAt' : IDL.Nat,
    'confirmedAt' : IDL.Opt(IDL.Nat),
    'refundedAt' : IDL.Opt(IDL.Nat),
    'funds_allocated' : IDL.Nat,
    'cancelledAt' : IDL.Opt(IDL.Nat),
    'withdrawData' : IDL.Opt(WithdrawData),
    'releasedAt' : IDL.Opt(IDL.Nat),
    'chatId' : IDL.Opt(IDL.Text),
    'storyTxs' : IDL.Vec(
      IDL.Record({
        'action' : IDL.Text,
        'timestamp' : IDL.Nat,
        'txHash' : IDL.Text,
      })
    ),
    'milestoneData' : MilestoneEscrowData,
    'readAt' : IDL.Opt(IDL.Nat),
  });
  const ApiKeyError = IDL.Variant({
    'invalid_permissions' : IDL.Null,
    'not_found' : IDL.Null,
    'invalid_key_format' : IDL.Null,
    'rate_limit_exceeded' : IDL.Null,
    'key_already_exists' : IDL.Null,
    'suspicious_activity' : IDL.Null,
    'usage_limit_exceeded' : IDL.Null,
    'unauthorized' : IDL.Null,
    'key_expired' : IDL.Null,
  });
  const Result_7 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : ApiKeyError });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Permission = IDL.Variant({
    'admin' : IDL.Null,
    'escrow_delete' : IDL.Null,
    'webhook_manage' : IDL.Null,
    'escrow_create' : IDL.Null,
    'escrow_update' : IDL.Null,
    'milestone_release' : IDL.Null,
    'escrow_read' : IDL.Null,
  });
  const CreateApiKeyRequest = IDL.Record({
    'permissions' : IDL.Vec(Permission),
    'name' : IDL.Text,
  });
  const ApiKeyId = IDL.Text;
  const ApiKeyStatus = IDL.Variant({
    'active' : IDL.Null,
    'revoked' : IDL.Null,
    'expired' : IDL.Null,
  });
  const Time = IDL.Int;
  const ApiKeyResponse = IDL.Record({
    'id' : ApiKeyId,
    'key' : IDL.Text,
    'status' : ApiKeyStatus,
    'permissions' : IDL.Vec(Permission),
    'expiresAt' : IDL.Opt(Time),
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'createdAt' : Time,
    'usageCount' : IDL.Nat,
    'lastUsedFrom' : IDL.Opt(IDL.Text),
    'lastUsed' : IDL.Opt(Time),
    'revokedAt' : IDL.Opt(Time),
  });
  const ApiKeyResult = IDL.Variant({
    'ok' : ApiKeyResponse,
    'err' : ApiKeyError,
  });
  const CreateWithdrawRequest = IDL.Record({ 'withdrawData' : WithdrawData });
  const ParticipantShare = IDL.Record({
    'principal' : IDL.Principal,
    'nickname' : IDL.Text,
    'amount' : IDL.Nat,
    'percentage' : IDL.Nat,
  });
  const CreateBasicEscrowRequest = IDL.Record({
    'title' : IDL.Text,
    'participants' : IDL.Vec(ParticipantShare),
    'useSeiAcceleration' : IDL.Bool,
  });
  const CreatePaymentGatewayRequest = IDL.Record({
    'to' : IDL.Principal,
    'memo' : IDL.Opt(IDL.Text),
    'merchantId' : IDL.Opt(IDL.Text),
    'amount' : IDL.Nat,
    'useSeiAcceleration' : IDL.Bool,
  });
  const CreateTransactionRequest = IDL.Variant({
    'withdraw' : CreateWithdrawRequest,
    'basic_escrow' : CreateBasicEscrowRequest,
    'payment_gateway' : CreatePaymentGatewayRequest,
  });
  const CreateTransactionResult = IDL.Variant({
    'ok' : IDL.Record({
      'title' : IDL.Opt(IDL.Text),
      'recipients' : IDL.Opt(IDL.Vec(ParticipantShare)),
      'recipientCount' : IDL.Opt(IDL.Nat),
      'amount' : IDL.Opt(IDL.Nat),
      'transactionId' : IDL.Text,
    }),
    'err' : IDL.Text,
  });
  const AlertType = IDL.Variant({
    'usage_spike' : IDL.Null,
    'failed_authentication' : IDL.Null,
    'unusual_pattern' : IDL.Null,
    'key_compromise_suspected' : IDL.Null,
    'new_ip_address' : IDL.Null,
  });
  const ActivitySeverity = IDL.Variant({
    'low' : IDL.Null,
    'high' : IDL.Null,
    'critical' : IDL.Null,
    'medium' : IDL.Null,
  });
  const UsageAlert = IDL.Record({
    'id' : IDL.Text,
    'alertType' : AlertType,
    'acknowledged' : IDL.Bool,
    'message' : IDL.Text,
    'timestamp' : Time,
    'severity' : ActivitySeverity,
    'keyId' : ApiKeyId,
  });
  const Result_6 = IDL.Variant({
    'ok' : IDL.Vec(UsageAlert),
    'err' : ApiKeyError,
  });
  const Feedback = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'submittedBy' : IDL.Opt(IDL.Principal),
    'message' : IDL.Text,
    'timestamp' : IDL.Int,
    'rating' : IDL.Nat,
    'userAgent' : IDL.Opt(IDL.Text),
    'ipAddress' : IDL.Opt(IDL.Text),
  });
  const FileType = IDL.Variant({
    'doc' : IDL.Null,
    'jpg' : IDL.Null,
    'pdf' : IDL.Null,
    'png' : IDL.Null,
    'svg' : IDL.Null,
    'txt' : IDL.Null,
    'other' : IDL.Null,
    'docx' : IDL.Null,
    'jpeg' : IDL.Null,
  });
  const StoredFile = IDL.Record({
    'id' : IDL.Text,
    'base64Data' : IDL.Text,
    'fileType' : FileType,
    'filename' : IDL.Text,
    'uploadedAt' : IDL.Nat,
    'uploadedBy' : IDL.Principal,
  });
  const UserInfo = IDL.Record({
    'nickname' : IDL.Opt(IDL.Text),
    'username' : IDL.Opt(IDL.Text),
    'balance' : IDL.Nat,
    'email' : IDL.Opt(IDL.Text),
    'picture' : IDL.Opt(IDL.Text),
  });
  const UserWithPrincipal = IDL.Record({
    'userInfo' : UserInfo,
    'principal' : IDL.Principal,
  });
  const PaymentStatus = IDL.Variant({
    'cancelled' : IDL.Null,
    'pending' : IDL.Null,
    'completed' : IDL.Null,
    'failed' : IDL.Null,
  });
  const BusinessLog = IDL.Record({
    'to' : IDL.Principal,
    'fee' : IDL.Nat,
    'status' : PaymentStatus,
    'completedAt' : IDL.Opt(IDL.Nat),
    'from' : IDL.Principal,
    'memo' : IDL.Opt(IDL.Text),
    'createdAt' : IDL.Nat,
    'merchantId' : IDL.Opt(IDL.Text),
    'amount' : IDL.Nat,
    'transactionId' : IDL.Text,
  });
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Contact = IDL.Record({
    'id' : IDL.Text,
    'nickname' : IDL.Text,
    'ownerId' : IDL.Principal,
    'createdAt' : IDL.Nat,
    'updatedAt' : IDL.Opt(IDL.Nat),
    'principalid' : IDL.Principal,
  });
  const GetFeedbackByPrincipalResult = IDL.Variant({
    'ok' : IDL.Opt(Feedback),
    'err' : IDL.Text,
  });
  const FeedbackStats = IDL.Record({
    'totalCount' : IDL.Nat,
    'averageRating' : IDL.Float64,
  });
  const FraudActivity = IDL.Record({
    'activityType' : IDL.Text,
    'timestamp' : IDL.Int,
    'transactionId' : IDL.Text,
  });
  const Result_5 = IDL.Variant({
    'ok' : IDL.Record({
      'totalKeys' : IDL.Nat,
      'revokedKeys' : IDL.Nat,
      'activeKeys' : IDL.Nat,
    }),
    'err' : ApiKeyError,
  });
  const ChatMessage = IDL.Record({
    'id' : IDL.Text,
    'senderPrincipalId' : IDL.Principal,
    'message' : IDL.Text,
    'senderName' : IDL.Text,
    'chatId' : IDL.Text,
    'senderAt' : IDL.Int,
  });
  const ApiKeyUsage = IDL.Record({
    'id' : IDL.Text,
    'method' : IDL.Text,
    'endpoint' : IDL.Text,
    'errorCode' : IDL.Opt(IDL.Text),
    'timestamp' : Time,
    'success' : IDL.Bool,
    'userAgent' : IDL.Opt(IDL.Text),
    'responseTime' : IDL.Opt(IDL.Nat),
    'keyId' : ApiKeyId,
    'ipAddress' : IDL.Opt(IDL.Text),
  });
  const Result_4 = IDL.Variant({
    'ok' : IDL.Vec(ApiKeyUsage),
    'err' : ApiKeyError,
  });
  const UsagePattern = IDL.Record({
    'dailyUsage' : IDL.Nat,
    'hourlyUsage' : IDL.Nat,
    'suspiciousActivity' : IDL.Bool,
    'commonEndpoints' : IDL.Vec(IDL.Text),
    'keyId' : ApiKeyId,
    'lastUsed' : Time,
    'commonIpAddresses' : IDL.Vec(IDL.Text),
  });
  const Result_3 = IDL.Variant({ 'ok' : UsagePattern, 'err' : ApiKeyError });
  const Voucher = IDL.Record({
    'id' : IDL.Text,
    'expiredAt' : IDL.Int,
    'code' : IDL.Text,
    'redeemAt' : IDL.Int,
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'description' : IDL.Text,
    'amount' : IDL.Nat,
  });
  const HasSubmittedFeedbackResult = IDL.Variant({
    'ok' : IDL.Bool,
    'err' : IDL.Text,
  });
  const HasSubmittedFeedbackByIPResult = IDL.Variant({
    'ok' : IDL.Bool,
    'err' : IDL.Text,
  });
  const HasSubmittedFeedbackByPrincipalResult = IDL.Variant({
    'ok' : IDL.Bool,
    'err' : IDL.Text,
  });
  const MilestoneRecipientRequest = IDL.Record({
    'id' : IDL.Text,
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'share' : IDL.Nat,
  });
  const InitiateMilestoneRequest = IDL.Record({
    'contractSigningPeriod' : IDL.Opt(IDL.Nat),
    'title' : IDL.Text,
    'duration' : IDL.Nat,
    'coin' : IDL.Text,
    'contractFile' : IDL.Opt(IDL.Text),
    'recipients' : IDL.Vec(MilestoneRecipientRequest),
    'frequency' : MilestoneFrequency,
    'allocation' : IDL.Nat,
    'startDate' : IDL.Nat,
  });
  const InitiateMultipleMilestonesRequest = IDL.Record({
    'title' : IDL.Text,
    'contractFile' : IDL.Opt(IDL.Text),
    'milestones' : IDL.Vec(InitiateMilestoneRequest),
  });
  const MilestoneResult = IDL.Variant({
    'ok' : IDL.Record({ 'milestoneId' : IDL.Text, 'transactionId' : IDL.Text }),
    'err' : IDL.Text,
  });
  const ApiKeyListResponse = IDL.Record({
    'total' : IDL.Nat,
    'keys' : IDL.Vec(ApiKeyResponse),
  });
  const ApiKeyListResult = IDL.Variant({
    'ok' : ApiKeyListResponse,
    'err' : ApiKeyError,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : ApiKeyError });
  const TransferResult = IDL.Variant({
    'ok' : IDL.Record({
      'to' : IDL.Principal,
      'from' : IDL.Principal,
      'memo' : IDL.Opt(IDL.Text),
      'transferId' : IDL.Text,
      'timestamp' : IDL.Nat,
      'amount' : IDL.Nat,
    }),
    'err' : IDL.Text,
  });
  const VoidResult = IDL.Variant({ 'ok' : IDL.Null, 'err' : ApiKeyError });
  const SaveInfoRequest = IDL.Record({
    'nickname' : IDL.Opt(IDL.Text),
    'username' : IDL.Opt(IDL.Text),
    'email' : IDL.Opt(IDL.Text),
    'picture' : IDL.Opt(IDL.Text),
  });
  const ChatMessageResult = IDL.Record({
    'messageId' : IDL.Opt(IDL.Text),
    'error' : IDL.Opt(IDL.Text),
    'success' : IDL.Bool,
  });
  const ShouldShowFeedbackResult = IDL.Variant({
    'ok' : IDL.Bool,
    'err' : IDL.Text,
  });
  const SubmitFeedbackRequest = IDL.Record({
    'principal' : IDL.Opt(IDL.Principal),
    'name' : IDL.Text,
    'email' : IDL.Text,
    'message' : IDL.Text,
    'rating' : IDL.Nat,
    'userAgent' : IDL.Opt(IDL.Text),
    'ipAddress' : IDL.Opt(IDL.Text),
  });
  const FeedbackResult = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Principal, 'err' : ApiKeyError });
  const SplitDApp = IDL.Service({
    'addBitcoinBalance' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'addContact' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Text],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'adminSetBitcoinAddress' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Bool],
        [],
      ),
    'canUserCreateEscrow' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'cancelTransaction' : IDL.Func([IDL.Principal], [IDL.Opt(Transaction)], []),
    'cancelVoucher' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'cleanupExpiredKeys' : IDL.Func([], [Result_7], []),
    'clearAllFeedbacks' : IDL.Func(
        [],
        [IDL.Record({ 'message' : IDL.Text, 'success' : IDL.Bool })],
        [],
      ),
    'clearUserProfile' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Bool],
        [],
      ),
    'clientApprovedSignedContract' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Principal],
        [Result_1],
        [],
      ),
    'clientReleaseMilestonePayment' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Principal],
        [Result_1],
        [],
      ),
    'convertCkBtcToIcp' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'convertIcpToBitcoin' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'convertIcpToSei' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'createApiKey' : IDL.Func(
        [IDL.Principal, CreateApiKeyRequest],
        [ApiKeyResult],
        [],
      ),
    'createTransaction' : IDL.Func(
        [IDL.Principal, TransactionKind, CreateTransactionRequest],
        [CreateTransactionResult],
        [],
      ),
    'createVoucher' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Nat, IDL.Text, IDL.Int],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'deleteContact' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'deleteEscrowMessages' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'deleteFeedback' : IDL.Func(
        [IDL.Text],
        [IDL.Record({ 'message' : IDL.Text, 'success' : IDL.Bool })],
        [],
      ),
    'deleteFile' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'generateBitcoinAddress' : IDL.Func([], [IDL.Opt(IDL.Text)], []),
    'generateBitcoinAddressForUser' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Text)],
        [],
      ),
    'getAdmin' : IDL.Func([], [IDL.Principal], ['query']),
    'getAlerts' : IDL.Func([], [Result_6], ['query']),
    'getAllFeedbacks' : IDL.Func([], [IDL.Vec(Feedback)], ['query']),
    'getAllFeedbacksAnonymous' : IDL.Func([], [IDL.Vec(Feedback)], ['query']),
    'getAllFiles' : IDL.Func([], [IDL.Vec(StoredFile)], ['query']),
    'getAllUsers' : IDL.Func([], [IDL.Vec(UserWithPrincipal)], ['query']),
    'getApiKey' : IDL.Func([ApiKeyId], [ApiKeyResult], []),
    'getApiKeyByKey' : IDL.Func([IDL.Text], [ApiKeyResult], ['query']),
    'getBitcoinAddress' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Text)],
        ['query'],
      ),
    'getBusinessLogs' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(BusinessLog)],
        ['query'],
      ),
    'getCkbtcAddressAnonymous' : IDL.Func(
        [],
        [
          IDL.Variant({
            'ok' : IDL.Record({
              'owner' : IDL.Principal,
              'subaccount' : Subaccount,
              'btcAddress' : IDL.Text,
            }),
            'err' : IDL.Text,
          }),
        ],
        [],
      ),
    'getCkbtcBalance' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text })],
        [],
      ),
    'getCkbtcBalanceAnonymous' : IDL.Func(
        [],
        [IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text })],
        [],
      ),
    'getContacts' : IDL.Func([IDL.Principal], [IDL.Vec(Contact)], ['query']),
    'getEscrowsWithMessages' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getFeedbackByPrincipal' : IDL.Func(
        [],
        [GetFeedbackByPrincipalResult],
        ['query'],
      ),
    'getFeedbackCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getFeedbackStats' : IDL.Func([], [FeedbackStats], ['query']),
    'getFile' : IDL.Func([IDL.Text], [IDL.Opt(StoredFile)], ['query']),
    'getFileBase64' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getFileCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getFileInfo' : IDL.Func(
        [IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'id' : IDL.Text,
              'fileType' : FileType,
              'filename' : IDL.Text,
              'uploadedAt' : IDL.Nat,
              'uploadedBy' : IDL.Principal,
            })
          ),
        ],
        ['query'],
      ),
    'getFilesByUser' : IDL.Func([], [IDL.Vec(StoredFile)], ['query']),
    'getFraudHistory' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(FraudActivity)],
        ['query'],
      ),
    'getInfo' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Opt(UserInfo)],
        ['query'],
      ),
    'getKeyStats' : IDL.Func([], [Result_5], []),
    'getLatestMessage' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(ChatMessage)],
        ['query'],
      ),
    'getMessageCount' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getMessages' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Nat)],
        [IDL.Vec(ChatMessage)],
        ['query'],
      ),
    'getMyFeedbacks' : IDL.Func([], [IDL.Vec(Feedback)], ['query']),
    'getOrCreateChat' : IDL.Func(
        [IDL.Text],
        [
          IDL.Record({
            'error' : IDL.Opt(IDL.Text),
            'chatId' : IDL.Opt(IDL.Text),
            'success' : IDL.Bool,
          }),
        ],
        [],
      ),
    'getOrRequestCkbtcWallet' : IDL.Func(
        [],
        [
          IDL.Variant({
            'ok' : IDL.Record({
              'owner' : IDL.Principal,
              'subaccount' : Subaccount,
              'btcAddress' : IDL.Text,
            }),
            'err' : IDL.Text,
          }),
        ],
        [],
      ),
    'getOrRequestSeiWallet' : IDL.Func(
        [],
        [
          IDL.Variant({
            'ok' : IDL.Record({
              'owner' : IDL.Principal,
              'seiAddress' : IDL.Text,
            }),
            'err' : IDL.Text,
          }),
        ],
        [],
      ),
    'getOrRequestSeiWalletForUser' : IDL.Func(
        [IDL.Principal],
        [
          IDL.Variant({
            'ok' : IDL.Record({
              'owner' : IDL.Principal,
              'seiAddress' : IDL.Text,
            }),
            'err' : IDL.Text,
          }),
        ],
        [],
      ),
    'getReputationStats' : IDL.Func(
        [IDL.Principal],
        [
          IDL.Record({
            'fraudCount' : IDL.Nat,
            'canCreateEscrow' : IDL.Bool,
            'reputation' : IDL.Nat,
            'isFlagged' : IDL.Bool,
          }),
        ],
        ['query'],
      ),
    'getSeiAddress' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Text)], ['query']),
    'getSeiBalance' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text })],
        [],
      ),
    'getSeiBalanceAnonymous' : IDL.Func(
        [],
        [IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text })],
        [],
      ),
    'getSeiFaucetUrl' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'getSeiNetworkInfo' : IDL.Func(
        [],
        [
          IDL.Record({
            'name' : IDL.Text,
            'rpcUrl' : IDL.Text,
            'explorerUrl' : IDL.Text,
            'prefix' : IDL.Text,
            'isTestnet' : IDL.Bool,
            'chainId' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'getTransaction' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Opt(Transaction)],
        [],
      ),
    'getTransactionsPaginated' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [
          IDL.Record({
            'totalCount' : IDL.Nat,
            'totalPages' : IDL.Nat,
            'transactions' : IDL.Vec(Transaction),
          }),
        ],
        [],
      ),
    'getUnreadCount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUsageHistory' : IDL.Func([ApiKeyId], [Result_4], ['query']),
    'getUsagePatterns' : IDL.Func([ApiKeyId], [Result_3], ['query']),
    'getUserBitcoinBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUserReputationScore' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUserSeiBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUserVouchers' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Voucher)],
        ['query'],
      ),
    'hasSubmittedFeedback' : IDL.Func(
        [IDL.Opt(IDL.Text)],
        [HasSubmittedFeedbackResult],
        ['query'],
      ),
    'hasSubmittedFeedbackByIP' : IDL.Func(
        [IDL.Text],
        [HasSubmittedFeedbackByIPResult],
        ['query'],
      ),
    'hasSubmittedFeedbackByPrincipal' : IDL.Func(
        [],
        [HasSubmittedFeedbackByPrincipalResult],
        ['query'],
      ),
    'initiateMultipleMilestones' : IDL.Func(
        [IDL.Principal, InitiateMultipleMilestonesRequest],
        [MilestoneResult],
        [],
      ),
    'isUserFlaggedForFraud' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'listApiKeys' : IDL.Func([IDL.Principal], [ApiKeyListResult], ['query']),
    'listApiKeysForPrincipal' : IDL.Func(
        [IDL.Principal],
        [ApiKeyListResult],
        [],
      ),
    'logApiKeyUsage' : IDL.Func(
        [
          ApiKeyId,
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Bool,
          IDL.Opt(IDL.Nat),
          IDL.Opt(IDL.Text),
        ],
        [Result_2],
        [],
      ),
    'markTransactionsAsRead' : IDL.Func([], [], []),
    'processPaymentGatewayTransfer' : IDL.Func(
        [
          IDL.Principal,
          IDL.Principal,
          IDL.Nat,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Bool,
        ],
        [TransferResult],
        [],
      ),
    'recipientApproveEscrow' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Principal],
        [],
        [],
      ),
    'recipientDeclineEscrow' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'recipientSignContract' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Principal, IDL.Text],
        [Result_1],
        [],
      ),
    'redeemVoucher' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'refundSplit' : IDL.Func([IDL.Principal], [], []),
    'releaseBasicEscrow' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Opt(Transaction)],
        [],
      ),
    'removeBitcoinAddress' : IDL.Func([], [IDL.Bool], []),
    'removeSeiAddress' : IDL.Func([], [IDL.Bool], []),
    'requestCkbtcWallet' : IDL.Func(
        [],
        [
          IDL.Variant({
            'ok' : IDL.Record({
              'owner' : IDL.Principal,
              'subaccount' : Subaccount,
              'btcAddress' : IDL.Text,
            }),
            'err' : IDL.Text,
          }),
        ],
        [],
      ),
    'requestSeiWalletAnonymous' : IDL.Func(
        [],
        [
          IDL.Variant({
            'ok' : IDL.Record({
              'owner' : IDL.Principal,
              'seiAddress' : IDL.Text,
            }),
            'err' : IDL.Text,
          }),
        ],
        [],
      ),
    'resetUserReputation' : IDL.Func([IDL.Principal, IDL.Principal], [], []),
    'revokeApiKey' : IDL.Func([ApiKeyId], [VoidResult], []),
    'saveInfo' : IDL.Func([IDL.Principal, SaveInfoRequest], [], []),
    'searchContacts' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Vec(Contact)],
        ['query'],
      ),
    'searchMessages' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(ChatMessage)],
        ['query'],
      ),
    'sendMessage' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [ChatMessageResult],
        [],
      ),
    'setBitcoinAddress' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'setBitcoinBalance' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'setInitialBalance' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'setSeiAddress' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'shouldShowFeedback' : IDL.Func(
        [IDL.Opt(IDL.Nat)],
        [ShouldShowFeedbackResult],
        ['query'],
      ),
    'storeConstellationHash' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Principal],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'storeStoryRegistration' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Principal],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'storeStoryTx' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Principal],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'submitFeedback' : IDL.Func([SubmitFeedbackRequest], [FeedbackResult], []),
    'submitProofOfWork' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Principal,
          IDL.Nat,
          IDL.Text,
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Text),
        ],
        [Result_1],
        [],
      ),
    'updateApiKeyPermissions' : IDL.Func(
        [ApiKeyId, IDL.Vec(Permission)],
        [VoidResult],
        [],
      ),
    'updateContact' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'updateEscrow' : IDL.Func([IDL.Text, IDL.Vec(ParticipantShare)], [], []),
    'updateVoucher' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Int],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'uploadFile' : IDL.Func([IDL.Text, FileType, IDL.Text], [IDL.Text], []),
    'validateApiKey' : IDL.Func([IDL.Text, Permission], [Result], []),
    'withdrawBtc' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
    'withdrawIcp' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text })],
        [],
      ),
  });
  return SplitDApp;
};
export const init = ({ IDL }) => {
  return [IDL.Principal, IDL.Text, IDL.Text];
};

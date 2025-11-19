import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Result "mo:base/Result";

import Debug "mo:base/Debug";

// Direct imports from module schemas
import TransactionTypes "modules/transaction/schema";
import MilestoneTypes "modules/escrow_milestone/schema";
import ChatTypes "modules/chat/schema";
import ContactTypes "modules/contacts/schema";
import FeedbackTypes "modules/feedback/schema";
import ApiKeyTypes "modules/api_keys/schema";
import VoucherTypes "modules/vouchers/schema";

import _Balance "utils/balance";
import BalanceManager "modules/users/balance_manager";
import Reputation "modules/users/reputation";
import Transactions "modules/transaction/transactions";
import TransactionManager "modules/transaction/transaction_manager";
import Constellation "modules/constellation/constellation";
import StoryMod "modules/story/story";
import BasicEscrow "modules/escrow_basic/basic_escrow";
import Users "modules/users/users";
import Admin "utils/admin";
import CKBTC "modules/users/ckbtc";
import SEI "modules/users/sei";
import Contacts "modules/contacts/contacts";
import Chat "modules/chat/chat";
import Milestone "modules/escrow_milestone/milestone";
import Withdrawals "modules/withdraw/withdrawals";
import Conversions "modules/users/conversions";
import Notifications "modules/users/notifications";
import _WalletManager "modules/users/wallet_manager";
import ContactManager "modules/contacts/contact_manager";
import FileStorage "modules/storage/storage";
import ChatManager "modules/chat/chat_manager";
import IntegrationManager "modules/users/integration_manager";
import ReputationManager "modules/users/reputation_manager";
import FeedbackManager "modules/feedback/feedback";
import VoucherManager "modules/vouchers/voucher_manager";
import Vouchers "modules/vouchers/voucher";
import _ApiKeys "modules/api_keys/api_keys";
import ApiKeyManager "modules/api_keys/api_keys_manager";
import PaymentGateway "modules/paymentgateway/paymentgateway";
import PaymentGatewayTypes "modules/paymentgateway/schema";
import BitcoinIntegration "modules/bitcoin/bitcoin_integration";

persistent actor class SplitDApp(admin : Principal, _ckbtcLedgerId : Text, _ckbtcMinterId : Text) {

  transient var logs : [Text] = [];
  transient var balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  transient var transactions = HashMap.HashMap<Principal, [TransactionTypes.Transaction]>(10, Principal.equal, Principal.hash);
  transient let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  transient let usernames = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  transient let pictures = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  transient let emails = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);

  transient var bitcoinBalances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);

  transient let seiBalances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);

  transient let reputation = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  transient let fraudHistory = HashMap.HashMap<Principal, [Reputation.FraudActivity]>(10, Principal.equal, Principal.hash);

  transient let userBitcoinAddresses = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);

  transient let userSeiAddresses = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);

  transient var chatState = Chat.createChatState();

  transient var userContacts = HashMap.HashMap<Principal, HashMap.HashMap<Text, ContactTypes.Contact>>(10, Principal.equal, Principal.hash);

  transient let ckbtcIntegration = CKBTC.CKBTCIntegration(_ckbtcLedgerId, _ckbtcMinterId, admin);

  transient let seiNetworkConfig : SEI.SeiNetwork = {
    name = "Atlantic-2 Testnet";
    chainId = "atlantic-2";
    rpcUrl = "https://rpc.atlantic-2.seinetwork.io";
    explorerUrl = "https://atlantic-2.sei.explorers.guru";
    prefix = "sei";
    isTestnet = true;
  };
  transient let seiIntegration = SEI.SEIIntegration("2vxsx-fae", seiNetworkConfig);

  transient let milestoneManager = Milestone.MilestoneManager();

  transient let fileStorage = FileStorage.FileStorage();

  transient let feedbackManager = FeedbackManager.FeedbackManager();


  transient var userVouchers = HashMap.HashMap<Principal, HashMap.HashMap<Text, VoucherTypes.Voucher>>(10, Principal.equal, Principal.hash);
  transient let bitcoinIntegration = BitcoinIntegration.BitcoinIntegration();

  transient var apiKeyManagerState : ApiKeyTypes.ApiKeyManagerState = {
    apiKeys = HashMap.HashMap<ApiKeyTypes.ApiKeyId, ApiKeyTypes.ApiKey>(0, Text.equal, Text.hash);
    keyToId = HashMap.HashMap<Text, ApiKeyTypes.ApiKeyId>(0, Text.equal, Text.hash);
    userKeys = HashMap.HashMap<Principal, [ApiKeyTypes.ApiKeyId]>(0, Principal.equal, Principal.hash);
    nextKeyId = 1;
    logs = [];
    // Usage monitoring
    usageHistory = HashMap.HashMap<Text, [ApiKeyTypes.ApiKeyUsage]>(0, Text.equal, Text.hash);
    usagePatterns = HashMap.HashMap<ApiKeyTypes.ApiKeyId, ApiKeyTypes.UsagePattern>(0, Text.equal, Text.hash);
    suspiciousActivities = HashMap.HashMap<Text, ApiKeyTypes.SuspiciousActivity>(0, Text.equal, Text.hash);
    alerts = HashMap.HashMap<Text, ApiKeyTypes.UsageAlert>(0, Text.equal, Text.hash);
    nextUsageId = 1;
    nextAlertId = 1;
  };

  // Payment Gateway State
  transient var paymentGatewayState = {
    transactions = HashMap.HashMap<Text, PaymentGatewayTypes.PaymentGatewayTransaction>(0, Text.equal, Text.hash);
    userTransactions = HashMap.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);
    totalVolume = 0;
    totalFees = 0;
  };

  private func _initializeIntegrations() {
    seiIntegration.clearBalanceCache();
  };

  private func _createBitcoinState() : BitcoinIntegration.BitcoinIntegrationState {
    bitcoinIntegration.createState();
  };

  private func _createBalanceState() : BalanceManager.BalanceManagerState {
    {
      balances = balances;
      bitcoinBalances = bitcoinBalances;
      seiBalances = seiBalances;
      userBitcoinAddresses = userBitcoinAddresses;
      userSeiAddresses = userSeiAddresses;
    };
  };

  private func _createReputationState() : ReputationManager.ReputationManagerState {
    {
      reputation = reputation;
      fraudHistory = fraudHistory;
    };
  };

  private func _createIntegrationState() : IntegrationManager.IntegrationManagerState {
    {
      userBitcoinAddresses = userBitcoinAddresses;
      userSeiAddresses = userSeiAddresses;
      seiBalances = seiBalances;
    };
  };

  private func _createConversionState() : Conversions.ConversionState {
    {
      balances = balances;
      bitcoinBalances = bitcoinBalances;
      seiBalances = seiBalances;
      logs = logs;
    };
  };

  private func _createWithdrawalState() : Withdrawals.WithdrawalState {
    {
      balances = balances;
      bitcoinBalances = bitcoinBalances;
      transactions = transactions;
      userBitcoinAddresses = userBitcoinAddresses;
      logs = logs;
    };
  };

  private func _createContactState() : ContactManager.ContactManagerState {
    {
      userContacts = userContacts;
    };
  };

  private func _createNotificationState() : Notifications.NotificationState {
    {
      transactions = transactions;
    };
  };

  private func _createChatManagerState() : ChatManager.ChatManagerState {
    {
      transactions = transactions;
      chatState = chatState;
    };
  };

  private func _createTransactionManagerState() : TransactionManager.TransactionManagerState {
    {
      transactions = transactions;
      logs = logs;
      bitcoinBalances = bitcoinBalances;
    };
  };

  private func _createVoucherState() : VoucherManager.VoucherManagerState {
    {
      userVouchers = userVouchers;
      bitcoinBalances = bitcoinBalances;
    };
  };

  // NEW UNIFIED TRANSACTION CREATION FUNCTION
  public shared (_msg) func createTransaction(
    caller : Principal,
    kind : TransactionTypes.TransactionKind,
    request : TransactionTypes.CreateTransactionRequest,
  ) : async TransactionTypes.CreateTransactionResult {
    let (result, updatedState) = TransactionManager.createTransaction(caller, kind, request, _createTransactionManagerState());
    logs := updatedState.logs;
    transactions := updatedState.transactions; // 🔧 FIX: Update the transactions HashMap!
    result;
  };

  // PAYMENT GATEWAY DIRECT TRANSFER FUNCTION
  public shared (msg) func processPaymentGatewayTransfer(
    from : Principal,
    to : Principal,
    amount : Nat,
    memo : ?Text,
    merchantId : ?Text,
    useSeiAcceleration : Bool,
  ) : async PaymentGatewayTypes.TransferResult {
    let _caller = msg.caller;

    let request : PaymentGatewayTypes.TransferRequest = {
      to = to;
      amount = amount;
      memo = memo;
      merchantId = merchantId;
      useSeiAcceleration = useSeiAcceleration;
    };

    // Pass the actual bitcoinIntegration instance, SEI integration instance, and balance state
    let (result, updatedState) = PaymentGateway.processTransfer(from, request, paymentGatewayState, bitcoinIntegration, seiIntegration, _createBalanceState());
    
    // Update the main canister's balance state with any changes from the payment gateway
    // The balance changes are made directly to the HashMaps, so they should be reflected automatically

    // Update the payment gateway state
    paymentGatewayState := updatedState;
    // Note: bitcoinBalances is modified in-place by PaymentGateway.processTransfer

    // Add to logs and create transaction record
    switch (result) {
      case (#ok(transferResult)) {
        logs := Array.append(
          logs,
          [
            "Payment Gateway Transfer: " # transferResult.transferId,
            "From: " # Principal.toText(transferResult.from),
            "To: " # Principal.toText(transferResult.to),
            "Amount: " # Nat.toText(transferResult.amount) # " e8s",
          ],
        );
        
        // Create transaction record for the payment gateway transfer
        let transactionRequest : TransactionTypes.CreateTransactionRequest = #payment_gateway {
          to = transferResult.to;
          amount = transferResult.amount;
          memo = transferResult.memo;
          merchantId = request.merchantId;
          useSeiAcceleration = request.useSeiAcceleration;
        };
        
        let (_txResult, txState) = TransactionManager.createTransaction(
          transferResult.from, 
          #payment_gateway, 
          transactionRequest, 
          _createTransactionManagerState()
        );
        
        // Update transactions and logs from transaction creation
        transactions := txState.transactions;
        logs := txState.logs;
        
        // Update the main transaction record to reflect completion
        let updatedTxs = switch (transactions.get(transferResult.from)) {
          case (?txs) {
            Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
              txs,
              func(tx) {
                if (tx.id == transferResult.transferId) {
                  {
                    tx with
                    status = "released";
                    confirmedAt = ?Int.abs(Time.now());
                    releasedAt = ?Int.abs(Time.now());
                  }
                } else {
                  tx
                }
              }
            )
          };
          case null [];
        };
        transactions.put(transferResult.from, updatedTxs);
        
        // Also store the transaction under the recipient's principal so they can see it
        let recipientTxs = switch (transactions.get(transferResult.to)) {
          case (?txs) txs;
          case null [];
        };
        
        // Find the transaction to update for recipient
        let updatedRecipientTxs = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
          recipientTxs,
          func(tx) {
            if (tx.id == transferResult.transferId) {
              {
                tx with
                status = "released";
                confirmedAt = ?Int.abs(Time.now());
                releasedAt = ?Int.abs(Time.now());
              }
            } else {
              tx
            }
          }
        );
        
        // Check if transaction already exists for recipient
        var recipientHasTransaction = false;
        for (tx in recipientTxs.vals()) {
          if (tx.id == transferResult.transferId) {
            recipientHasTransaction := true;
          };
        };
        
        let finalRecipientTxs = if (recipientHasTransaction) {
          updatedRecipientTxs
        } else {
          // Add the transaction to recipient's list
          let completedTransaction = {
            id = transferResult.transferId;
            kind = #payment_gateway;
            from = transferResult.from;
            funds_allocated = transferResult.amount;
            readAt = null;
            status = "released";
            title = switch (transferResult.memo) {
              case (?memo) memo;
              case null "Payment Gateway Transaction";
            };
            createdAt = transferResult.timestamp;
            confirmedAt = ?Int.abs(Time.now());
            cancelledAt = null;
            refundedAt = null;
            releasedAt = ?Int.abs(Time.now());
            chatId = null;
            constellationHashes = [];
            // Initialize Story Protocol tracking fields
            storyIpAssetId = null;
            storyTxs = [];
            milestoneData = {
              milestones = [];
              contractSigningDateBefore = null;
              contractFileId = null;
              clientApprovedSignedAt = null;
              recipients = [];
            };
            basicData = null;
            withdrawData = null;
          };
          Array.append(recipientTxs, [completedTransaction])
        };
        
        transactions.put(transferResult.to, finalRecipientTxs);
      };
      case (#err(error)) {
        logs := Array.append(logs, ["Payment Gateway Transfer Failed: " # error]);
      };
    };

    result;
  };

  public shared func recipientApproveEscrow(
    sender : Principal,
    txId : Text,
    recipient : Principal,
  ) : async () {
    let (success, updatedTransactions, newLogs) = BasicEscrow.approveBasicEscrow(sender, txId, recipient, transactions, logs);
    logs := newLogs;
    if (success) {
      transactions := updatedTransactions;
    };
  };

  public shared func recipientDeclineEscrow(
    sender : Principal,
    idx : Nat,
    recipient : Principal,
  ) : async () {
    // Simple decline implementation
    let txs = switch (transactions.get(sender)) {
      case (?list) list;
      case null return;
    };

    if (idx >= txs.size()) return;

    let tx = txs[idx];
    if (tx.status != "pending") return;

    let recipients = switch (tx.basicData) {
      case (?basicData) basicData.to;
      case null [];
    };
    let _newTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
      recipients,
      func(entry) {
        if (entry.principal == recipient) {
          {
            principal = entry.principal;
            name = entry.name;
            funds_allocated = entry.funds_allocated;
            percentage = entry.percentage;
            status = #declined;
            approvedAt = entry.approvedAt;
            declinedAt = ?Int.abs(Time.now());
            readAt = entry.readAt;
          };
        } else {
          entry;
        };
      },
    );

    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            id = tx.id;
            kind = tx.kind;
            from = tx.from;
            funds_allocated = tx.funds_allocated;
            readAt = tx.readAt;
            status = "declined";
            title = tx.title;
            createdAt = tx.createdAt;
            confirmedAt = tx.confirmedAt;
            cancelledAt = tx.cancelledAt;
            refundedAt = tx.refundedAt;
            releasedAt = tx.releasedAt;
            chatId = tx.chatId;
            constellationHashes = tx.constellationHashes;
            // Preserve Story Protocol tracking fields
            storyIpAssetId = tx.storyIpAssetId;
            storyTxs = tx.storyTxs;
            milestoneData = tx.milestoneData;
            basicData = tx.basicData;
            withdrawData = tx.withdrawData;
          };
        } else {
          txs[i];
        };
      },
    );

    transactions.put(sender, updated);
    logs := Array.append(logs, ["Recipient " # Principal.toText(recipient) # " declined escrow " # tx.id]);
  };

  public func cancelTransaction(caller : Principal) : async ?TransactionTypes.Transaction {
    let state = _createTransactionManagerState();
    let (success, cancelledTx, updatedState) = TransactionManager.cancelTransaction(caller, state);

    if (success) {
      transactions := updatedState.transactions;
      bitcoinBalances := updatedState.bitcoinBalances;
      logs := updatedState.logs;
      return cancelledTx;
    };

    return null;
  };

  public func refundSplit(caller : Principal) : async () {
    let (success, updatedTransactions, updatedBitcoinBalances, newLogs) = BasicEscrow.refundBasicEscrow(caller, transactions, balances, bitcoinBalances, logs);
    logs := newLogs;
    if (success) {
      transactions := updatedTransactions;
      bitcoinBalances := updatedBitcoinBalances;
    };
  };

  public func releaseBasicEscrow(
    caller : Principal,
    txId : Text,
  ) : async ?TransactionTypes.Transaction {
    let (success, resultTx, updatedTransactions, updatedBitcoinBalances, newLogs) = BasicEscrow.releaseBasicEscrow(caller, txId, transactions, balances, bitcoinBalances, logs);
    logs := newLogs;

    // 🔧 FIX: Update the transactions and bitcoinBalances HashMaps if the release was successful
    if (success) {
      transactions := updatedTransactions;
      bitcoinBalances := updatedBitcoinBalances;
      Debug.print("✅ Transaction released successfully, state updated");
    } else {
      Debug.print("❌ Transaction release failed");
    };

    return resultTx;
  };

  public shared func updateEscrow(
    _txId : Text,
    _updatedParticipants : [TransactionTypes.ParticipantShare],
  ) : async () {
    let result = {
      success = false;
      error = ?"Update not yet implemented in new transaction system";
      newLogs = logs;
    };
    if (not result.success) {};
  };

  // getBalance function removed - balance is now included in getInfo() response

  private func _getBitcoinBalance(account : CKBTC.Account) : async {
    #ok : Nat;
    #err : Text;
  } {
    let result = await ckbtcIntegration.getBitcoinBalance(account);
    return result;
  };

  private func _transferBitcoin(
    fromAccount : CKBTC.Account,
    toAccount : CKBTC.Account,
    amount : Nat,
    memo : Nat64,
  ) : async { #ok : Nat; #err : Text } {
    let result = await ckbtcIntegration.transferBitcoin(fromAccount, toAccount, amount, memo);
    return result;
  };

  private func _createBitcoinEscrow(escrowId : Text) : async CKBTC.Account {
    return ckbtcIntegration.createBitcoinEscrowAccount(escrowId);
  };

  public func getTransactionsPaginated(
    p : Principal,
    page : Nat,
    pageSize : Nat,
  ) : async {
    transactions : [TransactionTypes.Transaction];
    totalCount : Nat;
    totalPages : Nat;
  } {
    Transactions.getTransactionsPaginated(transactions, balances, p, page, pageSize);
  };

  public shared func getTransaction(caller : Principal, id : Text) : async ?TransactionTypes.Transaction {
    return Transactions.getTransaction(transactions, id, caller);
  };

  public shared func storeConstellationHash(escrowId : Text, action : Text, hash : Text, _caller : Principal) : async {
    #ok : Text;
    #err : Text;
  } {
    let result = Constellation.storeConstellationHash(escrowId, action, hash, transactions);
    switch (result) {
      case (#ok({ owner; updated })) {
        transactions.put(owner, updated);
        #ok("Constellation hash stored for transaction: " # escrowId);
      };
      case (#err(e)) {
        #err(e);
      };
    }
  };

  // Story: store initial registration (ipAssetId + tx)
  public shared func storeStoryRegistration(escrowId : Text, ipAssetId : Text, txHash : Text, _caller : Principal) : async {
    #ok : Text;
    #err : Text;
  } {
    let result = StoryMod.storeStoryRegistration(escrowId, ipAssetId, txHash, transactions);
    switch (result) {
      case (#ok({ owner; updated })) {
        transactions.put(owner, updated);
        #ok("Story registration stored for transaction: " # escrowId);
      };
      case (#err(e)) { #err(e) };
    }
  };

  // Story: append an attest/step tx
  public shared func storeStoryTx(escrowId : Text, action : Text, txHash : Text, _caller : Principal) : async {
    #ok : Text;
    #err : Text;
  } {
    let result = StoryMod.storeStoryTx(escrowId, action, txHash, transactions);
    switch (result) {
      case (#ok({ owner; updated })) {
        transactions.put(owner, updated);
        #ok("Story tx stored for transaction: " # escrowId # " (" # action # ")");
      };
      case (#err(e)) { #err(e) };
    }
  };

  public shared func setInitialBalance(p : Principal, amount : Nat, caller : Principal) : async () {
    let (_, _) = BalanceManager.setInitialBalance(caller, p, amount, admin, _createBalanceState());
  };

  public shared ({ caller }) func markTransactionsAsRead() : async () {
    Transactions.markTransactionsAsRead(transactions, caller);
  };

  public shared func initiateMultipleMilestones(caller : Principal, request : MilestoneTypes.InitiateMultipleMilestonesRequest) : async MilestoneTypes.MilestoneResult {
    return milestoneManager.initiateMultipleMilestones(caller, request, transactions, emails, bitcoinBalances, fileStorage);
  };

  public shared func recipientSignContract(transactionId : Text, milestoneId : Text, recipientId : Text, caller : Principal, signedContractFile : Text) : async Result.Result<(), Text> {
    return milestoneManager.recipientSignContract(transactions, transactionId, milestoneId, recipientId, caller, signedContractFile, fileStorage);
  };

  public shared func submitProofOfWork(milestoneId : Text, recipientId : Text, caller : Principal, monthNumber : Nat, description : Text, screenshots : [Text], files : [Text]) : async Result.Result<(), Text> {
    return milestoneManager.submitProofOfWork(transactions, milestoneId, recipientId, caller, monthNumber, description, screenshots, files, fileStorage);
  };

  public shared func clientApprovedSignedContract(transactionId : Text, milestoneId : Text, recipientId : Text, caller : Principal) : async Result.Result<(), Text> {
    return milestoneManager.clientApprovedSignedContract(transactions, transactionId, milestoneId, recipientId, caller);
  };

  public shared func clientReleaseMilestonePayment(transactionId : Text, monthNumber : Nat, caller : Principal) : async Result.Result<(), Text> {
    let result = milestoneManager.clientReleaseMilestonePayment(transactions, transactionId, monthNumber, caller, bitcoinBalances);

    // 🔧 FIX: Update the global transactions state with the returned HashMap
    switch (result) {
      case (#ok(updatedTransactions)) {
        transactions := updatedTransactions;
        Debug.print("✅ [MAIN] Milestone payment release completed, global state updated");
        return #ok(());
      };
      case (#err(error)) {
        Debug.print("❌ [MAIN] Milestone payment release failed: " # error);
        return #err(error);
      };
    };
  };

  public shared query func getInfo(principal : Principal, caller : Principal) : async ?Users.UserInfo {
    return Users.getInfo(names, usernames, pictures, emails, balances, principal, caller);
  };

  public shared func saveInfo(principal : Principal, request : Users.SaveInfoRequest) : async () {

    Users.saveInfo(names, usernames, pictures, emails, principal, request);
  };

  // Function to clear user profile data (for testing/reset purposes)
  public shared func clearUserProfile(principal : Principal, caller : Principal) : async Bool {
    if (caller != admin) {
      return false;
    };

    // Clear all profile data for the user
    names.delete(principal);
    usernames.delete(principal);
    pictures.delete(principal);
    emails.delete(principal);

    Debug.print("Cleared profile data for user: " # Principal.toText(principal));
    true;
  };

  public query func getAllUsers() : async [Users.UserWithPrincipal] {
    Users.getAllUsers(names, usernames, pictures, emails, balances);
  };

  public query func getAdmin() : async Principal {
    return admin;
  };

  public query func getUserReputationScore(user : Principal) : async Nat {
    ReputationManager.getUserReputationScore(user, _createReputationState());
  };

  public query func isUserFlaggedForFraud(user : Principal) : async Bool {
    ReputationManager.isUserFlaggedForFraud(user, _createReputationState());
  };

  public query func canUserCreateEscrow(user : Principal) : async Bool {
    ReputationManager.canUserCreateEscrow(user, _createReputationState());
  };

  public query func getFraudHistory(user : Principal) : async [Reputation.FraudActivity] {
    ReputationManager.getFraudHistory(user, _createReputationState());
  };

  public shared (msg) func requestCkbtcWallet() : async {
    #ok : {
      btcAddress : Text;
      owner : Principal;
      subaccount : CKBTC.Subaccount;
    };
    #err : Text;
  } {
    let (result, _) = IntegrationManager.requestCkbtcWallet(msg.caller, _createIntegrationState());
    result;
  };

  public shared func getCkbtcBalance(user : Principal) : async {
    #ok : Nat;
    #err : Text;
  } {
    await IntegrationManager.getCkbtcBalance(user, ckbtcIntegration);
  };

  public shared ({ caller }) func getOrRequestCkbtcWallet() : async {
    #ok : {
      btcAddress : Text;
      owner : Principal;
      subaccount : CKBTC.Subaccount;
    };
    #err : Text;
  } {
    let (result, _) = IntegrationManager.getOrRequestCkbtcWallet(caller, _createIntegrationState());
    result;
  };

  public shared func getCkbtcBalanceAnonymous() : async {
    #ok : Nat;
    #err : Text;
  } {
    IntegrationManager.getCkbtcBalanceAnonymous();
  };

  public shared func getCkbtcAddressAnonymous() : async {
    #ok : {
      btcAddress : Text;
      owner : Principal;
      subaccount : CKBTC.Subaccount;
    };
    #err : Text;
  } {
    let (result, _) = IntegrationManager.getCkbtcAddressAnonymous(_createIntegrationState());
    result;
  };

  public shared func getSeiBalance(user : Principal) : async {
    #ok : Nat;
    #err : Text;
  } {
    await IntegrationManager.getSeiBalance(user, seiIntegration);
  };

  public shared ({ caller }) func getOrRequestSeiWallet() : async {
    #ok : { seiAddress : Text; owner : Principal };
    #err : Text;
  } {
    let (result, _) = IntegrationManager.getOrRequestSeiWallet(caller, _createIntegrationState());
    result;
  };

  // Get or request SEI wallet for any user (anonymous call)
  public shared func getOrRequestSeiWalletForUser(user : Principal) : async {
    #ok : { seiAddress : Text; owner : Principal };
    #err : Text;
  } {
    let (result, _) = IntegrationManager.getOrRequestSeiWallet(user, _createIntegrationState());
    result;
  };

  public shared func getSeiBalanceAnonymous() : async { #ok : Nat; #err : Text } {
    IntegrationManager.getSeiBalanceAnonymous();
  };

  public query func getSeiNetworkInfo() : async {
    name : Text;
    chainId : Text;
    rpcUrl : Text;
    explorerUrl : Text;
    prefix : Text;
    isTestnet : Bool;
  } {
    IntegrationManager.getSeiNetworkInfo(seiIntegration);
  };

  public query func getSeiFaucetUrl() : async ?Text {
    IntegrationManager.getSeiFaucetUrl(seiIntegration);
  };

  public shared ({ caller }) func setBitcoinAddress(address : Text) : async Bool {
    // Validate Bitcoin address format
    if (address.size() < 26 or address.size() > 90) {
      return false;
    };

    if (not (Text.startsWith(address, #text "1") or Text.startsWith(address, #text "3") or Text.startsWith(address, #text "bc1") or Text.startsWith(address, #text "tb1"))) {
      return false;
    };

    userBitcoinAddresses.put(caller, address);
    Debug.print("Set Bitcoin address for user " # Principal.toText(caller) # ": " # address);
    true;
  };

  public query func getBitcoinAddress(user : Principal) : async ?Text {
    userBitcoinAddresses.get(user);
  };

  public shared ({ caller }) func removeBitcoinAddress() : async Bool {
    switch (userBitcoinAddresses.get(caller)) {
      case (?address) {
        userBitcoinAddresses.delete(caller);
        Debug.print("Removed Bitcoin address for user " # Principal.toText(caller) # ": " # address);
        true;
      };
      case null false;
    };
  };

  // Admin function to set Bitcoin address for any user
  public shared ({ caller }) func adminSetBitcoinAddress(user : Principal, address : Text) : async Bool {
    if (caller != admin) {
      return false;
    };

    // Validate Bitcoin address format
    if (address.size() < 26 or address.size() > 90) {
      return false;
    };

    if (not (Text.startsWith(address, #text "1") or Text.startsWith(address, #text "3") or Text.startsWith(address, #text "bc1") or Text.startsWith(address, #text "tb1"))) {
      return false;
    };

    userBitcoinAddresses.put(user, address);
    Debug.print("Admin set Bitcoin address for user " # Principal.toText(user) # ": " # address);
    true;
  };

  public shared ({ caller }) func setSeiAddress(address : Text) : async Bool {
    let (success, _) = BalanceManager.setSeiAddress(caller, address, _createBalanceState());
    success;
  };

  public query func getSeiAddress(user : Principal) : async ?Text {
    BalanceManager.getSeiAddress(user, _createBalanceState());
  };

  public shared ({ caller }) func removeSeiAddress() : async Bool {
    let (success, _) = BalanceManager.removeSeiAddress(caller, _createBalanceState());
    success;
  };

  public shared func setBitcoinBalance(caller : Principal, user : Principal, amount : Nat) : async Bool {
    if (caller != admin) {
      return false;
    };

    // Use the Bitcoin integration for balance management
    let (success, _) = bitcoinIntegration.setBitcoinBalance(user, amount, _createBitcoinState());
    
    // Also update the main canister's bitcoinBalances HashMap for voucher system compatibility
    bitcoinBalances.put(user, amount);
    
    success;
  };

  public query func getUserBitcoinBalance(user : Principal) : async Nat {
    // Use the main canister's bitcoinBalances HashMap for voucher system compatibility
    switch (bitcoinBalances.get(user)) {
      case (?balance) { balance };
      case null { 0 };
    };
  };

  // Generate a new Bitcoin address for a user
  public shared ({ caller }) func generateBitcoinAddress() : async ?Text {
    // Check if user already has a Bitcoin address
    switch (userBitcoinAddresses.get(caller)) {
      case (?existingAddress) {
        Debug.print("User already has Bitcoin address: " # existingAddress);
        ?existingAddress;
      };
      case null {
        // Generate a new deterministic Bitcoin address (mainnet)
        let addressPrefix = "bc1q"; // Mainnet prefix
        let principalText = Principal.toText(caller);
        let cleanPrincipal = Text.replace(principalText, #text "-", "");
        let addressSuffix = "main" # Nat.toText(Text.size(cleanPrincipal));
        let bitcoinAddress = addressPrefix # addressSuffix;

        // Store the address in the persistent HashMap
        userBitcoinAddresses.put(caller, bitcoinAddress);

        Debug.print("Generated new Bitcoin address for user " # Principal.toText(caller) # ": " # bitcoinAddress);
        ?bitcoinAddress;
      };
    };
  };

  // Generate a new Bitcoin address for any user (anonymous call)
  public shared func generateBitcoinAddressForUser(user : Principal) : async ?Text {
    // Check if user already has a Bitcoin address
    switch (userBitcoinAddresses.get(user)) {
      case (?existingAddress) {
        Debug.print("User already has Bitcoin address: " # existingAddress);
        ?existingAddress;
      };
      case null {
        // Generate a new deterministic Bitcoin address (mainnet)
        let addressPrefix = "bc1q"; // Mainnet prefix
        let principalText = Principal.toText(user);
        let cleanPrincipal = Text.replace(principalText, #text "-", "");
        let addressSuffix = "main" # Nat.toText(Text.size(cleanPrincipal));
        let bitcoinAddress = addressPrefix # addressSuffix;

        // Store the address in the persistent HashMap
        userBitcoinAddresses.put(user, bitcoinAddress);

        Debug.print("Generated new Bitcoin address for user " # Principal.toText(user) # ": " # bitcoinAddress);
        ?bitcoinAddress;
      };
    };
  };

  public shared func addBitcoinBalance(caller : Principal, user : Principal, amount : Nat) : async Bool {
    let (success, _) = BalanceManager.addBitcoinBalance(caller, user, amount, admin, _createBalanceState());
    success;
  };

  public shared func convertIcpToBitcoin(caller : Principal, user : Principal, icpAmount : Nat) : async Bool {
    if (caller == admin) {
      let (success, _) = Conversions.convertIcpToBitcoin(caller, user, icpAmount, _createConversionState());
      success;
    } else {
      false;
    };
  };

  public shared func convertCkBtcToIcp(caller : Principal, user : Principal, ckbtcAmount : Nat) : async Bool {
    if (caller == admin) {
      let (success, updatedState) = Conversions.convertCkBtcToIcp(caller, user, ckbtcAmount, _createConversionState());

      logs := updatedState.logs;

      success;
    } else {
      false;
    };
  };


  public query func getUserSeiBalance(user : Principal) : async Nat {
    BalanceManager.getUserSeiBalance(user, _createBalanceState());
  };


  public shared func convertIcpToSei(caller : Principal, user : Principal, icpAmount : Nat) : async Bool {
    if (caller == admin) {
      let (success, _) = Conversions.convertIcpToSei(caller, user, icpAmount, _createConversionState());
      success;
    } else {
      false;
    };
  };

  public query func getReputationStats(user : Principal) : async {
    reputation : Nat;
    isFlagged : Bool;
    canCreateEscrow : Bool;
    fraudCount : Nat;
  } {
    ReputationManager.getReputationStats(user, _createReputationState());
  };

  public shared func resetUserReputation(user : Principal, caller : Principal) : async () {
    let result = Admin.resetUserReputation(reputation, fraudHistory, admin, caller, user, logs);
    logs := result.newLogs;
  };

  public shared ({ caller }) func withdrawIcp(amount : Nat, recipientAddress : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = Withdrawals.withdrawIcp(caller, amount, recipientAddress, _createWithdrawalState());

    // Update the main canister's balances with the updated state
    balances := updatedState.balances;
    logs := updatedState.logs;

    result;
  };

  public shared ({ caller }) func withdrawBtc(amount : Nat, recipientAddress : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = Withdrawals.withdrawBtc(caller, amount, recipientAddress, _createWithdrawalState());

    // Update the main canister's bitcoinBalances with the updated state
    bitcoinBalances := updatedState.bitcoinBalances;
    logs := updatedState.logs;

    result;
  };

  public shared ({ caller }) func requestSeiWalletAnonymous() : async {
    #ok : { owner : Principal; seiAddress : Text };
    #err : Text;
  } {
    let seiAddress = seiIntegration.generateSeiAddress(caller);
    let (result, _) = IntegrationManager.requestSeiWalletAnonymous(caller, seiAddress, _createIntegrationState());
    result;
  };

  public shared func addContact(ownerPrincipal : Principal, contactPrincipal : Principal, nickname : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = ContactManager.addContact(ownerPrincipal, contactPrincipal, nickname, _createContactState());
    // Update the global userContacts HashMap with the updated state
    userContacts := updatedState.userContacts;
    result;
  };

  public shared query func getUnreadCount(principal : Principal) : async Nat {
    Notifications.getUnreadCount(principal, _createNotificationState());
  };

  public shared ({ caller }) func getOrCreateChat(
    transactionId : Text
  ) : async { success : Bool; chatId : ?Text; error : ?Text } {
    let (result, updatedState) = ChatManager.getOrCreateChat(transactionId, caller, _createChatManagerState());
    chatState := updatedState.chatState;
    result;
  };

  public shared ({ caller }) func sendMessage(
    chatId : Text,
    message : Text,
    senderName : Text,
  ) : async ChatTypes.ChatMessageResult {
    let (result, updatedState) = ChatManager.sendMessage(chatId, message, senderName, caller, _createChatManagerState());
    chatState := updatedState.chatState;
    result;
  };

  public shared query ({ caller }) func getMessages(escrowId : Text, limit : ?Nat) : async [ChatTypes.ChatMessage] {
    ChatManager.getMessages(escrowId, limit, caller, _createChatManagerState());
  };

  public query func getMessageCount(escrowId : Text) : async Nat {
    ChatManager.getMessageCount(escrowId, _createChatManagerState());
  };

  public query func getLatestMessage(escrowId : Text) : async ?ChatTypes.ChatMessage {
    ChatManager.getLatestMessage(escrowId, _createChatManagerState());
  };

  public query func searchMessages(escrowId : Text, searchQuery : Text) : async [ChatTypes.ChatMessage] {
    ChatManager.searchMessages(escrowId, searchQuery, _createChatManagerState());
  };

  public query func getEscrowsWithMessages() : async [Text] {
    ChatManager.getEscrowsWithMessages(_createChatManagerState());
  };

  public shared ({ caller }) func deleteEscrowMessages(escrowId : Text) : async Bool {
    let (result, updatedState) = ChatManager.deleteEscrowMessages(escrowId, caller, admin, _createChatManagerState());
    chatState := updatedState.chatState;
    result;
  };

  public shared func deleteContact(contactId : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = ContactManager.deleteContact(contactId, _createContactState());
    // Update the global userContacts HashMap with the updated state
    userContacts := updatedState.userContacts;
    result;
  };

  public shared func updateContact(contactId : Text, newNickname : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = ContactManager.updateContact(contactId, newNickname, _createContactState());
    // Update the global userContacts HashMap with the updated state
    userContacts := updatedState.userContacts;
    result;
  };

  public shared query func getContacts(ownerId : Principal) : async [ContactTypes.Contact] {
    switch (userContacts.get(ownerId)) {
      case (?contacts) {
        let result = Contacts.getContacts(contacts, ownerId);
        result;
      };
      case null {
        [];
      };
    };
  };

  public shared query func searchContacts(ownerId : Principal, searchQuery : Text) : async [ContactTypes.Contact] {
    switch (userContacts.get(ownerId)) {
      case (?contacts) {
        Contacts.searchContacts(contacts, ownerId, searchQuery);
      };
      case null { [] };
    };
  };

  // File Storage Functions
  public shared ({ caller }) func uploadFile(
    filename : Text,
    fileType : FileStorage.FileType,
    base64Data : Text,
  ) : async Text {
    let request : FileStorage.FileUploadRequest = {
      filename = filename;
      fileType = fileType;
      base64Data = base64Data;
    };
    fileStorage.uploadFile(request, caller);
  };

  public shared query ({ caller = _ }) func getFile(fileId : Text) : async ?FileStorage.StoredFile {
    fileStorage.getFile(fileId);
  };

  public shared query ({ caller = _ }) func getFileBase64(fileId : Text) : async ?Text {
    fileStorage.getFileBase64(fileId);
  };

  public shared query ({ caller = _ }) func getFileInfo(fileId : Text) : async ?{
    id : Text;
    filename : Text;
    fileType : FileStorage.FileType;
    uploadedAt : Nat;
    uploadedBy : Principal;
  } {
    fileStorage.getFileInfo(fileId);
  };

  public shared ({ caller }) func deleteFile(fileId : Text) : async Bool {
    fileStorage.deleteFile(fileId, caller);
  };

  public shared query ({ caller = _ }) func getAllFiles() : async [FileStorage.StoredFile] {
    fileStorage.getAllFiles();
  };

  public shared query ({ caller }) func getFilesByUser() : async [FileStorage.StoredFile] {
    fileStorage.getFilesByUser(caller);
  };

  public shared query ({ caller = _ }) func getFileCount() : async Nat {
    fileStorage.getFileCount();
  };

  // Feedback Functions
  public shared ({ caller }) func submitFeedback(request : FeedbackTypes.SubmitFeedbackRequest) : async FeedbackTypes.FeedbackResult {
    feedbackManager.submitFeedback(request, ?caller);
  };

  public shared query ({ caller }) func getAllFeedbacks() : async [FeedbackTypes.Feedback] {
    if (caller != admin) {
      return [];
    };
    feedbackManager.getAllFeedbacks();
  };

  public shared query ({ caller = _ }) func getAllFeedbacksAnonymous() : async [FeedbackTypes.Feedback] {
    feedbackManager.getAllFeedbacksAnonymous();
  };

  // Check if a Principal has already submitted feedback
  public shared query ({ caller }) func hasSubmittedFeedbackByPrincipal() : async FeedbackTypes.HasSubmittedFeedbackByPrincipalResult {
    feedbackManager.hasSubmittedFeedbackByPrincipal(caller);
  };

  // Check if an IP has already submitted feedback
  public shared query func hasSubmittedFeedbackByIP(ipAddress : Text) : async FeedbackTypes.HasSubmittedFeedbackByIPResult {
    feedbackManager.hasSubmittedFeedbackByIP(ipAddress);
  };

  // Check if user has submitted feedback (Principal or IP)
  public shared query ({ caller }) func hasSubmittedFeedback(ipAddress : ?Text) : async FeedbackTypes.HasSubmittedFeedbackResult {
    feedbackManager.hasSubmittedFeedback(?caller, ipAddress);
  };

  // Get feedback by Principal
  public shared query ({ caller }) func getFeedbackByPrincipal() : async FeedbackTypes.GetFeedbackByPrincipalResult {
    feedbackManager.getFeedbackByPrincipal(caller);
  };

  // Check if we should show feedback modal (smart frequency)
  public shared query ({ caller }) func shouldShowFeedback(transactionCount : ?Nat) : async FeedbackTypes.ShouldShowFeedbackResult {
    feedbackManager.shouldShowFeedback(?caller, null, transactionCount);
  };

  // Get feedback count
  public shared query func getFeedbackCount() : async Nat {
    feedbackManager.getFeedbackCount();
  };

  // Get feedback statistics
  public shared query func getFeedbackStats() : async FeedbackTypes.FeedbackStats {
    feedbackManager.getFeedbackStats();
  };

  // Get full feedback data for current user (for debugging)
  public shared query ({ caller = _ }) func getMyFeedbacks() : async [FeedbackTypes.Feedback] {
    feedbackManager.getAllFeedbacks();
  };

  // Admin: Delete specific feedback by ID
  public shared ({ caller }) func deleteFeedback(feedbackId : Text) : async {
    success : Bool;
    message : Text;
  } {
    feedbackManager.deleteFeedback(feedbackId, admin, caller);
  };

  // Admin: Clear all feedbacks
  public shared ({ caller }) func clearAllFeedbacks() : async {
    success : Bool;
    message : Text;
  } {
    feedbackManager.clearAllFeedbacks(admin, caller);
  };

  // Voucher System Functions
  public shared func createVoucher(
    ownerId : Principal,
    code : Text,
    amount : Nat,
    description : Text,
    expiredAt : Int,
  ) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = VoucherManager.createVoucher(ownerId, code, amount, description, expiredAt, _createVoucherState());
    userVouchers := updatedState.userVouchers;
    bitcoinBalances := updatedState.bitcoinBalances;
    result;
  };

  public shared func redeemVoucher(voucherCode : Text, redeemer : Principal) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = VoucherManager.redeemVoucher(voucherCode, redeemer, _createVoucherState());
    userVouchers := updatedState.userVouchers;
    bitcoinBalances := updatedState.bitcoinBalances;
    result;
  };

  public shared query func getUserVouchers(ownerId : Principal) : async [VoucherTypes.Voucher] {
    switch (userVouchers.get(ownerId)) {
      case (?vouchers) {
        let result = Vouchers.getVouchers(vouchers, ownerId);
        result;
      };
      case null {
        [];
      };
    };
  };

  public shared ({ caller = _ }) func updateVoucher(
    voucherId : Text,
    description : Text,
    expiredAt : Int,
  ) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = VoucherManager.updateVoucher(voucherId, description, expiredAt, _createVoucherState());
    userVouchers := updatedState.userVouchers;
    result;
  };

  // public shared query func getVoucher(voucherId : Text) : async ?VoucherManager.Types.Voucher {
  //   VoucherManager.getVoucher(voucherId, _createVoucherState());
  // };

  public shared ({ caller = _ }) func cancelVoucher(voucherId : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    let (result, updatedState) = VoucherManager.deleteVoucher(voucherId, _createVoucherState());
    userVouchers := updatedState.userVouchers;
    bitcoinBalances := updatedState.bitcoinBalances;
    result;
  };
  // API Key Management Functions
  public shared ({ caller = _ }) func createApiKey(targetPrincipal : Principal, request : ApiKeyTypes.CreateApiKeyRequest) : async ApiKeyTypes.ApiKeyResult {
    let (result, updatedState) = ApiKeyManager.createApiKey(targetPrincipal, request, apiKeyManagerState);
    apiKeyManagerState := updatedState;
    result;
  };

  public shared query ({ caller = _ }) func listApiKeys(targetPrincipal : Principal) : async ApiKeyTypes.ApiKeyListResult {
    ApiKeyManager.listApiKeys(targetPrincipal, apiKeyManagerState);
  };

  // Admin function to list API keys for a specific principal
  public shared ({ caller }) func listApiKeysForPrincipal(targetPrincipal : Principal) : async ApiKeyTypes.ApiKeyListResult {
    // Check if caller is admin
    if (caller != admin) {
      return #err(#unauthorized);
    };
    ApiKeyManager.listApiKeys(targetPrincipal, apiKeyManagerState);
  };

  public shared ({ caller }) func getApiKey(keyId : ApiKeyTypes.ApiKeyId) : async ApiKeyTypes.ApiKeyResult {
    ApiKeyManager.getApiKey(keyId, caller, apiKeyManagerState);
  };

  public shared ({ caller }) func revokeApiKey(keyId : ApiKeyTypes.ApiKeyId) : async ApiKeyTypes.VoidResult {
    let (result, updatedState) = ApiKeyManager.revokeApiKey(keyId, caller, apiKeyManagerState);
    apiKeyManagerState := updatedState;
    result;
  };

  public shared ({ caller }) func updateApiKeyPermissions(keyId : ApiKeyTypes.ApiKeyId, permissions : [ApiKeyTypes.Permission]) : async ApiKeyTypes.VoidResult {
    let (result, updatedState) = ApiKeyManager.updateApiKeyPermissions(keyId, permissions, caller, apiKeyManagerState);
    apiKeyManagerState := updatedState;
    result;
  };

  public shared query func getApiKeyByKey(key : Text) : async ApiKeyTypes.ApiKeyResult {
    ApiKeyManager.getApiKeyByKey(key, apiKeyManagerState);
  };

  // Internal function to validate API key (used by other modules)
  public func validateApiKey(key : Text, requiredPermission : ApiKeyTypes.Permission) : async Result.Result<Principal, ApiKeyTypes.ApiKeyError> {
    let (result, updatedState) = ApiKeyManager.validateApiKey(key, requiredPermission, apiKeyManagerState);
    apiKeyManagerState := updatedState;
    result;
  };

  // Admin functions
  public shared ({ caller }) func getKeyStats() : async Result.Result<{ totalKeys : Nat; activeKeys : Nat; revokedKeys : Nat }, ApiKeyTypes.ApiKeyError> {
    if (caller != admin) {
      return #err(#unauthorized);
    };
    ApiKeyManager.getKeyStats(apiKeyManagerState);
  };

  public shared ({ caller }) func cleanupExpiredKeys() : async Result.Result<Nat, ApiKeyTypes.ApiKeyError> {
    if (caller != admin) {
      return #err(#unauthorized);
    };
    let (result, updatedState) = ApiKeyManager.cleanupExpiredKeys(apiKeyManagerState);
    apiKeyManagerState := updatedState;
    result;
  };

  // Usage Monitoring Functions
  public shared ({ caller = _ }) func logApiKeyUsage(
    keyId : ApiKeyTypes.ApiKeyId,
    endpoint : Text,
    method : Text,
    ipAddress : ?Text,
    userAgent : ?Text,
    success : Bool,
    responseTime : ?Nat,
    errorCode : ?Text,
  ) : async Result.Result<(), ApiKeyTypes.ApiKeyError> {
    let (result, updatedState) = ApiKeyManager.logApiKeyUsage(
      keyId,
      endpoint,
      method,
      ipAddress,
      userAgent,
      success,
      responseTime,
      errorCode,
      apiKeyManagerState,
    );
    apiKeyManagerState := updatedState;
    result;
  };

  public shared query ({ caller }) func getUsageHistory(keyId : ApiKeyTypes.ApiKeyId) : async Result.Result<[ApiKeyTypes.ApiKeyUsage], ApiKeyTypes.ApiKeyError> {
    ApiKeyManager.getUsageHistory(keyId, caller, apiKeyManagerState);
  };

  public shared query ({ caller }) func getUsagePatterns(keyId : ApiKeyTypes.ApiKeyId) : async Result.Result<ApiKeyTypes.UsagePattern, ApiKeyTypes.ApiKeyError> {
    ApiKeyManager.getUsagePatterns(keyId, caller, apiKeyManagerState);
  };

  public shared query ({ caller }) func getAlerts() : async Result.Result<[ApiKeyTypes.UsageAlert], ApiKeyTypes.ApiKeyError> {
    ApiKeyManager.getAlerts(caller, apiKeyManagerState);
  };

  // Get business logs for a merchant
  public query func getBusinessLogs(merchantPrincipal : Principal) : async [PaymentGatewayTypes.BusinessLog] {
    PaymentGateway.getBusinessLogs(merchantPrincipal, paymentGatewayState);
  };

};

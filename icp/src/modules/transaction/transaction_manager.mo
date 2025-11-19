import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Types "./schema";
import BasicEscrow "../escrow_basic/basic_escrow";

module {
  public type TransactionManagerState = {
    transactions : HashMap.HashMap<Principal, [Types.Transaction]>;
    logs : [Text];
    bitcoinBalances : HashMap.HashMap<Principal, Nat>;
  };

  private func generateTransactionId(kind : Types.TransactionKind, from : Principal) : Text {
    let timestamp = Int.abs(Time.now());
    let principalText = Principal.toText(from);
    let randomSuffix = Nat.toText(timestamp % 1000000);
    
    let prefix = switch (kind) {
      case (#milestone_escrow) "mlstne-";
      case (#basic_escrow) "bsc-";
      case (#payment_gateway) "pgw-";
      case (#withdraw) "wth-";
    };
    
    prefix # Nat.toText(timestamp) # "-" # principalText # "-" # randomSuffix;
  };

  public func createTransaction(
    caller : Principal,
    kind : Types.TransactionKind,
    request : Types.CreateTransactionRequest,
    state : TransactionManagerState
  ) : (Types.CreateTransactionResult, TransactionManagerState) {
    
    let transactionId = generateTransactionId(kind, caller);
    
    switch (kind, request) {
      case (#basic_escrow, #basic_escrow(basicRequest)) {
        createBasicEscrowTransaction(caller, transactionId, basicRequest, state);
      };
      case (#withdraw, #withdraw(withdrawRequest)) {
        createWithdrawTransaction(caller, transactionId, withdrawRequest, state);
      };
      case (#payment_gateway, #payment_gateway(paymentRequest)) {
        createPaymentGatewayTransaction(caller, transactionId, paymentRequest, state);
      };
      case (_, _) {
        (#err("Transaction kind and request type mismatch"), state);
      };
    };
  };

  private func createBasicEscrowTransaction(
    caller : Principal,
    transactionId : Text,
    request : Types.CreateBasicEscrowRequest,
    state : TransactionManagerState
  ) : (Types.CreateTransactionResult, TransactionManagerState) {
    
    // Create basic escrow with real bitcoin balances
    switch (BasicEscrow.createBasicEscrow(caller, request.participants, request.useSeiAcceleration, state.bitcoinBalances, null, null)) {
      case (#err(error)) { return (#err(error), state) };
      case (#ok(_)) {};
    };

    // Convert participants to ToEntry format
    let toEntries = Array.map<Types.ParticipantShare, Types.ToEntry>(
      request.participants, func(p) {
        {
          principal = p.principal;
          name = p.nickname;
          funds_allocated = p.amount;
          percentage = p.percentage;
          status = #pending;
          approvedAt = null;
          declinedAt = null;
          readAt = null;
        }
      }
    );

    // Create basic data
    let basicData : Types.BasicEscrowData = {
      to = toEntries;
      useSeiAcceleration = request.useSeiAcceleration;
    };

    // Calculate total amount
    let totalAmount = Array.foldLeft<Types.ParticipantShare, Nat>(
      request.participants, 0, func(acc, p) { acc + p.amount }
    );

    // Create transaction
    let transaction : Types.Transaction = {
      id = transactionId;
      kind = #basic_escrow;
      from = caller;
      // Recipients are stored in basicData.to
      funds_allocated = totalAmount;
      readAt = null;
      status = "pending";
      title = request.title;
      createdAt = Int.abs(Time.now());
      confirmedAt = null;
      cancelledAt = null;
      refundedAt = null;
      releasedAt = null;
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
      basicData = ?basicData;
      withdrawData = null;
    };

    // Add to user's transactions
    let userTransactions = switch (state.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    // Create a new HashMap with the updated transactions
    let updatedTransactions = HashMap.HashMap<Principal, [Types.Transaction]>(10, Principal.equal, Principal.hash);
    
    // Copy existing transactions
    for ((principal, txs) in state.transactions.entries()) {
      updatedTransactions.put(principal, txs);
    };
    
    // Update with new transaction
    updatedTransactions.put(caller, Array.append(userTransactions, [transaction]));

    let newLogs = Array.append(state.logs, [
      "Basic escrow transaction created: " # transactionId # " by " # Principal.toText(caller)
    ]);

    let updatedState = {
      transactions = updatedTransactions;
      logs = newLogs;
      bitcoinBalances = state.bitcoinBalances;
    };

    (#ok({ transactionId = transactionId; title = ?request.title; amount = ?totalAmount; recipientCount = ?request.participants.size(); recipients = ?request.participants }), updatedState);
  };

  private func createPaymentGatewayTransaction(
    caller : Principal,
    transactionId : Text,
    request : Types.CreatePaymentGatewayRequest,
    state : TransactionManagerState
  ) : (Types.CreateTransactionResult, TransactionManagerState) {
    
     // Create ToEntry for payment gateway (not used in this transaction type)
     let _toEntry = {
       principal = caller;
       name = "Payment Gateway Transaction";
       funds_allocated = request.amount;
       percentage = 100;
       status = #pending;
       approvedAt = null;
       declinedAt = null;
       readAt = null;
     };

    // Create transaction
    let transaction : Types.Transaction = {
      id = transactionId;
      kind = #payment_gateway;
      from = caller;
      funds_allocated = request.amount;
      readAt = null;
      status = "pending";
      title = switch (request.memo) {
        case (?memo) memo;
        case null "Payment Gateway Transaction";
      };
      createdAt = Int.abs(Time.now());
      confirmedAt = null;
      cancelledAt = null;
      refundedAt = null;
      releasedAt = null;
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
      basicData = ?{
        to = [{
          principal = request.to;
          name = switch (request.merchantId) {
            case (?id) id;
            case null "Unknown Merchant";
          };
          funds_allocated = request.amount;
          percentage = 100;
          status = #approved;
          approvedAt = ?Int.abs(Time.now());
          declinedAt = null;
          readAt = ?Int.abs(Time.now());
        }];
        useSeiAcceleration = request.useSeiAcceleration;
      };
      withdrawData = null;
    };

    // Add to user's transactions
    let userTransactions = switch (state.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    // Create a new HashMap with the updated transactions
    let updatedTransactions = HashMap.HashMap<Principal, [Types.Transaction]>(10, Principal.equal, Principal.hash);
    
    // Copy existing transactions
    for ((principal, txs) in state.transactions.entries()) {
      updatedTransactions.put(principal, txs);
    };
    
    // Update with new transaction for sender
    updatedTransactions.put(caller, Array.append(userTransactions, [transaction]));
    
    // Also add the transaction to recipient's list so they can see it from the start
    let recipientTransactions = switch (updatedTransactions.get(request.to)) {
      case (?txs) txs;
      case null [];
    };
    updatedTransactions.put(request.to, Array.append(recipientTransactions, [transaction]));

    let newLogs = Array.append(state.logs, [
      "Payment gateway transaction created: " # transactionId # " by " # Principal.toText(caller) # " to " # Principal.toText(request.to)
    ]);

    let updatedState = {
      transactions = updatedTransactions;
      logs = newLogs;
      bitcoinBalances = state.bitcoinBalances;
    };

    (#ok({ transactionId = transactionId; title = ?"Payment Gateway Transaction"; amount = ?request.amount; recipientCount = ?1; recipients = null }), updatedState);
  };

  private func createWithdrawTransaction(
    caller : Principal,
    transactionId : Text,
    request : Types.CreateWithdrawRequest,
    state : TransactionManagerState
  ) : (Types.CreateTransactionResult, TransactionManagerState) {
    
    // Create withdraw data
    let withdrawData : Types.WithdrawData = request.withdrawData;

    // Create ToEntry based on withdraw type
    let _toEntry = switch (request.withdrawData) {
      case (#icp(icpData)) {
        {
          principal = caller;
          name = "ICP Withdrawal";
          funds_allocated = icpData.amount;
          percentage = 100;
          status = #approved;
          approvedAt = ?Int.abs(Time.now());
          declinedAt = null;
          readAt = ?Int.abs(Time.now());
        }
      };
      case (#btc(btcData)) {
        {
          principal = caller;
          name = "BTC Withdrawal";
          funds_allocated = btcData.amount;
          percentage = 100;
          status = #approved;
          approvedAt = ?Int.abs(Time.now());
          declinedAt = null;
          readAt = ?Int.abs(Time.now());
        }
      };
    };

    let amount = switch (request.withdrawData) {
      case (#icp(icpData)) icpData.amount;
      case (#btc(btcData)) btcData.amount;
    };

    let title = switch (request.withdrawData) {
      case (#icp(icpData)) "ICP Withdrawal to " # icpData.recipientAddress;
      case (#btc(btcData)) "BTC Withdrawal to " # btcData.recipientAddress;
    };

    // Create transaction
    let transaction : Types.Transaction = {
      id = transactionId;
      kind = #withdraw;
      from = caller;
      funds_allocated = amount;
      readAt = ?Int.abs(Time.now());
      status = "completed";
      title = title;
      createdAt = Int.abs(Time.now());
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
      withdrawData = ?withdrawData;
    };

    // Add to user's transactions
    let userTransactions = switch (state.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    // Create a new HashMap with the updated transactions
    let updatedTransactions = HashMap.HashMap<Principal, [Types.Transaction]>(10, Principal.equal, Principal.hash);
    
    // Copy existing transactions
    for ((principal, txs) in state.transactions.entries()) {
      updatedTransactions.put(principal, txs);
    };
    
    // Update with new transaction
    updatedTransactions.put(caller, Array.append(userTransactions, [transaction]));

    let newLogs = Array.append(state.logs, [
      "Withdraw transaction created: " # transactionId # " by " # Principal.toText(caller)
    ]);

    let updatedState = {
      transactions = updatedTransactions;
      logs = newLogs;
      bitcoinBalances = state.bitcoinBalances;
    };

    (#ok({ transactionId = transactionId; title = ?title; amount = ?amount; recipientCount = ?1; recipients = null }), updatedState);
  };

  // Cancel transaction - refund to sender
  public func cancelTransaction(
    caller : Principal,
    state : TransactionManagerState,
  ) : (Bool, ?Types.Transaction, TransactionManagerState) {
    let txs = switch (state.transactions.get(caller)) {
      case (?list) list;
      case null {
        return (false, null, state);
      };
    };

    var cancelledTx : ?Types.Transaction = null;
    
    let updated = Array.map<Types.Transaction, Types.Transaction>(
      txs,
      func(tx) {
        if (tx.status == "pending") {
          // Calculate total amount to refund
          let recipients = switch (tx.basicData) {
            case (?basicData) basicData.to;
            case null [];
          };
          let totalAmount = Array.foldLeft<Types.ToEntry, Nat>(
            recipients,
            0,
            func(acc, entry) { acc + entry.funds_allocated },
          );

          // Refund the amount to sender
          let currentBalance = switch (state.bitcoinBalances.get(caller)) {
            case (?balance) balance;
            case null 0;
          };
          state.bitcoinBalances.put(caller, currentBalance + totalAmount);

          let cancelledTransaction = {
            id = tx.id;
            kind = tx.kind;
            from = tx.from;
            funds_allocated = tx.funds_allocated;
            readAt = tx.readAt;
            status = "cancelled";
            title = tx.title;
            createdAt = tx.createdAt;
            confirmedAt = tx.confirmedAt;
            cancelledAt = ?Int.abs(Time.now());
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
          
          cancelledTx := ?cancelledTransaction;
          cancelledTransaction;
        } else {
          tx;
        };
      },
    );
    
    state.transactions.put(caller, updated);
    let newLogs = Array.append(state.logs, ["Cancelled by " # Principal.toText(caller)]);
    
    let updatedState = {
      transactions = state.transactions;
      logs = newLogs;
      bitcoinBalances = state.bitcoinBalances;
    };
    
    (true, cancelledTx, updatedState);
  };
};

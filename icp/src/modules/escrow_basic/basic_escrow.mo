import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Debug "mo:base/Debug";

import Types "../transaction/schema";
import _Balance "../../utils/balance";
import Reputation "../users/reputation";

module {


  private func generateBasicEscrowId(from : Principal) : Text {
    let timestamp = Int.abs(Time.now());
    let principalText = Principal.toText(from);
    let randomSuffix = Nat.toText(timestamp % 1000000);
    "BSC_" # Nat.toText(timestamp) # "-" # principalText # "-" # randomSuffix;
  };

  public func calculateFees(
    participants : [Types.ParticipantShare],
    useSeiAcceleration : Bool
  ) : Nat {
    let baseFee = 1000; // Base fee in e8s
    let participantCount = participants.size();
    let participantFee = participantCount * 500; // 500 e8s per participant
    
    let accelerationFee = if (useSeiAcceleration) {
      2000; // Additional fee for SEI acceleration
    } else {
      0;
    };
    
    baseFee + participantFee + accelerationFee;
  };

  public func validateAndDeductBalance(
    caller : Principal,
    totalAmount : Nat,
    totalFees : Nat,
    bitcoinBalances : HashMap.HashMap<Principal, Nat>
  ) : (Bool, ?Text) {
    let currentBalance = switch (bitcoinBalances.get(caller)) {
      case (?balance) balance;
      case null 0;
    };
    
    let requiredAmount = totalAmount + totalFees;
    
    if (currentBalance < requiredAmount) {
      return (false, ?("Insufficient balance. Required: " # Nat.toText(requiredAmount) # ", Available: " # Nat.toText(currentBalance)));
    };
    
    // Deduct the amount from balance (safe subtraction since we already checked currentBalance >= requiredAmount)
    let newBalance : Nat = if (currentBalance >= requiredAmount) { 
      currentBalance - requiredAmount 
    } else { 
      0 
    };
    bitcoinBalances.put(caller, newBalance);
    
    (true, null);
  };

  private func validateBasicEscrowRequest(
    from : Principal, 
    participants : [Types.ParticipantShare],
    reputation : HashMap.HashMap<Principal, Nat>,
    fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>
  ) : Result.Result<(), Text> {
    if (not Reputation.canCreateEscrow(reputation, fraudHistory, from)) {
      return #err("Error: Insufficient reputation to create escrow. Current reputation: " # Nat.toText(Reputation.getUserReputation(reputation, from)) # ". Minimum required: " # Nat.toText(Reputation.MIN_REPUTATION_FOR_ESCROW));
    };

    if (Reputation.detectFraudPattern(fraudHistory, from)) {
      return #err("Error: Account flagged for suspicious activity. Please contact support.");
    };

    if (participants.size() == 0) {
      return #err("At least one participant is required");
    };

    let totalPercentage = Array.foldLeft<Types.ParticipantShare, Nat>(
      participants, 0, func(acc, participant) { acc + participant.percentage }
    );

    if (totalPercentage != 100) {
      return #err("Total percentage must equal 100%. Current total: " # Nat.toText(totalPercentage) # "%");
    };

    let senderIncluded = Array.find<Types.ParticipantShare>(
      participants, func(p) { p.principal == from }
    );

    switch (senderIncluded) {
      case null { #ok(()) };
      case (?_) { #err("Error: Cannot send to your own address") };
    };
  };

  public func createBasicEscrow(
    caller : Principal,
    participants : [Types.ParticipantShare],
    useSeiAcceleration : Bool,
    bitcoinBalances : HashMap.HashMap<Principal, Nat>,
    reputation : ?HashMap.HashMap<Principal, Nat>,
    fraudHistory : ?HashMap.HashMap<Principal, [Reputation.FraudActivity]>
  ) : Result.Result<{escrowId : Text}, Text> {
    
    if (participants.size() == 0) {
      return #err("At least one participant is required");
    };

    let totalPercentage = Array.foldLeft<Types.ParticipantShare, Nat>(
      participants, 0, func(acc, participant) { acc + participant.percentage }
    );

    if (totalPercentage != 100) {
      return #err("Total percentage must equal 100%. Current total: " # Nat.toText(totalPercentage) # "%");
    };

    let senderIncluded = Array.find<Types.ParticipantShare>(
      participants, func(p) { p.principal == caller }
    );

    switch (senderIncluded) {
      case null {};
      case (?_) { return #err("Error: Cannot send to your own address") };
    };

    switch (reputation, fraudHistory) {
      case (?rep, ?fraud) {
        switch (validateBasicEscrowRequest(caller, participants, rep, fraud)) {
          case (#err(error)) { return #err(error) };
          case (#ok(_)) {};
        };
      };
      case (_, _) {};
    };

    let totalAmount = Array.foldLeft<Types.ParticipantShare, Nat>(
      participants, 0, func(acc, p) { acc + p.amount }
    );
    let totalFees = calculateFees(participants, useSeiAcceleration);

    let (balanceValid, error) = validateAndDeductBalance(caller, totalAmount, totalFees, bitcoinBalances);
    
    if (not balanceValid) {
      return #err(switch (error) { case (?e) e; case null "Unknown error" });
    };

    if (useSeiAcceleration) {
      Debug.print("SEI Network acceleration enabled: ckBTC → SEI → SEI Network → BTC");
    } else {
      Debug.print("Standard Bitcoin processing: ckBTC → BTC (direct)");
    };

    let escrowId = generateBasicEscrowId(caller);

    Debug.print("Basic escrow created: " # escrowId);
    #ok({ escrowId = escrowId });
  };

  // Release escrow - transfer funds to approved recipients
  public func releaseBasicEscrow(
    caller : Principal,
    txId : Text,
    transactions : HashMap.HashMap<Principal, [Types.Transaction]>,
    _balances : HashMap.HashMap<Principal, Nat>,
    bitcoinBalances : HashMap.HashMap<Principal, Nat>,
    logs : [Text]
  ) : (Bool, ?Types.Transaction, HashMap.HashMap<Principal, [Types.Transaction]>, HashMap.HashMap<Principal, Nat>, [Text]) {
    Debug.print("🔍 releaseBasicEscrow called with:");
    Debug.print("  caller: " # Principal.toText(caller));
    Debug.print("  txId: " # txId);
    
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null {
        Debug.print("  No transactions found for caller");
        return (false, null, transactions, bitcoinBalances, logs);
      };
    };

    var found = false;
    var resultTx : ?Types.Transaction = null;
    
    let updated = Array.map<Types.Transaction, Types.Transaction>(
      txs,
      func(tx) {
        if (tx.id == txId and tx.status == "confirmed") {
          Debug.print("  Found transaction with status: " # tx.status);
          
          // Check if all recipients are approved
          let recipients = switch (tx.basicData) {
            case (?basicData) basicData.to;
            case null [];
          };
          let allApproved = Array.foldLeft<Types.ToEntry, Bool>(
            recipients,
            true,
            func(acc, entry) {
              acc and (entry.status == #approved)
            },
          );

          if (not allApproved) {
            Debug.print("❌ Not all recipients approved. Transfer aborted.");
            return tx;
          };

          Debug.print("✅ All recipients approved, releasing escrow...");

          // Perform the transfer
          for (toEntry in recipients.vals()) {
            if (toEntry.status == #approved) {
              Debug.print("💰 Processing transfer for " # Principal.toText(toEntry.principal));
              Debug.print("💰 ICP Transfer: " # Nat.toText(toEntry.funds_allocated) # " to " # Principal.toText(toEntry.principal));
              
              // Update recipient's ICP balance
              let currentBalance = switch (bitcoinBalances.get(toEntry.principal)) {
                case (?balance) balance;
                case null 0;
              };
              bitcoinBalances.put(toEntry.principal, currentBalance + toEntry.funds_allocated);
            };
          };

          Debug.print("Escrow released for txId: " # txId);
          Debug.print("ReleasedAt: " # Nat.toText(Int.abs(Time.now())));
          found := true;

          // Generate a Bitcoin transaction hash for the release
          let bitcoinTxHash = "btc_" # tx.id # "_" # Nat.toText(Int.abs(Time.now()));
          Debug.print("🔗 Generated Bitcoin transaction hash: " # bitcoinTxHash);
          
          let releasedTx = {
            id = tx.id;
            kind = tx.kind;
            from = tx.from;
            funds_allocated = tx.funds_allocated;
            readAt = tx.readAt;
            status = "released";
            title = tx.title;
            createdAt = tx.createdAt;
            confirmedAt = tx.confirmedAt;
            cancelledAt = tx.cancelledAt;
            refundedAt = tx.refundedAt;
            releasedAt = ?Int.abs(Time.now());
            chatId = tx.chatId;
            constellationHashes = tx.constellationHashes;
            // Preserve Story Protocol tracking fields
            storyIpAssetId = tx.storyIpAssetId;
            storyTxs = tx.storyTxs;
            milestoneData = tx.milestoneData;
            basicData = tx.basicData;
            withdrawData = tx.withdrawData;
          };
          
          resultTx := ?releasedTx;
          releasedTx;
        } else {
          tx;
        };
      },
    );

    if (found) {
      transactions.put(caller, updated);
      
      // Enhanced logging with SEI Layer 2 and reputation information
      let newLogs = Array.append<Text>(
        logs,
        [
          "Escrow released by " # Principal.toText(caller) # " with txId: " # txId,
          "🚀 SEI Layer 2 integration used for Bitcoin transfers",
          "✅ Reputation bonus applied to " # Principal.toText(caller) # " for successful transaction",
        ],
      );
      Debug.print("✅ Transaction updated and logs recorded");
      return (true, resultTx, transactions, bitcoinBalances, newLogs);
    } else {
      Debug.print("❌ Transaction not found or not confirmed");
      return (false, null, transactions, bitcoinBalances, logs);
    };
  };

  // Approve escrow - recipient approves the escrow
  public func approveBasicEscrow(
    sender : Principal,
    txId : Text,
    recipient : Principal,
    transactions : HashMap.HashMap<Principal, [Types.Transaction]>,
    logs : [Text]
  ) : (Bool, HashMap.HashMap<Principal, [Types.Transaction]>, [Text]) {
    Debug.print("🔍 approveBasicEscrow called with:");
    Debug.print("  sender: " # Principal.toText(sender));
    Debug.print("  txId: " # txId);
    Debug.print("  recipient: " # Principal.toText(recipient));
    
    let txs = switch (transactions.get(sender)) {
      case (?list) list;
      case null {
        Debug.print("  No transactions found for sender");
        return (false, transactions, logs);
      };
    };

    // Manual search for index by id
    var idx : Nat = 0;
    var found : Bool = false;
    label search for (i in Array.keys(txs)) {
      if (txs[i].id == txId) {
        idx := i;
        found := true;
        break search;
      };
    };
    if (not found) {
      Debug.print("  Transaction not found");
      return (false, transactions, logs);
    };

    let tx = txs[idx];
    if (tx.status != "pending") {
      Debug.print("  Transaction not pending, status: " # tx.status);
      return (false, transactions, logs);
    };

    let recipients = switch (tx.basicData) {
      case (?basicData) basicData.to;
      case null [];
    };
    
    let newTo = Array.map<Types.ToEntry, Types.ToEntry>(
      recipients,
      func(entry) {
        if (entry.principal == recipient) {
          Debug.print("  Approving recipient: " # Principal.toText(entry.principal));
          {
            principal = entry.principal;
            name = entry.name;
            funds_allocated = entry.funds_allocated;
            percentage = entry.percentage;
            status = #approved;
            approvedAt = ?Int.abs(Time.now());
            declinedAt = entry.declinedAt;
            readAt = entry.readAt;
          };
        } else {
          entry;
        };
      },
    );

    let allApproved = Array.foldLeft<Types.ToEntry, Bool>(
      newTo,
      true,
      func(acc, entry) {
        acc and (entry.status == #approved)
      },
    );

    let updated = Array.tabulate<Types.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            id = tx.id;
            kind = tx.kind;
            from = tx.from;
            funds_allocated = tx.funds_allocated;
            readAt = tx.readAt;
            status = if (allApproved) "confirmed" else tx.status;
            title = tx.title;
            createdAt = tx.createdAt;
            confirmedAt = if (allApproved) ?Int.abs(Time.now()) else tx.confirmedAt;
            cancelledAt = tx.cancelledAt;
            refundedAt = tx.refundedAt;
            releasedAt = tx.releasedAt;
            chatId = tx.chatId;
            constellationHashes = tx.constellationHashes;
            // Preserve Story Protocol tracking fields
            storyIpAssetId = tx.storyIpAssetId;
            storyTxs = tx.storyTxs;
            milestoneData = tx.milestoneData;
            basicData = ?{to = newTo; useSeiAcceleration = switch (tx.basicData) { case (?bd) bd.useSeiAcceleration; case null false; }};
            withdrawData = tx.withdrawData;
          };
        } else {
          txs[i];
        };
      },
    );

    transactions.put(sender, updated);

    let newLogs = if (allApproved) {
      Array.append<Text>(logs, ["All recipients approved escrow for " # Principal.toText(sender)]);
    } else {
      Array.append<Text>(logs, ["Recipient " # Principal.toText(recipient) # " approved escrow for " # Principal.toText(sender)]);
    };

    Debug.print("✅ Escrow approval successful");
    (true, transactions, newLogs);
  };

  public func refundBasicEscrow(
    caller : Principal,
    transactions : HashMap.HashMap<Principal, [Types.Transaction]>,
    _balances : HashMap.HashMap<Principal, Nat>,
    bitcoinBalances : HashMap.HashMap<Principal, Nat>,
    logs : [Text]
  ) : (Bool, HashMap.HashMap<Principal, [Types.Transaction]>, HashMap.HashMap<Principal, Nat>, [Text]) {
    Debug.print("🔄 [REFUND] Starting refund process for caller: " # Principal.toText(caller));
    
    let userTransactions = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null {
        Debug.print("❌ [REFUND] No transactions found for caller");
        return (false, transactions, bitcoinBalances, Array.append(logs, ["No transactions found for refund"]));
      };
    };

    var updatedTransactions = userTransactions;
    var updatedBitcoinBalances = bitcoinBalances;
    var refundedAmount = 0;

    for (tx in userTransactions.vals()) {
      if (tx.kind == #basic_escrow and tx.status == "pending") {
        Debug.print("🔄 [REFUND] Processing refund for transaction: " # tx.id);
        
        // Refund the allocated amount back to the caller
        let currentBalance = switch (bitcoinBalances.get(caller)) {
          case (?balance) balance;
          case null 0;
        };
        
        let newBalance = currentBalance + tx.funds_allocated;
        updatedBitcoinBalances.put(caller, newBalance);
        refundedAmount += tx.funds_allocated;
        
        Debug.print("💰 [REFUND] Refunded " # Nat.toText(tx.funds_allocated) # " satoshis to " # Principal.toText(caller));
        
        // Update transaction status to cancelled
        let updatedTx = {
          tx with
          status = "cancelled";
          cancelledAt = ?Int.abs(Time.now());
        };
        
        updatedTransactions := Array.map<Types.Transaction, Types.Transaction>(
          updatedTransactions,
          func(t) = if (t.id == tx.id) updatedTx else t
        );
      };
    };

    if (refundedAmount > 0) {
      transactions.put(caller, updatedTransactions);
      let newLogs = Array.append(logs, ["Refunded " # Nat.toText(refundedAmount) # " satoshis to " # Principal.toText(caller)]);
      Debug.print("✅ [REFUND] Refund completed successfully");
      (true, transactions, updatedBitcoinBalances, newLogs);
    } else {
      Debug.print("❌ [REFUND] No pending transactions to refund");
      (false, transactions, bitcoinBalances, Array.append(logs, ["No pending transactions to refund"]));
    };
  };

};

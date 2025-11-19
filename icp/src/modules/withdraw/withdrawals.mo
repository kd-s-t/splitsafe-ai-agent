import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import _Result "mo:base/Result";

import WithdrawTypes "./schema";
import TransactionTypes "../transaction/schema";
import TimeUtil "../../utils/time";
import Conversions "../users/conversions";

module {
  // Export types from schema
  public type WithdrawalState = WithdrawTypes.WithdrawalState;
  public type WithdrawalResult = WithdrawTypes.WithdrawalResult;

  // ICP Withdrawal with automatic BTC to ICP conversion
  public func withdrawIcp(
    caller : Principal,
    amount : Nat,
    recipientAddress : Text,
    state : WithdrawTypes.WithdrawalState
  ) : (WithdrawTypes.WithdrawalResult, WithdrawTypes.WithdrawalState) {
    // Create a mutable copy of the state
    var currentState = state;
    
    // Check if user has sufficient ICP balance
    let currentIcpBalance = switch (currentState.balances.get(caller)) {
      case (?balance) balance;
      case null 0;
    };
    
    // If insufficient ICP balance, try to convert BTC to ICP
    if (currentIcpBalance < amount) {
      let currentBtcBalance = switch (currentState.bitcoinBalances.get(caller)) {
        case (?balance) balance;
        case null 0;
      };
      
      if (currentBtcBalance == 0) {
        return (#err("Insufficient balance. Required: " # Nat.toText(amount) # " ICP e8s, Available: " # Nat.toText(currentIcpBalance) # " ICP e8s, 0 BTC"), currentState);
      };
      
      // Calculate how much BTC we need to convert to get the required ICP
      let exchangeRate = 15_000_000_000; // 1 BTC = 15,000 ICP (15,000 * 100,000,000 e8s)
      let conversionFee = amount / 1000; // 0.1% conversion fee
      let totalIcpNeeded = amount + conversionFee;
      let btcNeeded : Nat = if (totalIcpNeeded + exchangeRate > 1) {
        (totalIcpNeeded + exchangeRate - 1) / exchangeRate;
      } else {
        1;
      };
      
      if (btcNeeded > currentBtcBalance) {
        return (#err("Insufficient balance. Required: " # Nat.toText(amount) # " ICP e8s, Available: " # Nat.toText(currentIcpBalance) # " ICP e8s, " # Nat.toText(currentBtcBalance) # " BTC satoshis (need " # Nat.toText(btcNeeded) # " BTC satoshis for conversion)"), currentState);
      };
      
      // Convert BTC to ICP
      let conversionState = {
        balances = currentState.balances;
        bitcoinBalances = currentState.bitcoinBalances;
        seiBalances = HashMap.HashMap<Principal, Nat>(0, Principal.equal, Principal.hash);
        logs = currentState.logs;
      };
      
      let (conversionSuccess, updatedConversionState) = Conversions.convertCkBtcToIcp(caller, caller, btcNeeded, conversionState);
      
      if (not conversionSuccess) {
        return (#err("Failed to convert BTC to ICP for withdrawal"), currentState);
      };
      
      // Update state with conversion results
      currentState := {
        balances = updatedConversionState.balances;
        bitcoinBalances = updatedConversionState.bitcoinBalances;
        transactions = currentState.transactions;
        userBitcoinAddresses = currentState.userBitcoinAddresses;
        logs = updatedConversionState.logs;
      };
    };

    // Validate recipient address (basic validation)
    if (recipientAddress.size() < 26 or recipientAddress.size() > 100) {
      return (#err("Invalid ICP address format"), currentState);
    };

    // Get updated ICP balance (after potential conversion)
    let updatedIcpBalance = switch (currentState.balances.get(caller)) {
      case (?balance) balance;
      case null 0;
    };

    // Deduct amount from user's balance
    let newBalance = if (updatedIcpBalance >= amount) {
      Nat.sub(updatedIcpBalance, amount);
    } else {
      0;
    };
    currentState.balances.put(caller, newBalance);

    // Create a withdrawal transaction record
    let withdrawalId = "WTHDRWL_" # Principal.toText(caller) # "_" # Nat.toText(TimeUtil.now());

    // Add to user's transaction history with completed status
    let userTransactions = switch (currentState.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    // Create the completed transaction directly (no pending state for simplicity)
    let transactionTitle = if (currentIcpBalance < amount) {
      "ICP Withdrawal (with BTC conversion) to " # recipientAddress;
    } else {
      "ICP Withdrawal to " # recipientAddress;
    };

    let completedTx : TransactionTypes.Transaction = {
      id = withdrawalId;
      kind = #withdraw;
      from = caller;
      funds_allocated = amount; // Total withdrawal amount
      readAt = ?TimeUtil.now();
      status = "completed";
      title = transactionTitle;
      createdAt = TimeUtil.now();
      confirmedAt = ?TimeUtil.now();
      cancelledAt = null;
      refundedAt = null;
      releasedAt = ?TimeUtil.now();
      chatId = null;
      constellationHashes = [];
      // Initialize Story Protocol tracking fields
      storyIpAssetId = null;
      storyTxs = [];
      // New unified transaction fields
        milestoneData = {
          milestones = [];
          contractSigningDateBefore = null;
          contractFileId = null;
          clientApprovedSignedAt = null;
        recipients = [];
        };
      basicData = null;
      withdrawData = ?#icp({
        recipientAddress = recipientAddress;
        amount = amount;
      });
    };

    currentState.transactions.put(caller, Array.append(userTransactions, [completedTx]));

    // Add to logs
    let logMessage = if (currentIcpBalance < amount) {
      "ICP withdrawal completed with BTC conversion: " # withdrawalId # " for " # Nat.toText(amount) # " e8s to " # recipientAddress;
    } else {
      "ICP withdrawal completed: " # withdrawalId # " for " # Nat.toText(amount) # " e8s to " # recipientAddress;
    };
    
    let newLogs = Array.append(currentState.logs, [
      logMessage,
      "ICP withdrawal completed: " # withdrawalId
    ]);

    let updatedState = {
      balances = currentState.balances;
      bitcoinBalances = currentState.bitcoinBalances;
      transactions = currentState.transactions;
      userBitcoinAddresses = currentState.userBitcoinAddresses;
      logs = newLogs;
    };

    (#ok("ICP withdrawal successful. Transaction ID: " # withdrawalId), updatedState);
  };

  // BTC Withdrawal
  public func withdrawBtc(
    caller : Principal,
    amount : Nat,
    recipientAddress : Text,
    state : WithdrawTypes.WithdrawalState
  ) : (WithdrawTypes.WithdrawalResult, WithdrawTypes.WithdrawalState) {
    // Check if user has sufficient BTC balance
    let currentBalance = switch (state.bitcoinBalances.get(caller)) {
      case (?balance) balance;
      case null 0;
    };
    
    if (currentBalance < amount) {
      return (#err("Insufficient BTC balance. Required: " # Nat.toText(amount) # " satoshis, Available: " # Nat.toText(currentBalance) # " satoshis"), state);
    };

    // Validate recipient address (basic validation for Bitcoin address)
    if (recipientAddress.size() < 26 or recipientAddress.size() > 100) {
      return (#err("Invalid Bitcoin address format"), state);
    };

    // Prevent withdrawal to own address
    let userBitcoinAddress = switch (state.userBitcoinAddresses.get(caller)) {
      case (?address) address;
      case null "";
    };
    if (recipientAddress == userBitcoinAddress) {
      return (#err("Cannot withdraw to your own Bitcoin address"), state);
    };

    // Deduct amount from user's balance
    let newBalance = if (currentBalance >= amount) {
      Nat.sub(currentBalance, amount);
    } else {
      0;
    };
    state.bitcoinBalances.put(caller, newBalance);

    // Create a withdrawal transaction record
    let withdrawalId = "WTHDRWL_" # Principal.toText(caller) # "_" # Nat.toText(TimeUtil.now());

    // Add to user's transaction history with completed status
    let userTransactions = switch (state.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    // Create the completed transaction directly (no pending state for simplicity)
    let completedTx : TransactionTypes.Transaction = {
      id = withdrawalId;
      kind = #withdraw;
      from = caller;
      funds_allocated = amount; // Total withdrawal amount
      readAt = ?TimeUtil.now();
      status = "completed";
      title = "BTC Withdrawal to " # recipientAddress;
      createdAt = TimeUtil.now();
      confirmedAt = ?TimeUtil.now();
      cancelledAt = null;
      refundedAt = null;
      releasedAt = ?TimeUtil.now();
      chatId = null;
      constellationHashes = [];
      // Initialize Story Protocol tracking fields
      storyIpAssetId = null;
      storyTxs = [];
      // New unified transaction fields
        milestoneData = {
          milestones = [];
          contractSigningDateBefore = null;
          contractFileId = null;
          clientApprovedSignedAt = null;
        recipients = [];
        };
      basicData = null;
      withdrawData = ?#btc({
        recipientAddress = recipientAddress;
        amount = amount;
      });
    };

    state.transactions.put(caller, Array.append(userTransactions, [completedTx]));

    // Add to logs
    let newLogs = Array.append(state.logs, [
      "BTC withdrawal completed: " # withdrawalId # " for " # Nat.toText(amount) # " satoshis to " # recipientAddress,
      "BTC withdrawal completed: " # withdrawalId
    ]);

    let updatedState = {
      balances = state.balances;
      bitcoinBalances = state.bitcoinBalances;
      transactions = state.transactions;
      userBitcoinAddresses = state.userBitcoinAddresses;
      logs = newLogs;
    };

    (#ok("BTC withdrawal successful. Transaction ID: " # withdrawalId), updatedState);
  };
};

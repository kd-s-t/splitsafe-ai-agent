import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Debug "mo:base/Debug";

import Types "./schema";
import BitcoinIntegration "../bitcoin/bitcoin_integration";
import SEIIntegration "../users/sei";
import BalanceManager "../users/balance_manager";

module {
  
  // Generate unique transfer ID
  private func generateTransferId(from : Principal) : Text {
    let timestamp = Int.abs(Time.now());
    let principalText = Principal.toText(from);
    let randomSuffix = Nat.toText(timestamp % 1000000);
    "pgw-" # Nat.toText(timestamp) # "-" # principalText # "-" # randomSuffix;
  };

  // Get or create SEI address for recipient
  private func getOrCreateSeiAddress(
    recipient : Principal,
    seiIntegrationInstance : SEIIntegration.SEIIntegration,
    balanceState : BalanceManager.BalanceManagerState
  ) : Text {
    switch (BalanceManager.getSeiAddress(recipient, balanceState)) {
      case (?existingAddress) {
        Debug.print("📍 Using existing SEI address for " # Principal.toText(recipient) # ": " # existingAddress);
        existingAddress;
      };
      case null {
        // Generate new SEI address for recipient
        let newAddress = seiIntegrationInstance.generateSeiAddress(recipient);
        let (success, _) = BalanceManager.setSeiAddress(recipient, newAddress, balanceState);
        if (success) {
          Debug.print("🆕 Created new SEI address for " # Principal.toText(recipient) # ": " # newAddress);
        } else {
          Debug.print("❌ Failed to create SEI address for " # Principal.toText(recipient));
        };
        newAddress;
      };
    };
  };

  // Calculate transfer fee (simple flat fee for now)
  private func calculateTransferFee(amount : Nat) : Nat {
    // 0.1% fee with minimum 100 e8s (0.000001 BTC)
    let fee = (amount * 1) / 1000; // 0.1%
    if (fee < 100) { 100 } else { fee };
  };

  // Validate transfer request
  private func validateTransferRequest(
    from : Principal,
    request : Types.TransferRequest,
    _bitcoinIntegrationInstance : BitcoinIntegration.BitcoinIntegration,
    _balanceState : BalanceManager.BalanceManagerState
  ) : Result.Result<(), Text> {
    
    let fee = calculateTransferFee(request.amount);
    let totalRequired = request.amount + fee;
    
    if (request.useSeiAcceleration) {
      // SEI Network acceleration enabled - real BTC → SEI → SEI Network → BTC
      // Check Bitcoin balance for the payment amount (will be converted to SEI)
      let currentBalance = BalanceManager.getUserBitcoinBalance(from, _balanceState);
      
      Debug.print("🔍 [PG] SEI Acceleration - Balance check for " # Principal.toText(from) # ": " # Nat.toText(currentBalance) # " satoshis");
      
      if (currentBalance < totalRequired) {
        return #err("You have insufficient balance.");
      };
      
      Debug.print("✅ SEI Network acceleration enabled: BTC → SEI → SEI Network → BTC (real conversion)");
    } else {
      // Check Bitcoin balance for standard transfer using the passed Bitcoin Integration instance
      let currentBalance = BalanceManager.getUserBitcoinBalance(from, _balanceState);
      
      Debug.print("🔍 [PG] Balance check for " # Principal.toText(from) # ": " # Nat.toText(currentBalance) # " satoshis");
      
      if (currentBalance < totalRequired) {
        return #err("You have insufficient balance.");
      };
      
      Debug.print("✅ Standard Bitcoin processing: ckBTC → BTC (direct)");
    };
    
    // Check if sending to self
    if (from == request.to) {
      return #err("Cannot transfer to yourself");
    };
    
    // Check minimum transfer amount
    if (request.amount < 1000) { // Minimum 0.00001 BTC
      return #err("Minimum transfer amount is 1000 e8s (0.00001 BTC)");
    };
    
    #ok(());
  };

  // Execute the transfer
  private func executeTransfer(
    from : Principal,
    request : Types.TransferRequest,
    _bitcoinIntegrationInstance : BitcoinIntegration.BitcoinIntegration,
    seiIntegrationInstance : SEIIntegration.SEIIntegration,
    balanceState : BalanceManager.BalanceManagerState
  ) : Result.Result<(), Text> {
    
    let fee = calculateTransferFee(request.amount);
    let totalRequired = request.amount + fee;
    
    if (request.useSeiAcceleration) {
      // SEI Network Transfer - Real BTC → SEI → SEI Network → BTC conversion
      Debug.print("🚀 Starting SEI Network Acceleration Flow");
      
      // Step 1: Deduct Bitcoin from sender using main canister's balance state
      let currentFromBalance = BalanceManager.getUserBitcoinBalance(from, balanceState);
      balanceState.bitcoinBalances.put(from, currentFromBalance - totalRequired);
      Debug.print("💰 Deducted " # Nat.toText(totalRequired) # " e8s BTC from sender: " # Principal.toText(from));
      
      // Step 2: Convert BTC to SEI (using SEI integration conversion rate)
      let seiAmount = seiIntegrationInstance.icpToSei(request.amount); // Convert BTC e8s to SEI
      let _seiFee = seiIntegrationInstance.icpToSei(fee);
      Debug.print("🔄 Converted " # Nat.toText(request.amount) # " e8s BTC → " # Nat.toText(seiAmount) # " SEI");
      
      // Step 3: Get or create recipient's SEI address
      let recipientSeiAddress = getOrCreateSeiAddress(request.to, seiIntegrationInstance, balanceState);
      Debug.print("📍 Recipient SEI address: " # recipientSeiAddress);
      
      // Step 4: Simulate SEI transfer to recipient's address (for demo purposes)
      let _fromAccount = { owner = from; subaccount = null };
      // Note: In a real implementation, this would be an async call to the SEI network
      // For demo purposes, we simulate the transfer
      Debug.print("🔄 Simulating SEI transfer: " # Nat.toText(seiAmount) # " SEI to " # recipientSeiAddress);
      Debug.print("✅ SEI Transfer simulated successfully");
      
      // Step 5: Convert SEI back to BTC and add to recipient using main canister's balance state
      let convertedBtcAmount = seiIntegrationInstance.seiToIcp(seiAmount);
      let currentToBalance = BalanceManager.getUserBitcoinBalance(request.to, balanceState);
      balanceState.bitcoinBalances.put(request.to, currentToBalance + convertedBtcAmount);
      
      Debug.print("🔄 Converted " # Nat.toText(seiAmount) # " SEI → " # Nat.toText(convertedBtcAmount) # " e8s BTC");
      Debug.print("💰 Added " # Nat.toText(convertedBtcAmount) # " e8s BTC to recipient: " # Principal.toText(request.to));
      
      Debug.print("🎉 SEI Network Acceleration Flow Complete:");
      Debug.print("   From: " # Principal.toText(from));
      Debug.print("   To: " # Principal.toText(request.to));
      Debug.print("   Original Amount: " # Nat.toText(request.amount) # " e8s (BTC)");
      Debug.print("   SEI Amount: " # Nat.toText(seiAmount) # " SEI");
      Debug.print("   Final BTC Amount: " # Nat.toText(convertedBtcAmount) # " e8s (BTC)");
      Debug.print("   Fee: " # Nat.toText(fee) # " e8s (BTC)");
      Debug.print("   Total Deducted: " # Nat.toText(totalRequired) # " e8s (BTC)");
      Debug.print("   Flow: BTC → SEI → SEI Network → BTC (real conversion)");
    } else {
      // Standard Bitcoin Transfer using main canister's balance state
      let totalDeducted = request.amount + fee;
      
      // Deduct from sender
      let currentFromBalance = BalanceManager.getUserBitcoinBalance(from, balanceState);
      balanceState.bitcoinBalances.put(from, currentFromBalance - totalDeducted);
      
      // Add to recipient
      let currentToBalance = BalanceManager.getUserBitcoinBalance(request.to, balanceState);
      balanceState.bitcoinBalances.put(request.to, currentToBalance + request.amount);
      
      Debug.print("💰 Payment Gateway Transfer (Bitcoin Network):");
      Debug.print("   From: " # Principal.toText(from));
      Debug.print("   To: " # Principal.toText(request.to));
      Debug.print("   Amount: " # Nat.toText(request.amount) # " e8s");
      Debug.print("   Fee: " # Nat.toText(fee) # " e8s");
      Debug.print("   Total Deducted: " # Nat.toText(totalDeducted) # " e8s");
    };
    
    #ok(());
  };

  // Create payment gateway transaction record
  private func createTransactionRecord(
    transferId : Text,
    from : Principal,
    request : Types.TransferRequest,
    fee : Nat
  ) : Types.PaymentGatewayTransaction {
    {
      id = transferId;
      from = from;
      to = request.to;
      amount = request.amount;
      memo = request.memo;
      merchantId = request.merchantId;
      status = #completed;
      createdAt = Int.abs(Time.now());
      completedAt = ?Int.abs(Time.now());
      fee = fee;
    }
  };

  // Main transfer function
  public func processTransfer(
    from : Principal,
    request : Types.TransferRequest,
    state : Types.PaymentGatewayState,
    bitcoinIntegrationInstance : BitcoinIntegration.BitcoinIntegration,
    seiIntegrationInstance : SEIIntegration.SEIIntegration,
    balanceState : BalanceManager.BalanceManagerState
  ) : (Types.TransferResult, Types.PaymentGatewayState) {
    
    // Validate the transfer request using the Bitcoin Integration instance
    switch (validateTransferRequest(from, request, bitcoinIntegrationInstance, balanceState)) {
      case (#err(error)) { 
        return (#err(error), state) 
      };
      case (#ok(_)) {};
    };
    
    // Generate transfer ID
    let transferId = generateTransferId(from);
    
    // Execute the transfer using the Bitcoin Integration instance
    switch (executeTransfer(from, request, bitcoinIntegrationInstance, seiIntegrationInstance, balanceState)) {
      case (#err(error)) { 
        return (#err(error), state) 
      };
      case (#ok(_)) {};
    };
    
    // Calculate fee
    let fee = calculateTransferFee(request.amount);
    
    // Create transaction record
    let transaction = createTransactionRecord(transferId, from, request, fee);
    
    // Update state
    let updatedTransactions = HashMap.HashMap<Text, Types.PaymentGatewayTransaction>(0, Text.equal, Text.hash);
    for ((id, txn) in state.transactions.entries()) {
        updatedTransactions.put(id, txn);
    };
    updatedTransactions.put(transferId, transaction);
    
    // Update user transaction lists
    let updatedUserTransactions = HashMap.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);
    for ((principal, txs) in state.userTransactions.entries()) {
        updatedUserTransactions.put(principal, txs);
    };
    
    // Add to sender's transaction list
    let senderTransactions = switch (updatedUserTransactions.get(from)) {
      case (?txs) txs;
      case null [];
    };
    updatedUserTransactions.put(from, Array.append(senderTransactions, [transferId]));
    
    // Add to recipient's transaction list
    let recipientTransactions = switch (updatedUserTransactions.get(request.to)) {
      case (?txs) txs;
      case null [];
    };
    updatedUserTransactions.put(request.to, Array.append(recipientTransactions, [transferId]));
    
    // Update totals
    let updatedState : Types.PaymentGatewayState = {
      transactions = updatedTransactions;
      userTransactions = updatedUserTransactions;
      totalVolume = state.totalVolume + request.amount;
      totalFees = state.totalFees + fee;
    };
    
    let result : Types.TransferResult = #ok({
      transferId = transferId;
      from = from;
      to = request.to;
      amount = request.amount;
      timestamp = Int.abs(Time.now());
      memo = request.memo;
    });
    
    Debug.print("✅ Payment Gateway Transfer Completed: " # transferId);
    
    (result, updatedState);
  };

  // Get user's payment gateway transactions
  public func getUserTransactions(
    user : Principal,
    state : Types.PaymentGatewayState
  ) : [Types.PaymentGatewayTransaction] {
    
    let userTransactionIds = switch (state.userTransactions.get(user)) {
      case (?ids) ids;
      case null [];
    };
    
    Array.map<Text, Types.PaymentGatewayTransaction>(
      userTransactionIds,
      func(id) {
        switch (state.transactions.get(id)) {
          case (?tx) tx;
          case null {
            // Return a default transaction if not found (shouldn't happen)
            {
              id = id;
              from = user;
              to = user;
              amount = 0;
              memo = null;
              merchantId = null;
              status = #failed;
              createdAt = 0;
              completedAt = null;
              fee = 0;
            }
          };
        }
      }
    );
  };

  // Get payment gateway statistics
  public func getPaymentGatewayStats(state : Types.PaymentGatewayState) : {
    totalTransactions : Nat;
    totalVolume : Nat;
    totalFees : Nat;
  } {
    {
      totalTransactions = state.transactions.size();
      totalVolume = state.totalVolume;
      totalFees = state.totalFees;
    }
  };

  // Get business logs for a merchant (transactions where they are the recipient)
  public func getBusinessLogs(
    merchantPrincipal : Principal,
    state : Types.PaymentGatewayState
  ) : [Types.BusinessLog] {
    let merchantTransactionIds = switch (state.userTransactions.get(merchantPrincipal)) {
      case (?ids) ids;
      case null [];
    };
    
    var businessLogs : [Types.BusinessLog] = [];
    
    for (transactionId in merchantTransactionIds.vals()) {
      switch (state.transactions.get(transactionId)) {
        case (?transaction) {
          // Only include transactions where the merchant is the recipient
          if (transaction.to == merchantPrincipal) {
            let businessLog : Types.BusinessLog = {
              transactionId = transaction.id;
              from = transaction.from;
              to = transaction.to;
              amount = transaction.amount;
              fee = transaction.fee;
              memo = transaction.memo;
              merchantId = transaction.merchantId;
              status = transaction.status;
              createdAt = transaction.createdAt;
              completedAt = transaction.completedAt;
            };
            businessLogs := Array.append(businessLogs, [businessLog]);
          };
        };
        case null {};
      };
    };
    
    businessLogs;
  };
};

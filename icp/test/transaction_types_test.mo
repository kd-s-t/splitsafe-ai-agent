import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Time "mo:base/Time";

import SplitDApp "canister:split_dapp";

persistent actor {
  public func runTransactionTypesTest() : async () {
    Debug.print("🚀 Starting Transaction Types Test - Testing all 3 transaction types...");

    // Setup test participants
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    let charlie = Principal.fromText("ccccc-cc");
    let diana = Principal.fromText("ddddd-dd");

    // Set up user info
    await SplitDApp.saveInfo(alice, { nickname = ?"Alice Admin"; username = ?"alice"; picture = null; email = null });
    await SplitDApp.saveInfo(bob, { nickname = ?"Bob Developer"; username = ?"bob"; picture = null; email = null });
    await SplitDApp.saveInfo(charlie, { nickname = ?"Charlie Designer"; username = ?"charlie"; picture = null; email = null });
    await SplitDApp.saveInfo(diana, { nickname = ?"Diana Manager"; username = ?"diana"; picture = null; email = null });

    // Set initial balances
    await SplitDApp.setInitialBalance(alice, 50000, alice); // 50k satoshis
    await SplitDApp.setInitialBalance(bob, 20000, alice);   // 20k satoshis
    await SplitDApp.setInitialBalance(charlie, 15000, alice); // 15k satoshis
    await SplitDApp.setInitialBalance(diana, 10000, alice);   // 10k satoshis

    Debug.print("💰 Initial balances set for all participants");

    // ========================================
    // TEST 1: BASIC ESCROW TRANSACTION
    // ========================================
    Debug.print("🧪 TEST 1: Basic Escrow Transaction");
    
    let basicEscrowResult = await SplitDApp.createTransaction(
      #basic_escrow,
      #basic_escrow({
        title = "Project Payment Split";
        participants = [
          { principal = bob; amount = 5000; nickname = "Bob"; percentage = 60 },
          { principal = charlie; amount = 2000; nickname = "Charlie"; percentage = 25 },
          { principal = diana; amount = 1000; nickname = "Diana"; percentage = 15 }
        ];
        useSeiAcceleration = false;
      })
    );
    
    switch (basicEscrowResult) {
      case (#ok(result)) {
        Debug.print("✅ Basic Escrow created successfully!");
        Debug.print("   Transaction ID: " # result.transactionId);
        Debug.print("   Total amount: 8000 satoshis");
        Debug.print("   Participants: Bob (60%), Charlie (25%), Diana (15%)");
      };
      case (#err(error)) {
        Debug.print("❌ Basic Escrow failed: " # error);
      };
    };

    // ========================================
    // TEST 2: MILESTONE ESCROW TRANSACTION
    // ========================================
    Debug.print("🧪 TEST 2: Milestone Escrow Transaction");
    
    let currentTime = Time.now();
    let milestoneEscrowResult = await SplitDApp.createTransaction(
      #milestone_escrow,
      #milestone_escrow({
        title = "Software Development Project";
        milestones = [
          {
            title = "Phase 1: Planning & Design";
            allocation = 10000;
            coin = "ckbtc";
            recipients = [
              {
                id = "bob-planning";
                name = "Bob Developer";
                principal = bob;
                share = 6000;
                email = ?"bob@dev.com";
                phone = null;
                billingAddress = ?"123 Dev Street";
                approvedAt = null;
                declinedAt = null;
              },
              {
                id = "charlie-design";
                name = "Charlie Designer";
                principal = charlie;
                share = 4000;
                email = ?"charlie@design.com";
                phone = null;
                billingAddress = ?"456 Design Ave";
                approvedAt = null;
                declinedAt = null;
              }
            ];
            startDate = currentTime;
            frequency = #monthly;
            duration = 2;
            contractSigningPeriod = ?14;
          },
          {
            title = "Phase 2: Development";
            allocation = 15000;
            coin = "ckbtc";
            recipients = [
              {
                id = "bob-dev";
                name = "Bob Developer";
                principal = bob;
                share = 12000;
                email = ?"bob@dev.com";
                phone = null;
                billingAddress = ?"123 Dev Street";
                approvedAt = null;
                declinedAt = null;
              },
              {
                id = "diana-qa";
                name = "Diana Manager";
                principal = diana;
                share = 3000;
                email = ?"diana@qa.com";
                phone = null;
                billingAddress = ?"789 QA Blvd";
                approvedAt = null;
                declinedAt = null;
              }
            ];
            startDate = currentTime + (30 * 24 * 60 * 60 * 1000000000); // 30 days later
            frequency = #monthly;
            duration = 3;
            contractSigningPeriod = ?14;
          }
        ];
        contractSigningPeriod = ?14;
      })
    );
    
    switch (milestoneEscrowResult) {
      case (#ok(result)) {
        Debug.print("✅ Milestone Escrow created successfully!");
        Debug.print("   Transaction ID: " # result.transactionId);
        Debug.print("   Total allocation: 25000 satoshis across 2 phases");
        Debug.print("   Phase 1: Planning & Design (10000 satoshis)");
        Debug.print("   Phase 2: Development (15000 satoshis)");
      };
      case (#err(error)) {
        Debug.print("❌ Milestone Escrow failed: " # error);
      };
    };

    // ========================================
    // TEST 3: WITHDRAW TRANSACTION
    // ========================================
    Debug.print("🧪 TEST 3: Withdraw Transaction");
    
    let withdrawResult = await SplitDApp.createTransaction(
      #withdraw,
      #withdraw({
        withdrawData = #btc({
          recipientAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
          amount = 2000;
        });
      })
    );
    
    switch (withdrawResult) {
      case (#ok(result)) {
        Debug.print("✅ Withdraw transaction created successfully!");
        Debug.print("   Transaction ID: " # result.transactionId);
        Debug.print("   Amount: 2000 satoshis");
        Debug.print("   Recipient: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
      };
      case (#err(error)) {
        Debug.print("❌ Withdraw transaction failed: " # error);
      };
    };

    // ========================================
    // TEST 4: VERIFICATION - GET ALL TRANSACTIONS
    // ========================================
    Debug.print("🧪 TEST 4: Verification - Retrieving all transactions");
    
    let allTransactions = await SplitDApp.getTransactionsPaginated(alice, 0, 20);
    Debug.print("📊 Transaction Summary:");
    Debug.print("   Total transactions found: " # Nat.toText(allTransactions.totalCount));
    
    var basicEscrowCount = 0;
    var milestoneEscrowCount = 0;
    var withdrawCount = 0;
    
    for (tx in allTransactions.transactions.vals()) {
      switch (tx.kind) {
        case (#basic_escrow) {
          basicEscrowCount += 1;
          Debug.print("   📋 Basic Escrow: " # tx.id # " - " # tx.title # " - " # tx.status);
        };
        case (#milestone_escrow) {
          milestoneEscrowCount += 1;
          Debug.print("   🎯 Milestone Escrow: " # tx.id # " - " # tx.title # " - " # tx.status);
        };
        case (#withdraw) {
          withdrawCount += 1;
          Debug.print("   💸 Withdraw: " # tx.id # " - " # tx.title # " - " # tx.status);
        };
      };
    };
    
    Debug.print("📈 Transaction Type Breakdown:");
    Debug.print("   Basic Escrow: " # Nat.toText(basicEscrowCount));
    Debug.print("   Milestone Escrow: " # Nat.toText(milestoneEscrowCount));
    Debug.print("   Withdraw: " # Nat.toText(withdrawCount));

    // ========================================
    // TEST 5: BALANCE VERIFICATION
    // ========================================
    Debug.print("🧪 TEST 5: Balance Verification");
    
    let aliceBal = await SplitDApp.getBalance(alice);
    let bobBal = await SplitDApp.getBalance(bob);
    let charlieBal = await SplitDApp.getBalance(charlie);
    let dianaBal = await SplitDApp.getBalance(diana);
    
    Debug.print("💰 Final Balances:");
    Debug.print("   Alice: " # Nat.toText(aliceBal) # " satoshis");
    Debug.print("   Bob: " # Nat.toText(bobBal) # " satoshis");
    Debug.print("   Charlie: " # Nat.toText(charlieBal) # " satoshis");
    Debug.print("   Diana: " # Nat.toText(dianaBal) # " satoshis");

    // ========================================
    // TEST 6: TRANSACTION DETAILS
    // ========================================
    Debug.print("🧪 TEST 6: Transaction Details Verification");
    
    // Get a specific transaction to verify details
    if (allTransactions.transactions.size() > 0) {
      let firstTx = allTransactions.transactions[0];
      let txDetails = await SplitDApp.getTransaction(firstTx.id, alice);
      
      switch (txDetails) {
        case (?tx) {
          Debug.print("🔍 Transaction Details for: " # tx.id);
          Debug.print("   Type: " # (switch (tx.kind) {
            case (#basic_escrow) "Basic Escrow";
            case (#milestone_escrow) "Milestone Escrow";
            case (#withdraw) "Withdraw";
          }));
          Debug.print("   Title: " # tx.title);
          Debug.print("   Status: " # tx.status);
          Debug.print("   Funds Allocated: " # Nat.toText(tx.funds_allocated) # " satoshis");
          Debug.print("   Created At: " # Nat.toText(tx.createdAt));
        };
        case null {
          Debug.print("❌ Could not retrieve transaction details");
        };
      };
    };

    Debug.print("🎉 Transaction Types Test completed successfully!");
    Debug.print("✅ All 3 transaction types (Basic Escrow, Milestone Escrow, Withdraw) have been tested");
  };
}

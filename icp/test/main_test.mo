import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";

import SplitDApp "canister:split_dapp";

persistent actor {
  public func run() : async () {
    Debug.print("🏁 Running SplitDApp main test with 3 transaction types...");

    // Prepare test participants
    let alice = Principal.fromText("2vxsx-fae"); // Anonymous principal
    let bob = Principal.fromText("rdmx6-jaaaa-aaaah-qcaiq-cai"); // Valid test principal
    let charlie = Principal.fromText("rrkah-fqaaa-aaaah-qcaiq-cai"); // Valid test principal

    // Set participant info
    await SplitDApp.saveInfo(alice, { nickname = ?"Alice"; username = ?"alice"; picture = null; email = null });
    await SplitDApp.saveInfo(bob, { nickname = ?"Bob"; username = ?"bob"; picture = null; email = null });
    await SplitDApp.saveInfo(charlie, { nickname = ?"Charlie"; username = ?"charlie"; picture = null; email = null });

    await SplitDApp.setInitialBalance(alice, 10000, alice);
    await SplitDApp.setInitialBalance(bob, 5000, alice);
    await SplitDApp.setInitialBalance(charlie, 3000, alice);

    // Test 1: Basic Escrow Transaction
    Debug.print("🧪 Test 1: Creating Basic Escrow Transaction...");
    
    let basicEscrowResult = await SplitDApp.createTransaction(
      alice,
      #basic_escrow,
      #basic_escrow({
        title = "Basic Escrow Test";
        participants = [
          { principal = bob; amount = 1000; nickname = "Bob"; percentage = 70 },
          { principal = charlie; amount = 300; nickname = "Charlie"; percentage = 30 }
        ];
        useSeiAcceleration = false;
      })
    );
    
    switch (basicEscrowResult) {
      case (#ok(result)) {
        Debug.print("✅ Basic Escrow created with ID: " # result.transactionId);
      };
      case (#err(error)) {
        Debug.print("❌ Basic Escrow failed: " # error);
      };
    };

    // Test 2: Milestone Escrow Transaction
    Debug.print("🧪 Test 2: Creating Milestone Escrow Transaction...");
    
    let currentTime = Int.abs(Time.now());
    let milestoneEscrowResult = await SplitDApp.initiateMultipleMilestones(
      alice,
      {
        title = "Milestone Escrow Test";
        milestones = [
          {
            title = "Phase 1: Design";
            allocation = 2000;
            coin = "ckbtc";
            recipients = [
              {
                id = "bob-1";
                name = "Bob Builder";
                principal = bob;
                share = 1400;
              },
              {
                id = "charlie-1";
                name = "Charlie Brown";
                principal = charlie;
                share = 600;
              }
            ];
            startDate = currentTime;
            frequency = #day(1);
            duration = 3;
            contractSigningPeriod = ?7;
            contractFile = null;
          }
        ];
        contractFile = null;
      }
    );
    
    switch (milestoneEscrowResult) {
      case (#ok(result)) {
        Debug.print("✅ Milestone Escrow created with ID: " # result.transactionId);
      };
      case (#err(error)) {
        Debug.print("❌ Milestone Escrow failed: " # error);
      };
    };

    // Test 3: Withdraw Transaction
    Debug.print("🧪 Test 3: Creating Withdraw Transaction...");
    
    let withdrawResult = await SplitDApp.createTransaction(
      alice,
      #withdraw,
      #withdraw({
        withdrawData = #btc({
          recipientAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
          amount = 500;
        });
      })
    );
    
    switch (withdrawResult) {
      case (#ok(result)) {
        Debug.print("✅ Withdraw transaction created with ID: " # result.transactionId);
      };
      case (#err(error)) {
        Debug.print("❌ Withdraw transaction failed: " # error);
      };
    };

    // Test 4: Get all transactions for Alice
    Debug.print("🧪 Test 4: Retrieving all transactions...");
    let transactions = await SplitDApp.getTransactionsPaginated(alice, 0, 10);
    Debug.print("Total transactions found: " # Nat.toText(transactions.totalCount));
    
    for (tx in transactions.transactions.vals()) {
      Debug.print("Transaction: " # tx.id # " - Type: " # (switch (tx.kind) {
        case (#basic_escrow) "Basic Escrow";
        case (#milestone_escrow) "Milestone Escrow";
        case (#withdraw) "Withdraw";
      }) # " - Status: " # tx.status);
    };

    // Test 5: Check balances
    let aliceBal = await SplitDApp.getBalance(alice);
    let bobBal = await SplitDApp.getBalance(bob);
    let charlieBal = await SplitDApp.getBalance(charlie);
    Debug.print("Final Balances:");
    Debug.print("Alice: " # Nat.toText(aliceBal));
    Debug.print("Bob: " # Nat.toText(bobBal));
    Debug.print("Charlie: " # Nat.toText(charlieBal));
    
    Debug.print("🎉 Comprehensive test with 3 transaction types completed!");
  };
}


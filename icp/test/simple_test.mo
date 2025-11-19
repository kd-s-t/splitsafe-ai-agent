import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import _Text "mo:base/Text";
import Array "mo:base/Array";

import SplitDApp "canister:split_dapp";

persistent actor {
  public func runSimpleTests() : async () {
    Debug.print("🧪 Starting simple SplitSafe tests...");
    
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    
    // Test 1: Basic Setup
    Debug.print("📋 Test 1: Basic Setup");
    await SplitDApp.saveInfo(alice, { nickname = ?"Alice"; username = ?"alice"; picture = null; email = null });
    await SplitDApp.saveInfo(bob, { nickname = ?"Bob"; username = ?"bob"; picture = null; email = null });
    await SplitDApp.setInitialBalance(alice, 1000, alice);
    await SplitDApp.setInitialBalance(bob, 500, alice);
    
    let aliceBal = await SplitDApp.getBalance(alice);
    let bobBal = await SplitDApp.getBalance(bob);
    Debug.print("Alice balance: " # Nat.toText(aliceBal));
    Debug.print("Bob balance: " # Nat.toText(bobBal));
    
    // Test 2: Create 3 Types of Transactions
    Debug.print("📋 Test 2: Creating 3 Types of Transactions");
    
    // 2a: Basic Escrow Transaction
    Debug.print("📋 Test 2a: Basic Escrow Transaction");
    let basicEscrowResult = await SplitDApp.createTransaction(
      #basic_escrow,
      #basic_escrow({
        title = "Simple Basic Escrow";
        participants = [
          { principal = bob; amount = 100; nickname = "Bob"; percentage = 100 }
        ];
        useSeiAcceleration = false;
      })
    );
    
    switch (basicEscrowResult) {
      case (#ok(result)) {
        Debug.print("✅ Basic Escrow created: " # result.transactionId);
      };
      case (#err(error)) {
        Debug.print("❌ Basic Escrow failed: " # error);
      };
    };
    
    // 2b: Milestone Escrow Transaction
    Debug.print("📋 Test 2b: Milestone Escrow Transaction");
    let milestoneEscrowResult = await SplitDApp.createTransaction(
      #milestone_escrow,
      #milestone_escrow({
        title = "Simple Milestone Escrow";
        milestones = [
          {
            title = "Simple Phase";
            allocation = 200;
            coin = "ckbtc";
            recipients = [
              {
                id = "bob-milestone";
                name = "Bob Builder";
                principal = bob;
                share = 200;
                email = ?"bob@example.com";
                phone = null;
                billingAddress = null;
                approvedAt = null;
                declinedAt = null;
              }
            ];
            startDate = 0;
            frequency = #monthly;
            duration = 1;
            contractSigningPeriod = ?7;
          }
        ];
        contractSigningPeriod = ?7;
      })
    );
    
    switch (milestoneEscrowResult) {
      case (#ok(result)) {
        Debug.print("✅ Milestone Escrow created: " # result.transactionId);
      };
      case (#err(error)) {
        Debug.print("❌ Milestone Escrow failed: " # error);
      };
    };
    
    // 2c: Withdraw Transaction
    Debug.print("📋 Test 2c: Withdraw Transaction");
    let withdrawResult = await SplitDApp.createTransaction(
      #withdraw,
      #withdraw({
        withdrawData = #icp({
          recipientAddress = "aaaaa-aa";
          amount = 50;
        });
      })
    );
    
    switch (withdrawResult) {
      case (#ok(result)) {
        Debug.print("✅ Withdraw transaction created: " # result.transactionId);
      };
      case (#err(error)) {
        Debug.print("❌ Withdraw transaction failed: " # error);
      };
    };
    
    // Test 3: Transaction History
    Debug.print("📋 Test 3: Transaction History");
    let transactions = await SplitDApp.getTransactionsPaginated(alice, 0, 10);
    Debug.print("Total transactions found: " # Nat.toText(transactions.totalCount));
    
    for (tx in transactions.transactions.vals()) {
      Debug.print("Transaction: " # tx.id # " - Type: " # (switch (tx.kind) {
        case (#basic_escrow) "Basic Escrow";
        case (#milestone_escrow) "Milestone Escrow";
        case (#withdraw) "Withdraw";
      }) # " - Status: " # tx.status);
    };
    
    // Test 4: Balance Verification
    Debug.print("📋 Test 4: Final Balance Verification");
    let finalAliceBal = await SplitDApp.getBalance(alice);
    let finalBobBal = await SplitDApp.getBalance(bob);
    Debug.print("Final Alice balance: " # Nat.toText(finalAliceBal));
    Debug.print("Final Bob balance: " # Nat.toText(finalBobBal));
    
    Debug.print("🎉 All simple tests completed!");
  };
};

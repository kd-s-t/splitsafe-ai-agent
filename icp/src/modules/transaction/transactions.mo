import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import TransactionTypes "./schema";
import TimeUtil "../../utils/time";
import Balance "../../utils/balance";

module {
    public func getTransactionsPaginated(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        balances : HashMap.HashMap<Principal, Nat>,
        user : Principal,
        page : Nat,
        pageSize : Nat
    ) : {
        transactions : [TransactionTypes.Transaction];
        totalCount : Nat;
        totalPages : Nat;
    } {
        // Check for expired transactions first
        checkAndUpdateExpiredTransactions(transactions, balances);
        
        var allTxs : [TransactionTypes.Transaction] = [];

        // Get transactions where user is the sender
        let sentTxs = switch (transactions.get(user)) { 
            case (?txs) txs; 
            case null [] 
        };
        allTxs := Array.append(allTxs, sentTxs);

        // Get transactions where user is a recipient (but not already included as sender)
        for ((sender, txs) in transactions.entries()) {
            // Skip if this is the user's own transactions (already included above)
            if (sender != user) {
                for (tx in txs.vals()) {
                    var isRecipient = false;
                    
                    // Check if user is in basic escrow recipients list
                    switch (tx.basicData) {
                        case (?basicData) {
                            for (toEntry in basicData.to.vals()) {
                                if (toEntry.principal == user) {
                                    isRecipient := true;
                                };
                            };
                        };
                        case null {};
                    };
                    
                    // Check if user is in any milestone recipients list
                    if (not isRecipient) {
                        for (milestone in tx.milestoneData.milestones.vals()) {
                            for (recipient in milestone.recipients.vals()) {
                                if (recipient.principal == user) {
                                    isRecipient := true;
                                };
                            };
                        };
                    };
                    
                    if (isRecipient) {
                        allTxs := Array.append(allTxs, [tx]);
                    };
                };
            };
        };

        let totalCount = allTxs.size();
        let totalPages = if (pageSize == 0) { 0 } else {
            (totalCount + pageSize - 1) / pageSize : Nat;
        }; // Ceiling division
        let startIndex = page * pageSize;
        let endIndex = Nat.min(startIndex + pageSize, totalCount);

        let paginatedTxs = if (startIndex < totalCount) {
            Array.tabulate<TransactionTypes.Transaction>(
                endIndex - startIndex,
                func(i) { allTxs[startIndex + i] },
            );
        } else { [] };

        {
            transactions = paginatedTxs;
            totalCount = totalCount;
            totalPages = totalPages;
        };
    };

    public func getTransaction(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        id : Text,
        caller : Principal
    ) : ?TransactionTypes.Transaction {
        Debug.print("🔍 [GET_TRANSACTION] Searching for transaction ID: " # id);
        Debug.print("🔍 [GET_TRANSACTION] Caller: " # Principal.toText(caller));
        Debug.print("🔍 [GET_TRANSACTION] Total transaction entries: " # Nat.toText(transactions.size()));
        
        // Search through all transactions to find the one with matching ID
        for ((sender, txs) in transactions.entries()) {
            Debug.print("🔍 [GET_TRANSACTION] Checking sender: " # Principal.toText(sender) # " with " # Nat.toText(Array.size(txs)) # " transactions");
            for (tx in txs.vals()) {
                if (tx.id == id) {
                    Debug.print("🔍 [GET_TRANSACTION] Found transaction with matching ID: " # tx.id);
                    Debug.print("🔍 [GET_TRANSACTION] Transaction from: " # Principal.toText(tx.from));
                    Debug.print("🔍 [GET_TRANSACTION] Transaction status: " # tx.status);
                    
                    // Check if caller is the owner
                    if (tx.from == caller) {
                        Debug.print("✅ [GET_TRANSACTION] Caller is the owner, returning transaction");
                        Debug.print("🔍 [GET_TRANSACTION] Transaction size check - ID: " # tx.id);
                        Debug.print("🔍 [GET_TRANSACTION] Transaction has milestoneData: " # (if (tx.milestoneData.milestones.size() > 0) "yes" else "no"));
                        return ?tx;
                    };
                    
                    // Check if caller is a recipient in basic escrow data
                    switch (tx.basicData) {
                        case (?basicData) {
                            for (entry in basicData.to.vals()) {
                                if (entry.principal == caller) {
                                    Debug.print("✅ [GET_TRANSACTION] Caller is a basic escrow recipient, returning transaction");
                                    return ?tx; // Recipient has full access
                                };
                            };
                        };
                        case null {};
                    };
                    
                    // Check if caller is a recipient in milestone data
                    for (milestone in tx.milestoneData.milestones.vals()) {
                        for (recipient in milestone.recipients.vals()) {
                            if (recipient.principal == caller) {
                                Debug.print("✅ [GET_TRANSACTION] Caller is a milestone recipient, returning transaction");
                                Debug.print("🔍 [GET_TRANSACTION] Transaction size check - ID: " # tx.id);
                                Debug.print("🔍 [GET_TRANSACTION] Transaction has milestoneData: " # (if (tx.milestoneData.milestones.size() > 0) "yes" else "no"));
                                return ?tx; // Recipient has full access
                            };
                        };
                    };
                    
                    Debug.print("❌ [GET_TRANSACTION] Transaction found but caller not authorized");
                };
            };
        };
        Debug.print("❌ [GET_TRANSACTION] Transaction not found: " # id);
        return null; // Transaction not found or caller not authorized
    };


    public func checkAndUpdateExpiredTransactions(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        balances : HashMap.HashMap<Principal, Nat>
    ) {
        let currentTime = TimeUtil.now();
        let expiryWindow = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds
        
        for ((sender, txs) in transactions.entries()) {
            let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                txs,
                func(tx) {
                    // Skip auto-cancellation for milestone escrows - they should persist until manually cancelled
                    if (tx.status == "pending" and currentTime > tx.createdAt and ((currentTime - tx.createdAt) : Nat) > expiryWindow and tx.kind != #milestone_escrow) {
                        // Check for recipients who haven't responded
                        let recipients = switch (tx.basicData) {
                            case (?basicData) basicData.to;
                            case null [];
                        };
                        let updatedTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
                            recipients,
                            func(entry) {
                                if (entry.status == #pending) {
                                    {
                                        principal = entry.principal;
                                        name = entry.name;
                                        funds_allocated = entry.funds_allocated;
                                        percentage = entry.percentage;
                                        status = #noaction;
                                        approvedAt = entry.approvedAt;
                                        declinedAt = entry.declinedAt;
                                        readAt = entry.readAt;
                                    }
                                } else {
                                    entry
                                }
                            }
                        );
                        
                        // Calculate total amount to refund (all noaction amounts)
                        let totalRefund = Array.foldLeft<TransactionTypes.ToEntry, Nat>(
                            updatedTo,
                            0,
                            func(acc, entry) {
                                if (entry.status == #noaction) {
                                    acc + entry.funds_allocated
                                } else {
                                    acc
                                }
                            }
                        );
                        
                        // Refund the sender for expired amounts
                        if (totalRefund > 0) {
                            Balance.increaseBalance(balances, sender, totalRefund);
                        };
                        
                        {
                            id = tx.id;
                            kind = tx.kind;
                            from = tx.from;
                            funds_allocated = tx.funds_allocated;
                            readAt = tx.readAt;
                            status = "cancelled";
                            title = tx.title;
                            createdAt = tx.createdAt;
                            confirmedAt = tx.confirmedAt;
                            cancelledAt = ?currentTime;
                            refundedAt = ?currentTime;
                            releasedAt = tx.releasedAt;
                            chatId = tx.chatId;
                            constellationHashes = tx.constellationHashes;
                            // Preserve Story Protocol tracking fields
                            storyIpAssetId = tx.storyIpAssetId;
                            storyTxs = tx.storyTxs;
                            milestoneData = tx.milestoneData;
                            basicData = tx.basicData;
                            withdrawData = tx.withdrawData;
                        }
                    } else {
                        tx
                    }
                }
            );
            transactions.put(sender, updated);
        };
    };

    public func markTransactionsAsRead(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        user : Principal
    ) {
        switch (transactions.get(user)) {
            case (?txs) {
                let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                    txs,
                    func(tx) {
                        {
                            id = tx.id;
                            kind = tx.kind;
                            from = tx.from;
                            funds_allocated = tx.funds_allocated;
                            readAt = ?TimeUtil.now();
                            status = tx.status;
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
                        }
                    },
                );
                transactions.put(user, updated);
            };
            case null { };
        };
    };

}; 
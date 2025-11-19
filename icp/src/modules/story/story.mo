import TransactionTypes "../transaction/schema";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";

module {
  // Record Story registration (ipAssetId + initial tx)
  public func storeStoryRegistration(
    escrowId : Text,
    ipAssetId : Text,
    txHash : Text,
    txMap : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>
  ) : { #ok : { owner : Principal; updated : [TransactionTypes.Transaction] }; #err : Text } {
    let entry = {
      action = "register";
      txHash = txHash;
      timestamp = Int.abs(Time.now());
    };

    var foundOwner : ?Principal = null;
    var updatedList : [TransactionTypes.Transaction] = [];

    for ((owner, txs) in txMap.entries()) {
      var idxOpt : ?Nat = null;
      var i : Nat = 0;
      while (i < txs.size() and idxOpt == null) {
        if (txs[i].id == escrowId) { idxOpt := ?i } else { i += 1 };
      };
      switch (idxOpt) {
        case (?idx) {
          let newList = Array.tabulate<TransactionTypes.Transaction>(
            txs.size(),
            func (j : Nat) : TransactionTypes.Transaction {
              if (j == idx) {
                let tx = txs[j];
                {
                  id = tx.id;
                  kind = tx.kind;
                  from = tx.from;
                  funds_allocated = tx.funds_allocated;
                  readAt = tx.readAt;
                  status = tx.status;
                  title = tx.title;
                  createdAt = tx.createdAt;
                  confirmedAt = tx.confirmedAt;
                  cancelledAt = tx.cancelledAt;
                  refundedAt = tx.refundedAt;
                  releasedAt = tx.releasedAt;
                  chatId = tx.chatId;
                  constellationHashes = tx.constellationHashes;
                  storyIpAssetId = ?ipAssetId;
                  storyTxs = Array.append(tx.storyTxs, [entry]);
                  milestoneData = tx.milestoneData;
                  basicData = tx.basicData;
                  withdrawData = tx.withdrawData;
                }
              } else { txs[j] }
            }
          );
          foundOwner := ?owner;
          updatedList := newList;
        };
        case null {};
      };
    };

    switch (foundOwner) {
      case (?owner) { #ok({ owner = owner; updated = updatedList }) };
      case null { #err("Transaction not found: " # escrowId) };
    }
  };

  // Append a Story attest tx (approve/release/cancel/refund/other)
  public func storeStoryTx(
    escrowId : Text,
    action : Text,
    txHash : Text,
    txMap : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>
  ) : { #ok : { owner : Principal; updated : [TransactionTypes.Transaction] }; #err : Text } {
    let entry = {
      action = action;
      txHash = txHash;
      timestamp = Int.abs(Time.now());
    };

    var foundOwner : ?Principal = null;
    var updatedList : [TransactionTypes.Transaction] = [];

    for ((owner, txs) in txMap.entries()) {
      var idxOpt : ?Nat = null;
      var i : Nat = 0;
      while (i < txs.size() and idxOpt == null) {
        if (txs[i].id == escrowId) { idxOpt := ?i } else { i += 1 };
      };
      switch (idxOpt) {
        case (?idx) {
          let newList = Array.tabulate<TransactionTypes.Transaction>(
            txs.size(),
            func (j : Nat) : TransactionTypes.Transaction {
              if (j == idx) {
                let tx = txs[j];
                {
                  id = tx.id;
                  kind = tx.kind;
                  from = tx.from;
                  funds_allocated = tx.funds_allocated;
                  readAt = tx.readAt;
                  status = tx.status;
                  title = tx.title;
                  createdAt = tx.createdAt;
                  confirmedAt = tx.confirmedAt;
                  cancelledAt = tx.cancelledAt;
                  refundedAt = tx.refundedAt;
                  releasedAt = tx.releasedAt;
                  chatId = tx.chatId;
                  constellationHashes = tx.constellationHashes;
                  storyIpAssetId = tx.storyIpAssetId;
                  storyTxs = Array.append(tx.storyTxs, [entry]);
                  milestoneData = tx.milestoneData;
                  basicData = tx.basicData;
                  withdrawData = tx.withdrawData;
                }
              } else { txs[j] }
            }
          );
          foundOwner := ?owner;
          updatedList := newList;
        };
        case null {};
      };
    };

    switch (foundOwner) {
      case (?owner) { #ok({ owner = owner; updated = updatedList }) };
      case null { #err("Transaction not found: " # escrowId) };
    }
  };
}



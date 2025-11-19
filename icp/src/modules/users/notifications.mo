import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

import TransactionTypes "../transaction/schema";

module {
  public type NotificationState = {
    transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>;
  };

  public func getUnreadCount(
    caller : Principal,
    state : NotificationState
  ) : Nat {
    let userTransactions = switch (state.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    var unreadCount : Nat = 0;

    for (tx in userTransactions.vals()) {
      let recipients = switch (tx.basicData) {
        case (?basicData) basicData.to;
        case null [];
      };
      for (recipient in recipients.vals()) {
        if (recipient.principal == caller) {
          let isUnread = switch (recipient.readAt) {
            case null true;
            case (?_) false;
          };

          if (isUnread) {
            unreadCount += 1;
          };
        };
      };
    };

    unreadCount;
  };
};

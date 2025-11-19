import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";

import Reputation "reputation";

module {
  public type ReputationManagerState = {
    reputation : HashMap.HashMap<Principal, Nat>;
    fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>;
  };

  public type ReputationStats = {
    reputation : Nat;
    isFlagged : Bool;
    canCreateEscrow : Bool;
    fraudCount : Nat;
  };

  public func getReputationStats(
    user : Principal,
    state : ReputationManagerState
  ) : ReputationStats {
    let userRep = Reputation.getUserReputation(state.reputation, user);
    let isFlagged = Reputation.detectFraudPattern(state.fraudHistory, user);
    let canCreate = Reputation.canCreateEscrow(state.reputation, state.fraudHistory, user);
    let fraudHistoryList = switch (state.fraudHistory.get(user)) {
      case (?history) history;
      case null [];
    };

    {
      reputation = userRep;
      isFlagged = isFlagged;
      canCreateEscrow = canCreate;
      fraudCount = fraudHistoryList.size();
    };
  };

  public func getUserReputationScore(
    user : Principal,
    state : ReputationManagerState
  ) : Nat {
    Reputation.getUserReputation(state.reputation, user);
  };

  public func isUserFlaggedForFraud(
    user : Principal,
    state : ReputationManagerState
  ) : Bool {
    Reputation.detectFraudPattern(state.fraudHistory, user);
  };

  public func canUserCreateEscrow(
    user : Principal,
    state : ReputationManagerState
  ) : Bool {
    Reputation.canCreateEscrow(state.reputation, state.fraudHistory, user);
  };

  public func getFraudHistory(
    user : Principal,
    state : ReputationManagerState
  ) : [Reputation.FraudActivity] {
    switch (state.fraudHistory.get(user)) {
      case (?history) history;
      case null [];
    };
  };
};

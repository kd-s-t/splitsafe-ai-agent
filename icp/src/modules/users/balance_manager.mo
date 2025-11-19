import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

import _Types "schema";
import Balance "../../utils/balance";
import Admin "../../utils/admin";

module {
  public type BalanceManagerState = {
    balances : HashMap.HashMap<Principal, Nat>;
    bitcoinBalances : HashMap.HashMap<Principal, Nat>;
    seiBalances : HashMap.HashMap<Principal, Nat>;
    userBitcoinAddresses : HashMap.HashMap<Principal, Text>;
    userSeiAddresses : HashMap.HashMap<Principal, Text>;
  };

  public func setBitcoinAddress(
    caller : Principal,
    address : Text,
    state : BalanceManagerState
  ) : (Bool, BalanceManagerState) {
    if (address.size() < 26 or address.size() > 90) {
      return (false, state);
    };

    if (not (Text.startsWith(address, #text "1") or Text.startsWith(address, #text "3") or Text.startsWith(address, #text "bc1"))) {
      return (false, state);
    };

    state.userBitcoinAddresses.put(caller, address);
    (true, state);
  };

  public func getBitcoinAddress(
    user : Principal,
    state : BalanceManagerState
  ) : ?Text {
    state.userBitcoinAddresses.get(user);
  };

  public func removeBitcoinAddress(
    caller : Principal,
    state : BalanceManagerState
  ) : (Bool, BalanceManagerState) {
    switch (state.userBitcoinAddresses.get(caller)) {
      case (?_address) {
        state.userBitcoinAddresses.delete(caller);
        (true, state);
      };
      case null (false, state);
    };
  };

  public func setSeiAddress(
    caller : Principal,
    address : Text,
    state : BalanceManagerState
  ) : (Bool, BalanceManagerState) {
    if (address.size() < 26 or address.size() > 90) {
      return (false, state);
    };

    if (not (Text.startsWith(address, #text "sei1"))) {
      return (false, state);
    };

    state.userSeiAddresses.put(caller, address);
    (true, state);
  };

  public func getSeiAddress(
    user : Principal,
    state : BalanceManagerState
  ) : ?Text {
    state.userSeiAddresses.get(user);
  };

  public func removeSeiAddress(
    caller : Principal,
    state : BalanceManagerState
  ) : (Bool, BalanceManagerState) {
    switch (state.userSeiAddresses.get(caller)) {
      case (?_address) {
        state.userSeiAddresses.delete(caller);
        (true, state);
      };
      case null (false, state);
    };
  };

  public func setBitcoinBalance(
    caller : Principal,
    user : Principal,
    amount : Nat,
    admin : Principal,
    state : BalanceManagerState
  ) : (Bool, BalanceManagerState) {
    if (caller == admin) {
      state.bitcoinBalances.put(user, amount);
      (true, state);
    } else {
      (false, state);
    };
  };

  public func getUserBitcoinBalance(
    user : Principal,
    state : BalanceManagerState
  ) : Nat {
    switch (state.bitcoinBalances.get(user)) {
      case (?balance) balance;
      case null 0;
    };
  };

  public func addBitcoinBalance(
    caller : Principal,
    user : Principal,
    amount : Nat,
    admin : Principal,
    state : BalanceManagerState
  ) : (Bool, BalanceManagerState) {
    if (caller == admin) {
      let currentBalance = switch (state.bitcoinBalances.get(user)) {
        case (?balance) balance;
        case null 0;
      };
      let newBalance = currentBalance + amount;
      state.bitcoinBalances.put(user, newBalance);
      (true, state);
    } else {
      (false, state);
    };
  };


  public func getUserSeiBalance(
    user : Principal,
    state : BalanceManagerState
  ) : Nat {
    switch (state.seiBalances.get(user)) {
      case (?balance) balance;
      case null 0;
    };
  };


  public func getBalance(
    user : Principal,
    state : BalanceManagerState
  ) : Nat {
    Balance.getBalance(state.balances, user);
  };

  public func setInitialBalance(
    caller : Principal,
    user : Principal,
    amount : Nat,
    admin : Principal,
    state : BalanceManagerState
  ) : (Bool, BalanceManagerState) {
    let success = Admin.setInitialBalance(state.balances, admin, caller, user, amount);
    (success, state);
  };
};

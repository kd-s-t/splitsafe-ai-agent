import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Array "mo:base/Array";

import _Types "schema";
import Balance "../../utils/balance";

module {
  public type ConversionResult = {
    success : Bool;
    error : ?Text;
    newLogs : [Text];
  };

  public type ConversionState = {
    balances : HashMap.HashMap<Principal, Nat>;
    bitcoinBalances : HashMap.HashMap<Principal, Nat>;
    seiBalances : HashMap.HashMap<Principal, Nat>;
    logs : [Text];
  };

  private func getBtcToIcpRate() : Nat {
    15_000_000_000; // 1 BTC = 15,000 ICP (15,000 * 100,000,000 e8s)
  };

  private func calculateConversionFee(amount : Nat) : Nat {
    amount / 1000;
  };

  public func convertIcpToBitcoin(
    _caller : Principal,
    user : Principal,
    icpAmount : Nat,
    state : ConversionState
  ) : (Bool, ConversionState) {
    let currentIcpBalance = Balance.getBalance(state.balances, user);

    if (currentIcpBalance < icpAmount) {
      return (false, state);
    };

    let bitcoinSatoshis = if (icpAmount >= 100_000_000) {
      icpAmount / 100_000_000;
    } else { 0 };

    let newIcpBalance : Nat = currentIcpBalance - icpAmount;
    state.balances.put(user, newIcpBalance);

    let currentBitcoinBalance = switch (state.bitcoinBalances.get(user)) {
      case (?balance) balance;
      case null 0;
    };
    state.bitcoinBalances.put(user, currentBitcoinBalance + bitcoinSatoshis);

    (true, state);
  };

  public func convertCkBtcToIcp(
    _caller : Principal,
    user : Principal,
    ckbtcAmount : Nat,
    state : ConversionState
  ) : (Bool, ConversionState) {
    let currentCkBtcBalance = switch (state.bitcoinBalances.get(user)) {
      case (?balance) balance;
      case null 0;
    };

    if (currentCkBtcBalance < ckbtcAmount) {
      return (false, state);
    };

    let exchangeRate = getBtcToIcpRate();
    let grossIcpE8s = ckbtcAmount * exchangeRate;
    let conversionFee = calculateConversionFee(grossIcpE8s);
    let netIcpE8s = if (grossIcpE8s >= conversionFee) {
      Nat.sub(grossIcpE8s, conversionFee);
    } else {
      0;
    };

    let newCkBtcBalance : Nat = currentCkBtcBalance - ckbtcAmount;
    state.bitcoinBalances.put(user, newCkBtcBalance);

    let currentIcpBalance = Balance.getBalance(state.balances, user);
    let newIcpBalance = currentIcpBalance + netIcpE8s;
    state.balances.put(user, newIcpBalance);

    let conversionLog = "Converted " # Nat.toText(ckbtcAmount) # " ckBTC satoshis to " # Nat.toText(netIcpE8s) # " ICP e8s (fee: " # Nat.toText(conversionFee) # " ICP e8s)";
    let newLogs = Array.append(state.logs, [conversionLog]);

    let updatedState = {
      balances = state.balances;
      bitcoinBalances = state.bitcoinBalances;
      seiBalances = state.seiBalances;
      logs = newLogs;
    };

    (true, updatedState);
  };

  public func convertIcpToSei(
    _caller : Principal,
    user : Principal,
    icpAmount : Nat,
    state : ConversionState
  ) : (Bool, ConversionState) {
    let currentIcpBalance = Balance.getBalance(state.balances, user);

    if (currentIcpBalance < icpAmount) {
      return (false, state);
    };

    let seiUsei = if (icpAmount >= 10_000_000) { icpAmount / 10_000_000 } else {
      0;
    };

    let newIcpBalance : Nat = currentIcpBalance - icpAmount;
    state.balances.put(user, newIcpBalance);

    let currentSeiBalance = switch (state.seiBalances.get(user)) {
      case (?balance) balance;
      case null 0;
    };
    state.seiBalances.put(user, currentSeiBalance + seiUsei);

    (true, state);
  };
};

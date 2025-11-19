import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import TransactionTypes "../transaction/schema";

module {
  public type WithdrawalResult = {
    #ok : Text;
    #err : Text;
  };

  public type WithdrawalState = {
    balances : HashMap.HashMap<Principal, Nat>;
    bitcoinBalances : HashMap.HashMap<Principal, Nat>;
    transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>;
    userBitcoinAddresses : HashMap.HashMap<Principal, Text>;
    logs : [Text];
  };
};
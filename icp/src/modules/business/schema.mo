import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";

module {
  
  // Business log entry for analytics
  public type BusinessLogEntry = {
    id : Text;
    timestamp : Nat;
    eventType : Text; // "payment_gateway_transfer", "escrow_created", etc.
    userId : Principal;
    amount : Nat;
    currency : Text; // "BTC", "SEI", etc.
    merchantId : ?Text;
    memo : ?Text;
    fee : Nat;
    network : Text; // "bitcoin", "sei", etc.
    status : Text; // "success", "failed", etc.
    metadata : Text; // JSON string for additional data
  };

  // Business analytics state
  public type BusinessState = {
    logs : HashMap.HashMap<Text, BusinessLogEntry>;
    userLogs : HashMap.HashMap<Principal, [Text]>; // User -> [Log IDs]
    merchantLogs : HashMap.HashMap<Text, [Text]>; // Merchant ID -> [Log IDs]
    totalVolume : Nat;
    totalTransactions : Nat;
    totalFees : Nat;
  };

  // Business analytics summary
  public type BusinessAnalytics = {
    totalLogs : Nat;
    totalVolume : Nat;
    totalTransactions : Nat;
    totalFees : Nat;
    uniqueUsers : Nat;
    uniqueMerchants : Nat;
  };
};

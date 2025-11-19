import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";

module {
  // Payment Gateway Transfer Types
  public type TransferRequest = {
    to : Principal;
    amount : Nat;
    memo : ?Text;
    merchantId : ?Text; // Optional merchant identifier (e.g., "cebu_pacific")
    useSeiAcceleration : Bool; // Enable SEI network acceleration
  };

  public type TransferResult = {
    #ok : {
      transferId : Text;
      from : Principal;
      to : Principal;
      amount : Nat;
      timestamp : Nat;
      memo : ?Text;
    };
    #err : Text;
  };

  // Payment Gateway Transaction Types
  public type PaymentGatewayTransaction = {
    id : Text;
    from : Principal;
    to : Principal;
    amount : Nat;
    memo : ?Text;
    merchantId : ?Text;
    status : PaymentStatus;
    createdAt : Nat;
    completedAt : ?Nat;
    fee : Nat;
  };

  public type PaymentStatus = {
    #pending;
    #completed;
    #failed;
    #cancelled;
  };

  // Business Log Types
  public type BusinessLog = {
    transactionId : Text;
    from : Principal;
    to : Principal;
    amount : Nat;
    fee : Nat;
    memo : ?Text;
    merchantId : ?Text;
    status : PaymentStatus;
    createdAt : Nat;
    completedAt : ?Nat;
  };

  // Payment Gateway State
  public type PaymentGatewayState = {
    transactions : HashMap.HashMap<Text, PaymentGatewayTransaction>;
    userTransactions : HashMap.HashMap<Principal, [Text]>; // Principal -> [Transaction IDs]
    totalVolume : Nat;
    totalFees : Nat;
  };
};

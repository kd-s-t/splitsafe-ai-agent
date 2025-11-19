import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

module {
  public type ParticipantShare = {
    principal : Principal;
    amount : Nat;
    nickname : Text;
    percentage : Nat;
  };


  public type BasicEscrowResult = {
    #ok : { escrowId : Text };
    #err : Text;
  };
};

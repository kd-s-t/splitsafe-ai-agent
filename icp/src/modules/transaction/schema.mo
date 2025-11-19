import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import MilestoneTypes "../escrow_milestone/schema";

module {
  public type TransactionKind = {
    #milestone_escrow;
    #basic_escrow;
    #withdraw;
    #payment_gateway;
  };

  // Common transaction fields
  public type ToEntry = {
    principal : Principal;
    name : Text;
    funds_allocated : Nat;
    percentage : Nat;
    status : { #pending; #approved; #declined; #noaction };
    approvedAt : ?Nat;
    declinedAt : ?Nat;
    readAt : ?Nat;
  };

  public type TransactionStatus = Text;

  public type ParticipantShare = {
    principal : Principal;
    amount : Nat;
    nickname : Text;
    percentage : Nat;
  };

  // Milestone escrow data
  public type MilestoneEscrowData = {
    milestones : [MilestoneTypes.Milestone];
    contractSigningDateBefore : ?Nat;
    contractFileId : ?Text; // File ID for the contract file (stored separately)
    clientApprovedSignedAt : ?Nat; // When client approved the signed contract
    recipients: [MilestoneTypes.MilestoneEscrowRecipient]
  };

  // Basic escrow data
  public type BasicEscrowData = {
    to : [ToEntry];
    useSeiAcceleration : Bool;
  };

  // Withdraw data
  public type WithdrawData = {
    #icp : {
      recipientAddress : Text;
      amount : Nat;
    };
    #btc : {
      recipientAddress : Text;
      amount : Nat;
    };
  };

  public type ConstellationHashEntry = {
    action : Text;
    hash : Text;
    timestamp : Nat;
  };

  // Unified transaction type
  public type Transaction = {
    id : Text;
    kind : TransactionKind;
    from : Principal;
    funds_allocated : Nat; // Total transaction amount
    readAt : ?Nat;
    status : TransactionStatus;
    title : Text;
    createdAt : Nat;
    confirmedAt : ?Nat;
    cancelledAt : ?Nat;
    refundedAt : ?Nat;
    releasedAt : ?Nat;
    chatId : ?Text; // Optional chat ID for this transaction
    constellationHashes : [ConstellationHashEntry]; // Constellation Network tamper-proof hashes array

    // Story Protocol (Aeneid) tracking
    storyIpAssetId : ?Text; // IP Account address representing this escrow
    storyTxs : [
      {
        action : Text; // e.g., "register", "approve_attest", "release_attest", "cancel_attest", "refund_attest"
        txHash : Text; // Aeneid tx hash
        timestamp : Nat;
      }
    ];

    // Type-specific data
    milestoneData : MilestoneEscrowData;
    basicData : ?BasicEscrowData;
    withdrawData : ?WithdrawData;
  };

  // Create transaction request types

  public type CreateBasicEscrowRequest = {
    title : Text;
    participants : [ParticipantShare];
    useSeiAcceleration : Bool;
  };

  public type CreateWithdrawRequest = {
    withdrawData : WithdrawData;
  };

  public type CreatePaymentGatewayRequest = {
    to : Principal;
    amount : Nat;
    memo : ?Text;
    merchantId : ?Text;
    useSeiAcceleration : Bool;
  };

  public type CreateTransactionRequest = {
    #basic_escrow : CreateBasicEscrowRequest;
    #withdraw : CreateWithdrawRequest;
    #payment_gateway : CreatePaymentGatewayRequest;
  };

  public type CreateTransactionResult = {
    #ok : {
      transactionId : Text;
      title : ?Text;
      amount : ?Nat;
      recipientCount : ?Nat;
      recipients : ?[ParticipantShare];
    };
    #err : Text;
  };
};

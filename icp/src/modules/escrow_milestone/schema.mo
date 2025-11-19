import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

module {
  public type PhoneNumber = {
    country : Text;
    number : Text;
  };

  // Monthly proof of work tracking for each recipient
  public type MonthlyProofOfWork = {
    monthNumber : Nat;                    // Which month this proof is for (1-6)
    description : ?Text;                  // Description of work done this month
    screenshotIds : [Text];               // File IDs for proof of work screenshots
    fileIds : [Text];                     // File IDs for proof of work files
    submittedAt : ?Nat;                   // When proof was submitted
    approvedAt : ?Nat;                    // When proof was approved by client
  };

  public type MilestoneRecipient = {
    id : Text;
    name : Text;
    principal : Principal;
    share : Nat;
    email : ?Text;
    phone : ?PhoneNumber;
    billingAddress : ?Text;
    approvedAt : ?Nat;
    declinedAt : ?Nat;
    monthlyProofOfWork : [MonthlyProofOfWork]; // Array of monthly proof of work (6 months)
  };

  public type MilestoneFrequency = {
    #day : Nat;
  };

  public type RecipientPayment = {
    recipientId : Text;          // Recipient identifier
    recipientName : Text;        // Recipient name for display
    amount : Nat;                // Amount paid to this recipient (in satoshis)
  };

  public type ReleasePayment = {
    id : Nat;                    // Release payment ID (1, 2, 3, etc.)
    monthNumber : Nat;           // Which month this is (1-6)
    releasedAt : ?Nat;           // Timestamp when released (null if pending)
    total : Nat;                 // Total amount released this month (in satoshis)
    recipientPayments : [RecipientPayment]; // Individual recipient payments
  };

  public type Milestone = {
    id : Text;
    title : Text;
    allocation : Nat;
    coin : Text;
    recipients : [MilestoneRecipient];
    startDate : Nat;
    endDate : Nat;
    createdAt : Nat;
    frequency : MilestoneFrequency;
    duration : Nat;
    releasePayments : [ReleasePayment]; // NEW: Track monthly payments
  };

  public type MilestoneRecipientRequest = {
    id : Text;
    name : Text;
    principal : Principal;
    share : Nat;
  };

  public type InitiateMilestoneRequest = {
    title : Text;
    allocation : Nat;
    coin : Text;
    recipients : [MilestoneRecipientRequest];
    startDate : Nat;
    frequency : MilestoneFrequency;
    duration : Nat;
    contractSigningPeriod : ?Nat;
    contractFile : ?Text;
  };

  public type MilestoneResult = {
    #ok : { milestoneId : Text; transactionId : Text };
    #err : Text;
  };

  public type InitiateMultipleMilestonesRequest = {
    title : Text;
    milestones : [InitiateMilestoneRequest];
    contractFile : ?Text;
  };

  // Type for milestone escrow recipients (for contract signing)
  public type MilestoneEscrowRecipient = {
    id : Text;
    name : Text;
    principal : Principal;
    signedContractFileId : ?Text;
    signedContractAt : ?Nat;
    clientApprovedSignedContractAt : ?Nat;
  };
};

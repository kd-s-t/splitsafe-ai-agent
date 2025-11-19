import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import _Iter "mo:base/Iter";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Debug "mo:base/Debug";

import Types "./schema";
import TransactionTypes "../transaction/schema";
import FileStorage "../storage/storage";

module {
  public type Milestone = Types.Milestone;
  public type MilestoneRecipient = Types.MilestoneRecipient;
  public type MilestoneFrequency = Types.MilestoneFrequency;
  public type ReleasePayment = Types.ReleasePayment;
  public type RecipientPayment = Types.RecipientPayment;
  public type MilestoneEscrowRecipient = Types.MilestoneEscrowRecipient;
  public type MonthlyProofOfWork = Types.MonthlyProofOfWork;

  public type MilestoneResult = {
    #ok : { milestoneId : Text; transactionId : Text; milestone : Milestone };
    #err : Text;
  };

  // Helper function to validate PDF file by checking base64 content
  private func validatePdfFile(base64Data: Text): Bool {
    // Check if base64 data is long enough to contain PDF header
    if (Text.size(base64Data) < 20) {
      Debug.print("❌ [PDF_VALIDATION] Base64 data too short");
      return false;
    };

    // Check for PDF signature directly on the base64 data
    // PDF files start with %PDF, which is base64 encoded as "JVBERi0="
    if (Text.startsWith(base64Data, #text "JVBERi0")) {
      Debug.print("✅ [PDF_VALIDATION] Valid PDF signature detected");
      return true;
    };

    // Check for other common PDF signatures
    if (Text.startsWith(base64Data, #text "JVBERi")) {
      Debug.print("✅ [PDF_VALIDATION] Valid PDF signature detected (variant)");
      return true;
    };

    // Check for HTML content (common mistake)
    if (Text.startsWith(base64Data, #text "PCFET0NUWVBFIGh0bWw")) {
      Debug.print("❌ [PDF_VALIDATION] HTML content detected instead of PDF");
      return false;
    };

    // Check for ZIP/Office documents
    if (Text.startsWith(base64Data, #text "UEsDBBQ")) {
      Debug.print("❌ [PDF_VALIDATION] ZIP/Office document detected instead of PDF");
      return false;
    };

    // Check for image files
    if (Text.startsWith(base64Data, #text "R0lGOD") or 
        Text.startsWith(base64Data, #text "iVBORw0KGgo") or
        Text.startsWith(base64Data, #text "/9j/4AAQ")) {
      Debug.print("❌ [PDF_VALIDATION] Image file detected instead of PDF");
      return false;
    };

    Debug.print("❌ [PDF_VALIDATION] Unknown file type - not a valid PDF");
    return false;
  };

  public type InitiateMilestoneRequest = {
    title : Text;
    allocation : Nat;
    coin : Text;
    recipients : [Types.MilestoneRecipientRequest];
    startDate : Nat;
    frequency : MilestoneFrequency;
    duration : Nat;
    contractSigningPeriod : ?Nat;
    contractFile : ?Text;
  };

  public type InitiateMultipleMilestonesRequest = {
    title : Text;
    milestones : [InitiateMilestoneRequest];
    contractFile : ?Text; // Contract file for the entire milestone escrow
  };

  public class MilestoneManager() {

    // Helper function to initialize monthly proof of work arrays for a recipient
    private func initializeMonthlyProofOfWork(duration : Nat) : [MonthlyProofOfWork] {
      Array.tabulate<MonthlyProofOfWork>(
        duration,
        func(i) {
          {
            monthNumber = i + 1;
            description = null;
            screenshotIds = [];
            fileIds = [];
            submittedAt = null;
            approvedAt = null;
          }
        }
      )
    };

    private func calculateEndDate(startDate : Nat, frequency : MilestoneFrequency, duration : Nat) : Nat {
      let startMs = startDate / 1_000_000;
      
      let endMs = switch (frequency) {
        case (#day(_dayNumber)) {
          // For day-specific frequency, treat as monthly with the specified day
          startMs + (duration * 30 * 24 * 60 * 60 * 1000);
        };
      };
      
      endMs * 1_000_000
    };

    private func generateTransactionId(from : Principal) : Text {
      let timestamp = Int.abs(Time.now());
      let principalText = Principal.toText(from);
      let randomSuffix = Nat.toText(timestamp % 1000000);
      let id = "tran-" # Nat.toText(timestamp) # "-" # principalText # "-" # randomSuffix;
      id
    };

    private func validateMilestoneRequest(request : InitiateMilestoneRequest) : Result.Result<(), Text> {
      if (Text.size(request.title) == 0) {
        return #err("Title cannot be empty");
      };

      if (request.allocation == 0) {
        return #err("Allocation must be greater than 0");
      };

      if (Array.size(request.recipients) == 0) {
        return #err("At least one recipient is required");
      };

      for (recipient in request.recipients.vals()) {
        if (Text.size(recipient.name) == 0) {
          return #err("Recipient name cannot be empty");
        };
        if (recipient.share == 0) {
          return #err("Recipient share must be greater than 0");
        };
      };

      let now = Int.abs(Time.now());
      if (request.startDate < now) {
        return #err("Start date cannot be in the past");
      };

      #ok(())
    };

    private func calculateTotalShares(recipients : [Types.MilestoneRecipientRequest]) : Nat {
      var total : Nat = 0;
      for (recipient in recipients.vals()) {
        total += recipient.share;
      };
      total
    };


    private func _holdFunds() : Result.Result<(), Text> {
      #ok(())
    };


    public func initiateMultipleMilestones(
      from : Principal,
      request : InitiateMultipleMilestonesRequest,
      mainTransactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
      emails : HashMap.HashMap<Principal, Text>,
      bitcoinBalances : HashMap.HashMap<Principal, Nat>,
      fileStorage : FileStorage.FileStorage
    ) : MilestoneResult {
      if (Array.size(request.milestones) == 0) {
        return #err("At least one milestone is required");
      };

      for (milestoneRequest in request.milestones.vals()) {
        switch (validateMilestoneRequest(milestoneRequest)) {
          case (#err(msg)) return #err(msg);
          case (#ok()) {};
        };
      };

      for (milestoneRequest in request.milestones.vals()) {
        let totalShares = calculateTotalShares(milestoneRequest.recipients);
        if (totalShares != milestoneRequest.allocation) {
          return #err("Total recipient shares must equal allocation amount for milestone: " # milestoneRequest.title);
        };
      };

      let totalAmount = Array.foldLeft<InitiateMilestoneRequest, Nat>(
        request.milestones,
        0,
        func(acc, milestone) { acc + milestone.allocation }
      );

      // Check if user has sufficient balance
      let userBalance = switch (bitcoinBalances.get(from)) {
        case (?balance) balance;
        case null 0;
      };

      if (userBalance < totalAmount) {
        return #err("Insufficient balance. Required: " # Nat.toText(totalAmount) # " satoshis, Available: " # Nat.toText(userBalance) # " satoshis");
      };

      // Deduct the total amount from user's balance
      let newBalance = Nat.sub(userBalance, totalAmount);
      bitcoinBalances.put(from, newBalance);
      Debug.print("💰 [MILESTONE] Deducted " # Nat.toText(totalAmount) # " satoshis from user balance");
      Debug.print("💰 [MILESTONE] User balance: " # Nat.toText(userBalance) # " -> " # Nat.toText(newBalance) # " satoshis");

      let transactionId = generateTransactionId(from);

      var createdMilestones : [Milestone] = [];
      var milestoneIds : [Text] = [];

      for (milestoneRequest in request.milestones.vals()) {
        let enrichedRecipients = Array.map<Types.MilestoneRecipientRequest, MilestoneRecipient>(
          milestoneRequest.recipients,
          func(recipient) {
            let email = emails.get(recipient.principal);
            {
              id = recipient.id;
              name = recipient.name;
              principal = recipient.principal;
              share = recipient.share;
              email = email;
              phone = null;
              billingAddress = null;
              approvedAt = null;
              declinedAt = null;
              monthlyProofOfWork = initializeMonthlyProofOfWork(milestoneRequest.duration);
            }
          }
        );

        let milestoneId = "mlstne-" # Nat.toText(Array.size(createdMilestones) + 1);

        let endDate = calculateEndDate(milestoneRequest.startDate, milestoneRequest.frequency, milestoneRequest.duration);

        let milestone : Milestone = {
          id = milestoneId;
          title = milestoneRequest.title;
          allocation = milestoneRequest.allocation;
          coin = milestoneRequest.coin;
          recipients = enrichedRecipients;
          startDate = milestoneRequest.startDate;
          endDate = endDate;
          createdAt = Int.abs(Time.now());
          frequency = milestoneRequest.frequency;
          duration = milestoneRequest.duration;
          releasePayments = []; // Initialize empty release payments array
        };

        createdMilestones := Array.append(createdMilestones, [milestone]);
        milestoneIds := Array.append(milestoneIds, [milestoneId]);
      };

      let contractSigningDeadline = switch (request.milestones[0].contractSigningPeriod) {
        case (null) { null };
        case (?period) {
          let currentTime = Int.abs(Time.now());
          let deadlineMs = currentTime + (period * 24 * 60 * 60 * 1000 * 1000 * 1000);
          ?deadlineMs
        };
      };

      // Scan all unique recipients from all milestones and add them to MilestoneEscrowData.recipients
      var uniqueRecipients : [MilestoneEscrowRecipient] = [];
      var seenPrincipals : [Principal] = [];
      
      for (milestone in createdMilestones.vals()) {
        for (recipient in milestone.recipients.vals()) {
          // Check if this principal is already in our unique list
          let isAlreadySeen = Array.find<Principal>(seenPrincipals, func(p) { p == recipient.principal }) != null;
          
          if (not isAlreadySeen) {
            // Add to seen principals
            seenPrincipals := Array.append(seenPrincipals, [recipient.principal]);
            
            // Add to unique recipients with contract signing fields
            let milestoneEscrowRecipient : MilestoneEscrowRecipient = {
              id = recipient.id;
              name = recipient.name;
              principal = recipient.principal;
              signedContractFileId = null;
              signedContractAt = null;
              clientApprovedSignedContractAt = null;
            };
            
            uniqueRecipients := Array.append(uniqueRecipients, [milestoneEscrowRecipient]);
          };
        };
      };

      // Upload contract file to storage if it exists
      let contractFileId : ?Text = switch (request.contractFile) {
        case (null) { null };
        case (?contractFileBase64) {
          // Validate PDF file before uploading
          if (not validatePdfFile(contractFileBase64)) {
            Debug.print("❌ [MILESTONE] Contract file validation failed - not a valid PDF");
            return #err("Invalid contract file: Please upload a valid PDF file. HTML, images, and other file types are not allowed.");
          };
          
          Debug.print("✅ [MILESTONE] Contract file validation passed - proceeding with upload");
          let uploadRequest : FileStorage.FileUploadRequest = {
            filename = "contract.pdf";
            fileType = #pdf;
            base64Data = contractFileBase64;
          };
          let fileId = fileStorage.uploadFile(uploadRequest, from);
          Debug.print("📁 [MILESTONE] Contract file uploaded with ID: " # fileId);
          ?fileId
        };
      };

      let transaction : TransactionTypes.Transaction = {
        id = transactionId;
        kind = #milestone_escrow;
        from = from;
        funds_allocated = totalAmount;
        readAt = null;
        status = "pending";
        title = request.title;
        createdAt = Int.abs(Time.now());
        confirmedAt = null;
        cancelledAt = null;
        refundedAt = null;
        releasedAt = null;
        chatId = null;
        constellationHashes = [];
        // Initialize Story Protocol tracking fields
        storyIpAssetId = null;
        storyTxs = [];
        milestoneData = {
          milestones = createdMilestones;
          contractSigningDateBefore = contractSigningDeadline;
          contractFileId = contractFileId; // Use uploaded file ID instead of raw base64 content
          clientApprovedSignedAt = null; // Initialize as null
          recipients = uniqueRecipients; // Add unique recipients for contract signing
        };
        basicData = null;
        withdrawData = null;
      };

      
      let existingTxs = switch (mainTransactions.get(from)) {
        case (?txs) txs;
        case null [];
      };
      let updatedTxs = Array.append(existingTxs, [transaction]);
      mainTransactions.put(from, updatedTxs);

      if (Array.size(createdMilestones) > 0) {
        let firstMilestone = createdMilestones[0];
        #ok({ milestoneId = firstMilestone.id; transactionId = transactionId; milestone = firstMilestone })
      } else {
        #err("Failed to create milestones")
      }
    };

    public func initiateMilestone(
      from : Principal,
      request : InitiateMilestoneRequest,
      mainTransactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
      emails : HashMap.HashMap<Principal, Text>,
      bitcoinBalances : HashMap.HashMap<Principal, Nat>
    ) : MilestoneResult {
      switch (validateMilestoneRequest(request)) {
        case (#err(msg)) return #err(msg);
        case (#ok()) {};
      };

      let totalShares = calculateTotalShares(request.recipients);
      if (totalShares != request.allocation) {
        return #err("Total recipient shares must equal allocation amount");
      };

      // Check if user has sufficient balance
      let userBalance = switch (bitcoinBalances.get(from)) {
        case (?balance) balance;
        case null 0;
      };

      if (userBalance < request.allocation) {
        return #err("Insufficient balance. Required: " # Nat.toText(request.allocation) # " satoshis, Available: " # Nat.toText(userBalance) # " satoshis");
      };

      // Deduct the allocation amount from user's balance
      let newBalance = Nat.sub(userBalance, request.allocation);
      bitcoinBalances.put(from, newBalance);
      Debug.print("💰 [MILESTONE] Deducted " # Nat.toText(request.allocation) # " satoshis from user balance");
      Debug.print("💰 [MILESTONE] User balance: " # Nat.toText(userBalance) # " -> " # Nat.toText(newBalance) # " satoshis");

      let enrichedRecipients = Array.map<Types.MilestoneRecipientRequest, MilestoneRecipient>(
        request.recipients,
        func(recipient) {
          let email = emails.get(recipient.principal);
          {
            id = recipient.id;
            name = recipient.name;
            principal = recipient.principal;
            share = recipient.share;
            email = email;
            phone = null;
            billingAddress = null;
            approvedAt = null;
            declinedAt = null;
            monthlyProofOfWork = initializeMonthlyProofOfWork(request.duration);
          }
        }
      );

      let milestoneId = "mlstne-1";
      let transactionId = generateTransactionId(from);

      let endDate = calculateEndDate(request.startDate, request.frequency, request.duration);

      let milestone : Milestone = {
        id = milestoneId;
        title = request.title;
        allocation = request.allocation;
        coin = request.coin;
        recipients = enrichedRecipients;
        startDate = request.startDate;
        endDate = endDate;
        createdAt = Int.abs(Time.now());
        frequency = request.frequency;
        duration = request.duration;
        releasePayments = []; // Initialize empty release payments array
      };

      let contractSigningDeadline = switch (request.contractSigningPeriod) {
        case (null) { null };
        case (?period) {
          let currentTime = Int.abs(Time.now());
          let deadlineMs = currentTime + (period * 24 * 60 * 60 * 1000 * 1000 * 1000);
          ?deadlineMs
        };
      };

      // Scan all unique recipients from the milestone and add them to MilestoneEscrowData.recipients
      var uniqueRecipients : [MilestoneEscrowRecipient] = [];
      
      for (recipient in enrichedRecipients.vals()) {
        let milestoneEscrowRecipient : MilestoneEscrowRecipient = {
          id = recipient.id;
          name = recipient.name;
          principal = recipient.principal;
          signedContractFileId = null;
          signedContractAt = null;
          clientApprovedSignedContractAt = null;
        };
        
        uniqueRecipients := Array.append(uniqueRecipients, [milestoneEscrowRecipient]);
      };

      let transaction : TransactionTypes.Transaction = {
        id = transactionId;
        kind = #milestone_escrow;
        from = from;
        funds_allocated = request.allocation;
        readAt = null;
        status = "pending";
        title = request.title;
        createdAt = Int.abs(Time.now());
        confirmedAt = null;
        cancelledAt = null;
        refundedAt = null;
        releasedAt = null;
        chatId = null;
        constellationHashes = [];
        // Initialize Story Protocol tracking fields
        storyIpAssetId = null;
        storyTxs = [];
        milestoneData = {
          milestones = [milestone];
          contractSigningDateBefore = contractSigningDeadline;
          contractFileId = switch (request.contractFile) {
            case (null) { null };
            case (?contractFileBase64) {
              // Validate PDF file before storing
              if (not validatePdfFile(contractFileBase64)) {
                Debug.print("❌ [SINGLE_MILESTONE] Contract file validation failed - not a valid PDF");
                return #err("Invalid contract file: Please upload a valid PDF file. HTML, images, and other file types are not allowed.");
              };
              Debug.print("✅ [SINGLE_MILESTONE] Contract file validation passed");
              request.contractFile
            };
          };
          clientApprovedSignedAt = null; // Initialize as null
          recipients = uniqueRecipients; // Add unique recipients for contract signing
        };
        basicData = null;
        withdrawData = null;
      };

      
      let existingTxs = switch (mainTransactions.get(from)) {
        case (?txs) txs;
        case null [];
      };
      let updatedTxs = Array.append(existingTxs, [transaction]);
      mainTransactions.put(from, updatedTxs);

      #ok({ milestoneId = milestoneId; transactionId = transactionId; milestone = milestone })
    };




    public func recipientSignContract(
      transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
      transactionId : Text,
      _milestoneId : Text, 
      recipientId : Text, 
      caller : Principal, 
      signedContractFile : Text,
      fileStorage : FileStorage.FileStorage
    ) : Result.Result<(), Text> {
      
      // Search through all transactions to find the specific transaction
      for ((sender, txs) in transactions.entries()) {
        for (tx in txs.vals()) {
          // Check if this is the specific transaction we're looking for
          if (tx.id == transactionId) {
            // Check if this transaction has milestone data
            if (tx.milestoneData.milestones.size() > 0) {
              
              // Find the recipient in the milestone escrow recipients for this specific transaction
              var recipientIndex : ?Nat = null;
              var i = 0;
              for (recipient in tx.milestoneData.recipients.vals()) {
                if (recipient.id == recipientId) {
                  recipientIndex := ?i;
                };
                i += 1;
              };
              
              switch (recipientIndex) {
                case null {
                  return #err("Recipient " # recipientId # " not found in transaction " # transactionId # ". Please verify the recipient ID is correct for this transaction.");
                };
                case (?index) {
                  let recipient = tx.milestoneData.recipients[index];
                  
                  // Verify the caller is the recipient
                  if (recipient.principal != caller) {
                    return #err("Only the recipient can sign the contract");
                  };
                  
                  // Frontend now sends clean base64 data
                  let base64Data = signedContractFile;
                  
                  // Validate PDF file before uploading to storage
                  if (not validatePdfFile(base64Data)) {
                    return #err("Invalid signed contract file: Please upload a valid PDF file. HTML, images, and other file types are not allowed.");
                  };
                  
                  // Upload signed contract file to storage
                  let uploadRequest : FileStorage.FileUploadRequest = {
                    filename = "signed-contract-" # recipientId # ".pdf";
                    fileType = #pdf;
                    base64Data = base64Data;
                  };
                  let fileId = fileStorage.uploadFile(uploadRequest, caller);
                  
                  // Update the milestone escrow recipient with signed contract info
                  let updatedRecipient = {
                    recipient with
                    signedContractFileId = ?fileId;
                    signedContractAt = ?Int.abs(Time.now());
                  };
                  
                  let updatedRecipients = Array.tabulate<MilestoneEscrowRecipient>(
                    tx.milestoneData.recipients.size(),
                    func(i) = if (i == index) updatedRecipient else tx.milestoneData.recipients[i]
                  );
                  
                  let updatedMilestoneData = {
                    tx.milestoneData with
                    recipients = updatedRecipients;
                  };
                  
                  let updatedTransaction = {
                    tx with
                    milestoneData = updatedMilestoneData;
                  };
                  
                  // Update the transaction in the transactions HashMap
                  let updatedTxs = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                    txs,
                    func(t) = if (t.id == tx.id) updatedTransaction else t
                  );
                  
                  transactions.put(sender, updatedTxs);
                  return #ok(());
                };
              };
            };
          };
        };
      };
      
      #err("Transaction not found");
    };

  // Submit proof of work for a milestone recipient for a specific month
  public func submitProofOfWork(
    transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
    milestoneId : Text, 
    recipientId : Text, 
    caller : Principal,
    monthNumber : Nat,
    description : Text,
    screenshots : [Text],
    files : [Text],
    fileStorage : FileStorage.FileStorage
  ) : Result.Result<(), Text> {
    // Search through all transactions to find the one containing the milestone
    for ((sender, txs) in transactions.entries()) {
      for (tx in txs.vals()) {
        // Check if this transaction has milestone data
        if (tx.milestoneData.milestones.size() > 0) {
          // Search through milestones in this transaction
          for (milestone in tx.milestoneData.milestones.vals()) {
            if (milestone.id == milestoneId) {
              // Find the recipient in the milestone
              var recipientIndex : ?Nat = null;
              var i = 0;
              for (recipient in milestone.recipients.vals()) {
                if (recipient.id == recipientId) {
                  recipientIndex := ?i
                } else {
                  i += 1
                }
              };
              
              switch (recipientIndex) {
                case null {
                  return #err("Recipient not found in milestone");
                };
                case (?index) {
                  let recipient = milestone.recipients[index];
                  
                  // Verify the caller is the recipient
                  if (recipient.principal != caller) {
                    return #err("Only the recipient can submit proof of work");
                  };
                  
                  // Validate month number
                  if (monthNumber < 1 or monthNumber > milestone.duration) {
                    return #err("Month number must be between 1 and " # Nat.toText(milestone.duration));
                  };
                  
                  // Find the monthly proof of work entry for this month
                  var monthlyProofIndex : ?Nat = null;
                  var i = 0;
                  for (monthlyProof in recipient.monthlyProofOfWork.vals()) {
                    if (monthlyProof.monthNumber == monthNumber) {
                      monthlyProofIndex := ?i;
                    };
                    i += 1;
                  };
                  
                  switch (monthlyProofIndex) {
                    case null {
                      return #err("Monthly proof of work entry not found for month " # Nat.toText(monthNumber));
                    };
                    case (?proofIndex) {
                      let monthlyProof = recipient.monthlyProofOfWork[proofIndex];
                      
                      // Check if proof has already been submitted for this month
                      switch (monthlyProof.submittedAt) {
                        case (?_) {
                          return #err("Proof of work has already been submitted for month " # Nat.toText(monthNumber));
                        };
                        case null {};
                      };
                      
                      // Upload screenshots to storage and get file IDs
                      let screenshotFileIds = Array.map<Text, Text>(
                        screenshots,
                        func(screenshotBase64) {
                          let uploadRequest : FileStorage.FileUploadRequest = {
                            filename = "proof-screenshot-" # recipientId # "-month-" # Nat.toText(monthNumber) # ".jpg";
                            fileType = #jpg;
                            base64Data = screenshotBase64;
                          };
                          fileStorage.uploadFile(uploadRequest, caller)
                        }
                      );
                      
                      // Upload files to storage and get file IDs
                      let fileIds = Array.map<Text, Text>(
                        files,
                        func(fileBase64) {
                          let uploadRequest : FileStorage.FileUploadRequest = {
                            filename = "proof-file-" # recipientId # "-month-" # Nat.toText(monthNumber) # ".pdf";
                            fileType = #pdf;
                            base64Data = fileBase64;
                          };
                          fileStorage.uploadFile(uploadRequest, caller)
                        }
                      );
                      
                      // Update the monthly proof of work entry
                      let currentTime = Int.abs(Time.now());
                      let updatedMonthlyProof = {
                        monthlyProof with
                        description = ?description;
                        screenshotIds = screenshotFileIds;
                        fileIds = fileIds;
                        submittedAt = ?currentTime;
                      };
                      
                      // Update the monthly proof of work array
                      let updatedMonthlyProofOfWork = Array.tabulate<MonthlyProofOfWork>(
                        recipient.monthlyProofOfWork.size(),
                        func(i) = if (i == proofIndex) updatedMonthlyProof else recipient.monthlyProofOfWork[i]
                      );
                      
                      // Update the recipient with the new monthly proof of work
                      let updatedRecipient = {
                        recipient with
                        monthlyProofOfWork = updatedMonthlyProofOfWork;
                      };
                      
                      let updatedRecipients = Array.tabulate<MilestoneRecipient>(
                        milestone.recipients.size(),
                        func(i) = if (i == index) updatedRecipient else milestone.recipients[i]
                      );
                      
                      let updatedMilestone = {
                        milestone with
                        recipients = updatedRecipients;
                      };
                      
                      // Update the milestone in the transaction
                      let updatedMilestones = Array.map<Milestone, Milestone>(
                        tx.milestoneData.milestones,
                        func(m) = if (m.id == milestoneId) updatedMilestone else m
                      );
                      
                      let updatedMilestoneData = {
                        tx.milestoneData with
                        milestones = updatedMilestones;
                      };
                      
                      let updatedTransaction = {
                        tx with
                        milestoneData = updatedMilestoneData;
                      };
                      
                      // Update the transaction in the transactions HashMap
                      let updatedTxs = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                        txs,
                        func(t) = if (t.id == tx.id) updatedTransaction else t
                      );
                      
                      transactions.put(sender, updatedTxs);
                      return #ok(());
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
    
    #err("Milestone not found");
  };

  // Client approves a recipient's signed contract
  public func clientApprovedSignedContract(
    transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
    transactionId : Text,
    milestoneId : Text, 
    recipientId : Text, 
    caller : Principal
  ) : Result.Result<(), Text> {
    Debug.print("🔍 clientApprovedSignedContract called with: " # transactionId # ", " # milestoneId # ", " # recipientId # ", " # Principal.toText(caller));
    
    // Search through all transactions to find the specific transaction
    for ((sender, txs) in transactions.entries()) {
      for (tx in txs.vals()) {
        // Check if this is the specific transaction we're looking for
        if (tx.id == transactionId) {
          Debug.print("✅ Found specific transaction: " # tx.id);
          
          // Check if this transaction has milestone data
          if (tx.milestoneData.milestones.size() > 0) {
            // Search through milestones in this transaction to find the milestone
            for (milestone in tx.milestoneData.milestones.vals()) {
              if (milestone.id == milestoneId) {
                Debug.print("✅ Found milestone in transaction: " # tx.id);
                
                // Find the recipient in the milestone escrow recipients
              var recipientIndex : ?Nat = null;
              var i = 0;
              for (recipient in tx.milestoneData.recipients.vals()) {
                Debug.print("🔍 Checking milestone escrow recipient " # Nat.toText(i) # ": " # recipient.id # " vs " # recipientId);
                if (recipient.id == recipientId) {
                  recipientIndex := ?i;
                  Debug.print("✅ Found milestone escrow recipient at index: " # Nat.toText(i));
                };
                i += 1;
              };
              
              switch (recipientIndex) {
                case null {
                  Debug.print("❌ Recipient not found in milestone escrow recipients");
                  return #err("Recipient not found in milestone escrow recipients");
                };
                case (?index) {
                  let recipient = tx.milestoneData.recipients[index];
                  
                  // Verify the caller is the transaction sender (client)
                  Debug.print("🔍 Verifying caller: " # Principal.toText(caller) # " vs transaction owner: " # Principal.toText(tx.from));
                  if (tx.from != caller) {
                    Debug.print("❌ Caller mismatch - only the client can approve signed contracts");
                    return #err("Only the client can approve signed contracts");
                  };
                  
                  // Check if recipient has signed the contract
                  switch (recipient.signedContractAt) {
                    case null {
                      Debug.print("❌ Recipient has not signed the contract yet");
                      return #err("Recipient has not signed the contract yet");
                    };
                    case (?_) {
                      Debug.print("✅ Recipient has signed contract, updating client approval");
                      
                      // Update the milestone escrow recipient with client approval timestamp
                      let updatedRecipient = {
                        recipient with
                        clientApprovedSignedContractAt = ?Int.abs(Time.now());
                      };
                      
                      let updatedRecipients = Array.tabulate<MilestoneEscrowRecipient>(
                        tx.milestoneData.recipients.size(),
                        func(i) = if (i == index) updatedRecipient else tx.milestoneData.recipients[i]
                      );
                      
                      let updatedMilestoneData = {
                        tx.milestoneData with
                        recipients = updatedRecipients;
                      };
                      
                      let updatedTransaction = {
                        tx with
                        milestoneData = updatedMilestoneData;
                      };
                      
                      // Update the transaction in the transactions HashMap
                      let updatedTxs = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                        txs,
                        func(t) = if (t.id == tx.id) updatedTransaction else t
                      );
                      
                      transactions.put(sender, updatedTxs);
                      Debug.print("✅ Client approved signed contract for recipient: " # recipientId);
                      return #ok(());
                    };
                  };
                };
              };
            };
            };          } else {
            Debug.print("❌ Transaction has no milestone data");
            return #err("Transaction has no milestone data");
          };
        };
      };
    };
    
    Debug.print("❌ Transaction not found: " # transactionId);
    #err("Transaction not found");
  };

  // Function to release monthly milestone payment
  public func clientReleaseMilestonePayment(
    mainTransactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
    transactionId : Text,
    monthNumber : Nat,
    caller : Principal,
    bitcoinBalances : HashMap.HashMap<Principal, Nat>
  ) : Result.Result<HashMap.HashMap<Principal, [TransactionTypes.Transaction]>, Text> {
    Debug.print("💰 [BACKEND] clientReleaseMilestonePayment called");
    Debug.print("💰 [BACKEND] - transactionId: " # transactionId);
    Debug.print("💰 [BACKEND] - monthNumber: " # Nat.toText(monthNumber));
    Debug.print("💰 [BACKEND] - caller: " # Principal.toText(caller));
    
    // Find the transaction
    for ((sender, txs) in mainTransactions.entries()) {
      for (tx in txs.vals()) {
        if (tx.id == transactionId) {
          Debug.print("✅ Found transaction: " # tx.id);
          
          // Check if caller is the transaction owner
          if (tx.from != caller) {
            Debug.print("❌ Caller is not the transaction owner");
            return #err("Only the transaction owner can release milestone payments");
          };
          
          // Check if this is a milestone transaction
          switch (tx.kind) {
            case (#milestone_escrow) {
              let milestone = tx.milestoneData.milestones[0];
              
              // Validate month number
              if (monthNumber < 1 or monthNumber > milestone.duration) {
                Debug.print("❌ Invalid month number: " # Nat.toText(monthNumber));
                return #err("Month number must be between 1 and " # Nat.toText(milestone.duration));
              };
              
              // Check if this month has already been released
              let monthAlreadyReleased = Array.find<ReleasePayment>(
                milestone.releasePayments,
                func(payment) = payment.monthNumber == monthNumber and payment.releasedAt != null
              );
              
              switch (monthAlreadyReleased) {
                case (?_) {
                  Debug.print("❌ Month " # Nat.toText(monthNumber) # " has already been released");
                  return #err("Month " # Nat.toText(monthNumber) # " has already been released");
                };
                case null {};
              };
              
              // Check if all recipients have submitted proof of work for this specific month
              var allRecipientsHaveProof = true;
              for (recipient in milestone.recipients.vals()) {
                // Find the monthly proof of work entry for this month
                let monthlyProof = Array.find<MonthlyProofOfWork>(
                  recipient.monthlyProofOfWork,
                  func(proof) = proof.monthNumber == monthNumber
                );
                
                switch (monthlyProof) {
                  case null {
                    Debug.print("❌ Monthly proof of work entry not found for month " # Nat.toText(monthNumber) # " for recipient " # recipient.name);
                    allRecipientsHaveProof := false;
                  };
                  case (?proof) {
                    switch (proof.submittedAt) {
                      case null {
                        Debug.print("❌ Recipient " # recipient.name # " has not submitted proof of work for month " # Nat.toText(monthNumber));
                        allRecipientsHaveProof := false;
                      };
                      case (?_) {
                        Debug.print("✅ Recipient " # recipient.name # " has submitted proof of work for month " # Nat.toText(monthNumber));
                      };
                    };
                  };
                };
              };
              
              if (not allRecipientsHaveProof) {
                Debug.print("❌ Not all recipients have submitted proof of work for month " # Nat.toText(monthNumber));
                return #err("All recipients must submit proof of work for month " # Nat.toText(monthNumber) # " before payment can be released");
              };
              
              // Create recipient payments for this month
              var recipientPayments : [RecipientPayment] = [];
              var totalReleased = 0;
              
              // Release payment to each recipient based on their share
              for (recipient in milestone.recipients.vals()) {
                // Calculate each recipient's monthly amount based on their share
                let recipientMonthlyAmount = recipient.share / milestone.duration;
                Debug.print("💰 Releasing payment to recipient: " # recipient.name);
                Debug.print("💰 Recipient share: " # Nat.toText(recipient.share) # " satoshis");
                Debug.print("💰 Monthly amount: " # Nat.toText(recipientMonthlyAmount) # " satoshis");
                
                // Update recipient's Bitcoin balance
                let currentBalance = switch (bitcoinBalances.get(recipient.principal)) {
                  case (?balance) balance;
                  case null 0;
                };
                bitcoinBalances.put(recipient.principal, currentBalance + recipientMonthlyAmount);
                totalReleased += recipientMonthlyAmount;
                
                Debug.print("✅ Payment released to " # recipient.name # " (" # Principal.toText(recipient.principal) # ") - New balance: " # Nat.toText(currentBalance + recipientMonthlyAmount) # " satoshis");
                
                // Create recipient payment record
                let recipientPayment : RecipientPayment = {
                  recipientId = recipient.id;
                  recipientName = recipient.name;
                  amount = recipientMonthlyAmount;
                };
                
                recipientPayments := Array.append(recipientPayments, [recipientPayment]);
              };
              
              // Create release payment record
              let releasePayment : ReleasePayment = {
                id = Array.size(milestone.releasePayments) + 1;
                monthNumber = monthNumber;
                releasedAt = ?(Int.abs(Time.now()));
                total = totalReleased;
                recipientPayments = recipientPayments;
              };
              
              // Add release payment to milestone
              let updatedMilestone = {
                milestone with
                releasePayments = Array.append(milestone.releasePayments, [releasePayment]);
              };
              
              let updatedMilestones = Array.map<Milestone, Milestone>(
                tx.milestoneData.milestones,
                func(m) = if (m.id == updatedMilestone.id) updatedMilestone else m
              );
              
              let updatedMilestoneData = {
                tx.milestoneData with
                milestones = updatedMilestones;
              };
              
              let updatedTransaction = {
                tx with
                milestoneData = updatedMilestoneData;
                // Only mark transaction as released if all milestones are completed
                status = if (Array.size(updatedMilestone.releasePayments) == updatedMilestone.duration) {
                  "released";
                } else {
                  tx.status;
                };
                releasedAt = if (Array.size(updatedMilestone.releasePayments) == updatedMilestone.duration) {
                  ?(Int.abs(Time.now()));
                } else {
                  tx.releasedAt;
                };
              };
              
              // Update the transaction in the transactions HashMap
              let updatedTxs = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                txs,
                func(t) = if (t.id == tx.id) updatedTransaction else t
              );
              
              mainTransactions.put(sender, updatedTxs);
              Debug.print("✅ Month " # Nat.toText(monthNumber) # " payment released successfully");
              Debug.print("🔍 [DEBUG] Transaction updated in HashMap for sender: " # Principal.toText(sender));
              Debug.print("🔍 [DEBUG] Updated transaction ID: " # updatedTransaction.id);
              Debug.print("🔍 [DEBUG] Updated transaction status: " # updatedTransaction.status);
              Debug.print("🔍 [DEBUG] Release payments count: " # Nat.toText(Array.size(updatedMilestone.releasePayments)));
              return #ok(mainTransactions);
            };
            case (_) {
              Debug.print("❌ Transaction is not a milestone escrow");
              return #err("Transaction is not a milestone escrow");
            }
          }
        };
      };
    };
    
    Debug.print("❌ Transaction not found: " # transactionId);
    #err("Transaction not found");
  };

  };

};

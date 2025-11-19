import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Debug "mo:base/Debug";

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

  // Generate unique log ID
  private func generateLogId(eventType : Text, userId : Principal) : Text {
    let timestamp = Int.abs(Time.now());
    let principalText = Principal.toText(userId);
    let eventPrefix = switch (eventType) {
      case "payment_gateway_transfer" "PGW";
      case "escrow_created" "ESC";
      case "milestone_completed" "MIL";
      case _ "BIZ";
    };
    eventPrefix # "_" # Nat.toText(timestamp) # "_" # principalText;
  };

  // Create business log entry
  public func createBusinessLog(
    eventType : Text,
    userId : Principal,
    amount : Nat,
    currency : Text,
    merchantId : ?Text,
    memo : ?Text,
    fee : Nat,
    network : Text,
    status : Text,
    metadata : Text,
    state : BusinessState
  ) : (Text, BusinessState) {
    
    let logId = generateLogId(eventType, userId);
    let timestamp = Int.abs(Time.now());
    
    let logEntry : BusinessLogEntry = {
      id = logId;
      timestamp = timestamp;
      eventType = eventType;
      userId = userId;
      amount = amount;
      currency = currency;
      merchantId = merchantId;
      memo = memo;
      fee = fee;
      network = network;
      status = status;
      metadata = metadata;
    };
    
    // Add to logs HashMap
    let updatedLogs = state.logs;
    updatedLogs.put(logId, logEntry);
    
    // Add to user logs
    let updatedUserLogs = state.userLogs;
    let userLogIds = switch (updatedUserLogs.get(userId)) {
      case (?ids) Array.append(ids, [logId]);
      case null [logId];
    };
    updatedUserLogs.put(userId, userLogIds);
    
    // Add to merchant logs if merchantId exists
    let updatedMerchantLogs = state.merchantLogs;
    switch (merchantId) {
      case (?merchant) {
        let merchantLogIds = switch (updatedMerchantLogs.get(merchant)) {
          case (?ids) Array.append(ids, [logId]);
          case null [logId];
        };
        updatedMerchantLogs.put(merchant, merchantLogIds);
      };
      case null {};
    };
    
    // Update stats
    let updatedState = {
      logs = updatedLogs;
      userLogs = updatedUserLogs;
      merchantLogs = updatedMerchantLogs;
      totalVolume = state.totalVolume + amount;
      totalTransactions = state.totalTransactions + 1;
      totalFees = state.totalFees + fee;
    };
    
    Debug.print("📊 [BUSINESS] Log created: " # logId);
    Debug.print("   Event: " # eventType);
    Debug.print("   User: " # Principal.toText(userId));
    Debug.print("   Amount: " # Nat.toText(amount) # " " # currency);
    Debug.print("   Merchant: " # (switch (merchantId) { case (?m) m; case null "N/A" }));
    Debug.print("   Network: " # network);
    Debug.print("   Status: " # status);
    
    (logId, updatedState);
  };

  // Get business logs for a user
  public func getUserBusinessLogs(
    user : Principal,
    state : BusinessState
  ) : [BusinessLogEntry] {
    
    let userLogIds = switch (state.userLogs.get(user)) {
      case (?ids) ids;
      case null [];
    };
    
    Array.map<Text, BusinessLogEntry>(
      userLogIds,
      func(id) {
        switch (state.logs.get(id)) {
          case (?log) log;
          case null {
            // Return default log if not found (shouldn't happen)
            {
              id = id;
              timestamp = 0;
              eventType = "unknown";
              userId = user;
              amount = 0;
              currency = "BTC";
              merchantId = null;
              memo = null;
              fee = 0;
              network = "bitcoin";
              status = "unknown";
              metadata = "{}";
            }
          };
        }
      }
    );
  };

  // Get business logs for a merchant
  public func getMerchantBusinessLogs(
    merchantId : Text,
    state : BusinessState
  ) : [BusinessLogEntry] {
    
    let merchantLogIds = switch (state.merchantLogs.get(merchantId)) {
      case (?ids) ids;
      case null [];
    };
    
    Array.map<Text, BusinessLogEntry>(
      merchantLogIds,
      func(id) {
        switch (state.logs.get(id)) {
          case (?log) log;
          case null {
            // Return default log if not found (shouldn't happen)
            {
              id = id;
              timestamp = 0;
              eventType = "unknown";
              userId = Principal.fromText("aaaaa-aa");
              amount = 0;
              currency = "BTC";
              merchantId = ?merchantId;
              memo = null;
              fee = 0;
              network = "bitcoin";
              status = "unknown";
              metadata = "{}";
            }
          };
        }
      }
    );
  };

  // Get business analytics summary
  public func getBusinessAnalytics(state : BusinessState) : {
    totalLogs : Nat;
    totalVolume : Nat;
    totalTransactions : Nat;
    totalFees : Nat;
    uniqueUsers : Nat;
    uniqueMerchants : Nat;
  } {
    {
      totalLogs = state.logs.size();
      totalVolume = state.totalVolume;
      totalTransactions = state.totalTransactions;
      totalFees = state.totalFees;
      uniqueUsers = state.userLogs.size();
      uniqueMerchants = state.merchantLogs.size();
    }
  };

  // Get logs by event type
  public func getLogsByEventType(
    eventType : Text,
    state : BusinessState
  ) : [BusinessLogEntry] {
    
    var matchingLogs : [BusinessLogEntry] = [];
    
    for ((_, log) in state.logs.entries()) {
      if (log.eventType == eventType) {
        matchingLogs := Array.append(matchingLogs, [log]);
      };
    };
    
    matchingLogs;
  };

  // Get logs by time range
  public func getLogsByTimeRange(
    startTime : Nat,
    endTime : Nat,
    state : BusinessState
  ) : [BusinessLogEntry] {
    
    var matchingLogs : [BusinessLogEntry] = [];
    
    for ((_, log) in state.logs.entries()) {
      if (log.timestamp >= startTime and log.timestamp <= endTime) {
        matchingLogs := Array.append(matchingLogs, [log]);
      };
    };
    
    matchingLogs;
  };
};

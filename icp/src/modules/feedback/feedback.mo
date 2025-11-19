import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";

import Types "./schema";

module {
  public type Feedback = Types.Feedback;
  public type SubmitFeedbackRequest = Types.SubmitFeedbackRequest;
  public type FeedbackResult = Types.FeedbackResult;
  public type AnonymousFeedback = Types.AnonymousFeedback;
  public type HasSubmittedFeedbackByPrincipalResult = Types.HasSubmittedFeedbackByPrincipalResult;
  public type GetFeedbackByPrincipalResult = Types.GetFeedbackByPrincipalResult;
  public type HasSubmittedFeedbackByIPResult = Types.HasSubmittedFeedbackByIPResult;
  public type HasSubmittedFeedbackResult = Types.HasSubmittedFeedbackResult;
  public type ShouldShowFeedbackResult = Types.ShouldShowFeedbackResult;
  public type FeedbackStats = Types.FeedbackStats;

  public class FeedbackManager() {
    private var feedbackCounter: Nat = 0;
    private let feedbacks = HashMap.HashMap<Text, Feedback>(10, Text.equal, Text.hash);
    private let feedbacksByPrincipal = HashMap.HashMap<Text, Text>(10, Text.equal, Text.hash);
    private let feedbacksByIP = HashMap.HashMap<Text, Text>(10, Text.equal, Text.hash);

  public func submitFeedback(
    request: SubmitFeedbackRequest,
    submittedBy: ?Principal
  ): FeedbackResult {
    // Validate rating (1-5)
    if (request.rating < 1 or request.rating > 5) {
      return #err("Rating must be between 1 and 5");
    };

    // Validate required fields
    if (Text.size(request.name) == 0 or 
        Text.size(request.email) == 0 or 
        Text.size(request.message) == 0) {
      return #err("All fields are required");
    };

    // Generate unique ID with FDBCK_uuid convention
    feedbackCounter += 1;
    let timestamp = Time.now();
    let randomPart = Nat.toText(feedbackCounter);
    let feedbackId = "FDBCK_" # Nat.toText(Int.abs(timestamp)) # "_" # randomPart;

    // Create feedback record (email not stored in ICP)
    let feedback: Feedback = {
      id = feedbackId;
      name = request.name;
      rating = request.rating;
      message = request.message;
      userAgent = request.userAgent;
      timestamp = Time.now();
      submittedBy = switch (request.principal) {
        case (?p) { ?p };
        case null { submittedBy };
      };
      ipAddress = request.ipAddress;
    };

    // Store feedback
    feedbacks.put(feedbackId, feedback);

    // Track feedback by Principal if provided (use request.principal first, then submittedBy as fallback)
    let principalToTrack = switch (request.principal) {
      case (?p) { ?p };
      case null { submittedBy };
    };
    
    switch (principalToTrack) {
      case (?principal) {
        let principalText = Principal.toText(principal);
        feedbacksByPrincipal.put(principalText, feedbackId);
        Debug.print("Feedback tracked for Principal: " # principalText);
      };
      case null {
        Debug.print("Feedback submitted anonymously");
      };
    };

    // Track feedback by IP address if provided
    switch (request.ipAddress) {
      case (?ip) {
        feedbacksByIP.put(ip, feedbackId);
        Debug.print("Feedback tracked for IP: " # ip);
      };
      case null {
        Debug.print("No IP address provided");
      };
    };

    Debug.print("Feedback submitted: " # feedbackId);
    #ok(feedbackId);
  };

  public func getAllFeedbacks(): [Feedback] {
    let entries = Iter.toArray(feedbacks.entries());
    Array.map<(Text, Feedback), Feedback>(entries, func((_, feedback)) { feedback });
  };

  public func getAllFeedbacksAnonymous(): [Feedback] {
    let entries = Iter.toArray(feedbacks.entries());
    Array.map<(Text, Feedback), Feedback>(entries, func((_, feedback)) { 
      {
        feedback with
        submittedBy = null; // Anonymize the feedback
      }
    });
  };

  // Check if a Principal has already submitted feedback
  public func hasSubmittedFeedbackByPrincipal(principal: Principal): HasSubmittedFeedbackByPrincipalResult {
    let principalText = Principal.toText(principal);
    switch (feedbacksByPrincipal.get(principalText)) {
      case (?_feedbackId) {
        #ok(true);
      };
      case null {
        #ok(false);
      };
    };
  };

  // Check if an IP has already submitted feedback
  public func hasSubmittedFeedbackByIP(ipAddress: Text): HasSubmittedFeedbackByIPResult {
    switch (feedbacksByIP.get(ipAddress)) {
      case (?_feedbackId) {
        #ok(true);
      };
      case null {
        #ok(false);
      };
    };
  };

  // Check if user has submitted feedback (Principal or IP)
  public func hasSubmittedFeedback(principal: ?Principal, ipAddress: ?Text): HasSubmittedFeedbackResult {
    // Check Principal first if available
    switch (principal) {
      case (?p) {
        switch (hasSubmittedFeedbackByPrincipal(p)) {
          case (#ok(true)) { #ok(true) };
          case (#ok(false)) {
            // If Principal hasn't submitted, check IP
            switch (ipAddress) {
              case (?ip) {
                hasSubmittedFeedbackByIP(ip);
              };
              case null { #ok(false) };
            };
          };
          case (#err(msg)) { #err(msg) };
        };
      };
      case null {
        // No Principal, check IP only
        switch (ipAddress) {
          case (?ip) {
            hasSubmittedFeedbackByIP(ip);
          };
          case null { #ok(false) };
        };
      };
    };
  };

  // Get feedback by Principal
  public func getFeedbackByPrincipal(principal: Principal): GetFeedbackByPrincipalResult {
    let principalText = Principal.toText(principal);
    switch (feedbacksByPrincipal.get(principalText)) {
      case (?feedbackId) {
        switch (feedbacks.get(feedbackId)) {
          case (?feedback) {
            #ok(?feedback);
          };
          case null {
            #err("Feedback not found");
          };
        };
      };
      case null {
        #ok(null);
      };
    };
  };

  // Smart frequency check - should we show feedback modal?
  public func shouldShowFeedback(principal: ?Principal, ipAddress: ?Text, transactionCount: ?Nat): ShouldShowFeedbackResult {
    // Constants for smart frequency
    let FEEDBACK_COOLDOWN_DAYS = 30; // 30 days in nanoseconds
    let FEEDBACK_COOLDOWN_NS = FEEDBACK_COOLDOWN_DAYS * 24 * 60 * 60 * 1000000000;
    let MIN_TRANSACTIONS_FOR_FEEDBACK = 5;
    
    let currentTime = Time.now();
    
    // Check if user has submitted feedback
    switch (hasSubmittedFeedback(principal, ipAddress)) {
      case (#ok(false)) {
        // No feedback submitted yet - always show
        #ok(true);
      };
      case (#ok(true)) {
        // User has submitted feedback - check if enough time has passed
        switch (principal) {
          case (?p) {
            switch (getFeedbackByPrincipal(p)) {
              case (#ok(?feedback)) {
                let timeSinceLastFeedback = currentTime - feedback.timestamp;
                let hasEnoughTransactions = switch (transactionCount) {
                  case (?count) { count >= MIN_TRANSACTIONS_FOR_FEEDBACK };
                  case null { true }; // If no transaction count, assume enough
                };
                
                // Show feedback if enough time has passed AND enough transactions
                if (timeSinceLastFeedback > FEEDBACK_COOLDOWN_NS and hasEnoughTransactions) {
                  #ok(true);
                } else {
                  #ok(false);
                };
              };
              case (#ok(null)) {
                // No feedback found but hasSubmittedFeedback returned true - show anyway
                #ok(true);
              };
              case (#err(_)) {
                // Error getting feedback - show anyway (fail-safe)
                #ok(true);
              };
            };
          };
          case null {
            // No principal - check IP only (simplified logic)
            #ok(false);
          };
        };
      };
      case (#err(_)) {
        // Error checking - show anyway (fail-safe)
        #ok(true);
      };
    };
  };

  // Get total feedback count
  public func getFeedbackCount(): Nat {
    feedbacks.size();
  };

  // Get feedback statistics
  public func getFeedbackStats(): FeedbackStats {
    let totalCount = feedbacks.size();
    if (totalCount == 0) {
      return {
        totalCount = 0;
        averageRating = 0.0;
      };
    };

    var totalRating = 0;
    for ((_, feedback) in feedbacks.entries()) {
      totalRating += feedback.rating;
    };

    let averageRating = Float.fromInt(totalRating) / Float.fromInt(totalCount);
    
    {
      totalCount = totalCount;
      averageRating = averageRating;
    };
  };

  // Delete feedback by ID (admin only)
  public func deleteFeedback(feedbackId: Text, admin: Principal, caller: Principal): {
    success: Bool;
    message: Text;
  } {
    if (caller != admin) {
      return {
        success = false;
        message = "Only admin can delete feedbacks";
      };
    };

    switch (feedbacks.get(feedbackId)) {
      case (?feedback) {
        // Remove from main feedbacks HashMap
        feedbacks.delete(feedbackId);
        
        // Remove from principal tracking if exists
        switch (feedback.submittedBy) {
          case (?principal) {
            let principalText = Principal.toText(principal);
            feedbacksByPrincipal.delete(principalText);
          };
          case null {};
        };
        
        // Remove from IP tracking if exists
        switch (feedback.ipAddress) {
          case (?ip) {
            feedbacksByIP.delete(ip);
          };
          case null {};
        };
        
        Debug.print("Feedback deleted: " # feedbackId);
        {
          success = true;
          message = "Feedback deleted successfully";
        };
      };
      case null {
        {
          success = false;
          message = "Feedback not found";
        };
      };
    };
  };

  // Clear all feedbacks (admin only)
  public func clearAllFeedbacks(admin: Principal, caller: Principal): {
    success: Bool;
    message: Text;
  } {
    if (caller != admin) {
      return {
        success = false;
        message = "Only admin can clear all feedbacks";
      };
    };

    // Clear all HashMaps by iterating and deleting each entry
    for ((key, _) in feedbacks.entries()) {
      feedbacks.delete(key);
    };
    
    for ((key, _) in feedbacksByPrincipal.entries()) {
      feedbacksByPrincipal.delete(key);
    };
    
    for ((key, _) in feedbacksByIP.entries()) {
      feedbacksByIP.delete(key);
    };
    
    // Reset counter
    feedbackCounter := 0;
    
    Debug.print("All feedbacks cleared by admin");
    {
      success = true;
      message = "All feedbacks cleared successfully";
    };
  };
};
};

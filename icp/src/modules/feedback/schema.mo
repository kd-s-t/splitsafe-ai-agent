import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

module {
  // Feedback types
  public type Feedback = {
    id: Text;
    name: Text;
    rating: Nat;
    message: Text;
    userAgent: ?Text;
    timestamp: Int;
    submittedBy: ?Principal;
    ipAddress: ?Text; // Store IP for anonymous users and spam prevention
  };

  public type SubmitFeedbackRequest = {
    name: Text;
    email: Text;
    rating: Nat;
    message: Text;
    userAgent: ?Text;
    ipAddress: ?Text; // IP address for tracking
    principal: ?Principal; // Principal ID for tracking
  };

  public type FeedbackResult = {
    #ok: Text;
    #err: Text;
  };

  // Anonymous feedback type (without personal info)
  public type AnonymousFeedback = {
    id: Text;
    rating: Nat;
    message: Text;
    timestamp: Int;
  };

  // Check if Principal has submitted feedback
  public type HasSubmittedFeedbackByPrincipalResult = {
    #ok: Bool;
    #err: Text;
  };

  // Get feedback by Principal
  public type GetFeedbackByPrincipalResult = {
    #ok: ?Feedback;
    #err: Text;
  };

  // Check if IP has submitted feedback (for anonymous users)
  public type HasSubmittedFeedbackByIPResult = {
    #ok: Bool;
    #err: Text;
  };

  // Check if user has submitted feedback (Principal or IP)
  public type HasSubmittedFeedbackResult = {
    #ok: Bool;
    #err: Text;
  };

  // Check if user should see feedback modal (smart frequency)
  public type ShouldShowFeedbackResult = {
    #ok: Bool;
    #err: Text;
  };

  // Feedback statistics
  public type FeedbackStats = {
    totalCount: Nat;
    averageRating: Float;
  };
};

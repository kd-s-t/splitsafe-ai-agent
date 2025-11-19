import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Nat "mo:base/Nat";

module {
    public let INITIAL_REPUTATION : Nat = 100;
    public let MIN_REPUTATION_FOR_ESCROW : Nat = 50;
    public let FRAUD_THRESHOLD : Nat = 3;
    public let QUICK_REFUND_WINDOW : Nat = 300_000_000_000; // 5 minutes in nanoseconds
    public let REPUTATION_PENALTY_QUICK_REFUND : Int = -10;
    public let REPUTATION_PENALTY_DECLINE : Int = -5;
    public let REPUTATION_BONUS_SUCCESS : Int = 2;
    public let REPUTATION_MAX : Nat = 200;

    public type FraudActivity = {
        timestamp : Int;
        activityType : Text;
        transactionId : Text;
    };

    public type ReputationStats = {
        currentScore : Nat;
        totalTransactions : Nat;
        successfulTransactions : Nat;
        declinedTransactions : Nat;
        quickRefunds : Nat;
        isFlaggedForFraud : Bool;
    };

    public func getUserReputation(reputation : HashMap.HashMap<Principal, Nat>, user : Principal) : Nat {
        switch (reputation.get(user)) {
            case (?score) { score };
            case null { INITIAL_REPUTATION };
        };
    };

    public func updateReputation(
        reputation : HashMap.HashMap<Principal, Nat>,
        user : Principal,
        change : Int
    ) : Nat {
        let currentScore = getUserReputation(reputation, user);
        let newScore = if (change > 0) {
            Nat.min(currentScore + Int.abs(change), REPUTATION_MAX)
        } else {
            if (currentScore > Int.abs(change)) {
                currentScore - Int.abs(change) : Nat
            } else {
                0 : Nat
            }
        };
        reputation.put(user, newScore);
        newScore
    };

    public func recordFraudActivity(
        fraudHistory : HashMap.HashMap<Principal, [FraudActivity]>,
        user : Principal,
        activityType : Text,
        transactionId : Text
    ) {
        let currentTime = Time.now();
        let newActivity = {
            timestamp = currentTime;
            activityType = activityType;
            transactionId = transactionId;
        };
        
        let existingActivities = switch (fraudHistory.get(user)) {
            case (?activities) { activities };
            case null { [] };
        };
        
        fraudHistory.put(user, Array.append(existingActivities, [newActivity]));
    };

    public func detectFraudPattern(
        fraudHistory : HashMap.HashMap<Principal, [FraudActivity]>,
        user : Principal
    ) : Bool {
        switch (fraudHistory.get(user)) {
            case (?activities) {
                let currentTime = Time.now();
                let recentActivities = Array.filter<FraudActivity>(
                    activities,
                    func(activity : FraudActivity) : Bool {
                        currentTime - activity.timestamp < QUICK_REFUND_WINDOW
                    }
                );
                Array.size(recentActivities) >= FRAUD_THRESHOLD
            };
            case null { false };
        };
    };

    public func canCreateEscrow(
        reputation : HashMap.HashMap<Principal, Nat>,
        fraudHistory : HashMap.HashMap<Principal, [FraudActivity]>,
        user : Principal
    ) : Bool {
        let userReputation = getUserReputation(reputation, user);
        let isFlaggedForFraud = detectFraudPattern(fraudHistory, user);
        
        userReputation >= MIN_REPUTATION_FOR_ESCROW and not isFlaggedForFraud
    };


    public func getReputationStats(
        reputation : HashMap.HashMap<Principal, Nat>,
        fraudHistory : HashMap.HashMap<Principal, [FraudActivity]>,
        user : Principal
    ) : ReputationStats {
        let currentScore = getUserReputation(reputation, user);
        let isFlaggedForFraud = detectFraudPattern(fraudHistory, user);
        
        let userFraudActivities = switch (fraudHistory.get(user)) {
            case (?activities) { activities };
            case null { [] };
        };
        
        let quickRefunds = Array.size(Array.filter<FraudActivity>(
            userFraudActivities,
            func(activity : FraudActivity) : Bool {
                activity.activityType == "quick_refund"
            }
        ));
        
        {
            currentScore = currentScore;
            totalTransactions = 0; // No longer tracking transaction history
            successfulTransactions = 0;
            declinedTransactions = Array.size(userFraudActivities);
            quickRefunds = quickRefunds;
            isFlaggedForFraud = isFlaggedForFraud;
        }
    };
}; 
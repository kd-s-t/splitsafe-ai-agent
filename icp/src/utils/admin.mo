import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Reputation "../modules/users/reputation";

module {
    // Admin Management Functions
    public func setInitialBalance(
        balances : HashMap.HashMap<Principal, Nat>,
        admin : Principal,
        caller : Principal,
        principal : Principal,
        amount : Nat
    ) : Bool {
        if (caller == admin) {
            balances.put(principal, amount);
            true
        } else {
            false
        }
    };

    public func resetUserReputation(
        reputation : HashMap.HashMap<Principal, Nat>,
        fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>,
        admin : Principal,
        caller : Principal,
        user : Principal,
        logs : [Text]
    ) : {
        success : Bool;
        newLogs : [Text];
    } {
        if (caller == admin) {
            reputation.put(user, Reputation.INITIAL_REPUTATION);
            fraudHistory.put(user, []);
            let newLogs = Array.append<Text>(logs, ["Reputation reset for " # Principal.toText(user) # " by admin"]);
            { success = true; newLogs = newLogs }
        } else {
            { success = false; newLogs = logs }
        }
    };
}; 
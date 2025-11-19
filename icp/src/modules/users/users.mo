import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";

module {

    public func generateUserId(principal : Principal) : Text {
        let timestamp = Time.now();
        let principalText = Principal.toText(principal);
        let randomSuffix = Nat.toText(Int.abs(timestamp) % 1000000);
        "USER_" # Nat.toText(Int.abs(timestamp)) # "-" # principalText # "-" # randomSuffix
    };

    public type UserInfo = {
        nickname : ?Text;
        username : ?Text;
        picture : ?Text;
        email : ?Text;
        balance : Nat;
    };

    public func getUserInfo(
        names : HashMap.HashMap<Principal, Text>,
        usernames : HashMap.HashMap<Principal, Text>,
        pictures : HashMap.HashMap<Principal, Text>,
        emails : HashMap.HashMap<Principal, Text>,
        balances : HashMap.HashMap<Principal, Nat>,
        principal : Principal
    ) : UserInfo {
        {
            nickname = names.get(principal);
            username = usernames.get(principal);
            picture = pictures.get(principal);
            email = emails.get(principal);
            balance = switch (balances.get(principal)) {
                case null 0;
                case (?balance) balance;
            };
        }
    };

    public func getInfo(
        names : HashMap.HashMap<Principal, Text>,
        usernames : HashMap.HashMap<Principal, Text>,
        pictures : HashMap.HashMap<Principal, Text>,
        emails : HashMap.HashMap<Principal, Text>,
        balances : HashMap.HashMap<Principal, Nat>,
        principal : Principal,
        caller : Principal
    ) : ?UserInfo {
        if (caller == principal) {
            ?getUserInfo(names, usernames, pictures, emails, balances, principal)
        } else {
            null
        }
    };

    public type SaveInfoRequest = {
        nickname : ?Text;
        username : ?Text;
        picture : ?Text;
        email : ?Text;
    };

    public func saveInfo(
        names : HashMap.HashMap<Principal, Text>,
        usernames : HashMap.HashMap<Principal, Text>,
        pictures : HashMap.HashMap<Principal, Text>,
        emails : HashMap.HashMap<Principal, Text>,
        principal : Principal,
        request : SaveInfoRequest
    ) {
        switch (request.nickname) {
            case null {};
            case (?nickname) {
                if (Text.size(nickname) > 0) {
                    names.put(principal, nickname);
                };
            };
        };

        switch (request.username) {
            case null {};
            case (?username) {
                if (Text.size(username) > 0) {
                    usernames.put(principal, username);
                };
            };
        };

        switch (request.picture) {
            case null {};
            case (?picture) {
                if (Text.size(picture) > 0) {
                    pictures.put(principal, picture);
                };
            };
        };

        switch (request.email) {
            case null {};
            case (?email) {
                if (Text.size(email) > 0) {
                    emails.put(principal, email);
                };
            };
        };
    };

    public type UserWithPrincipal = {
        principal : Principal;
        userInfo : UserInfo;
    };

    public func getAllUsers(
        names : HashMap.HashMap<Principal, Text>,
        usernames : HashMap.HashMap<Principal, Text>,
        pictures : HashMap.HashMap<Principal, Text>,
        emails : HashMap.HashMap<Principal, Text>,
        balances : HashMap.HashMap<Principal, Nat>
    ) : [UserWithPrincipal] {
        let allPrincipals = Iter.toArray(names.entries());
        Array.map<(Principal, Text), UserWithPrincipal>(
            allPrincipals,
            func((principal, _name)) : UserWithPrincipal {
                {
                    principal = principal;
                    userInfo = getUserInfo(names, usernames, pictures, emails, balances, principal);
                }
            }
        )
    };

}; 
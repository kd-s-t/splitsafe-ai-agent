import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

module {
  public func getBalance(
    map : HashMap.HashMap<Principal, Nat>,
    principal : Principal
  ) : Nat {
    switch (map.get(principal)) {
      case (?bal) bal;
      case null 0;
    }
  };



  public func increaseBalance(
    map : HashMap.HashMap<Principal, Nat>,
    principal : Principal,
    amount : Nat
  ) : () {
    let current = getBalance(map, principal);
    map.put(principal, current + amount);
  };

  public func decreaseBalance(
    map : HashMap.HashMap<Principal, Nat>,
    principal : Principal,
    amount : Nat
  ) : () {
    let current = getBalance(map, principal);
    assert current >= amount;
    map.put(principal, current - amount);
  };
}; 
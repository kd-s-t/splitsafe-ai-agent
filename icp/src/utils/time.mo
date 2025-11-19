import Time "mo:base/Time";
import Int "mo:base/Int";

module {
  public func now() : Nat {
    Int.abs(Time.now())
  };

  public func minutesToNanos(minutes : Nat) : Nat {
    minutes * 60 * 1_000_000_000;
  };

  public func isAfter(start : Nat, delayNanos : Nat) : Bool {
    let current = now();
    current >= (start + delayNanos)
  };

  public func hasElapsed(start : Nat, durationNanos : Nat) : Bool {
    isAfter(start, durationNanos)
  };
};

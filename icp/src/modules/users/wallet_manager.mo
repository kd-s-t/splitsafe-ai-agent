import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

module {
  public type WalletManagerState = {
    userBitcoinAddresses : HashMap.HashMap<Principal, Text>;
    userSeiAddresses : HashMap.HashMap<Principal, Text>;
    seiBalances : HashMap.HashMap<Principal, Nat>;
  };

  public type WalletResult = {
    #ok : {
      btcAddress : ?Text;
      seiAddress : ?Text;
      owner : Principal;
      subaccount : ?Blob;
    };
    #err : Text;
  };

  public func subaccountFromPrincipal(p : Principal) : Blob {
    let src = Blob.toArray(Principal.toBlob(p));
    let out = Array.tabulate<Nat8>(
      32,
      func(i : Nat) : Nat8 {
        if (i == 0) 0x53 else if (i == 1) 0x41 else if (i == 2) 0x46 else if (i == 3) 0x45 else if (i < 4 + src.size() and i >= 4) src[i - 4] else 0;
      },
    );
    Blob.fromArray(out);
  };

  public func generateFakeBitcoinAddress() : Text {
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  };

  public func generateFakeSeiAddress() : Text {
    "sei1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  };

  public func requestCkbtcWallet(
    caller : Principal,
    state : WalletManagerState
  ) : (WalletResult, WalletManagerState) {
    let fakeAddress = generateFakeBitcoinAddress();

    let result = #ok({
      btcAddress = ?fakeAddress;
      seiAddress = null;
      owner = caller;
      subaccount = ?subaccountFromPrincipal(caller);
    });

    (result, state);
  };

  public func getOrRequestCkbtcWallet(
    caller : Principal,
    state : WalletManagerState
  ) : (WalletResult, WalletManagerState) {
    switch (state.userBitcoinAddresses.get(caller)) {
      case (?existingAddress) {
        let result = #ok({
          btcAddress = ?existingAddress;
          seiAddress = null;
          owner = caller;
          subaccount = ?subaccountFromPrincipal(caller);
        });
        (result, state);
      };
      case null {
        let fakeAddress = generateFakeBitcoinAddress();
        state.userBitcoinAddresses.put(caller, fakeAddress);

        let result = #ok({
          btcAddress = ?fakeAddress;
          seiAddress = null;
          owner = caller;
          subaccount = ?subaccountFromPrincipal(caller);
        });
        (result, state);
      };
    };
  };

  public func getOrRequestSeiWallet(
    caller : Principal,
    state : WalletManagerState
  ) : (WalletResult, WalletManagerState) {
    switch (state.userSeiAddresses.get(caller)) {
      case (?existingAddress) {
        let result = #ok({
          btcAddress = null;
          seiAddress = ?existingAddress;
          owner = caller;
          subaccount = null;
        });
        (result, state);
      };
      case null {
        let fakeAddress = generateFakeSeiAddress();
        state.userSeiAddresses.put(caller, fakeAddress);

        let result = #ok({
          btcAddress = null;
          seiAddress = ?fakeAddress;
          owner = caller;
          subaccount = null;
        });
        (result, state);
      };
    };
  };

  public func requestSeiWalletAnonymous(
    caller : Principal,
    seiAddress : Text,
    state : WalletManagerState
  ) : (WalletResult, WalletManagerState) {
    state.userSeiAddresses.put(caller, seiAddress);

    switch (state.seiBalances.get(caller)) {
      case null {
        state.seiBalances.put(caller, 5_000_000);
      };
      case (?_) {};
    };

    let result = #ok({
      btcAddress = null;
      seiAddress = ?seiAddress;
      owner = caller;
      subaccount = null;
    });

    (result, state);
  };
};

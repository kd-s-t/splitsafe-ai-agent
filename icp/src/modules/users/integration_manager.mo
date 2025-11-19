import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";

import _Types "schema";
import CKBTC "ckbtc";
import SEI "sei";

module {
  public type IntegrationManagerState = {
    userBitcoinAddresses : HashMap.HashMap<Principal, Text>;
    userSeiAddresses : HashMap.HashMap<Principal, Text>;
    seiBalances : HashMap.HashMap<Principal, Nat>;
  };

  public type IntegrationResult = {
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

  public func getCkbtcBalance(
    user : Principal,
    ckbtcIntegration : CKBTC.CKBTCIntegration
  ) : async {
    #ok : Nat;
    #err : Text;
  } {
    let result = await ckbtcIntegration.getBitcoinBalance({
      owner = user;
      subaccount = null;
    });
    switch (result) {
      case (#ok(balance)) { #ok(balance) };
      case (#err(error)) { #err(error) };
    };
  };

  public func getOrRequestCkbtcWallet(
    caller : Principal,
    state : IntegrationManagerState
  ) : ({
    #ok : {
      btcAddress : Text;
      owner : Principal;
      subaccount : Blob;
    };
    #err : Text;
  }, IntegrationManagerState) {
    switch (state.userBitcoinAddresses.get(caller)) {
      case (?existingAddress) {
        let result = #ok({
          btcAddress = existingAddress;
          owner = caller;
          subaccount = subaccountFromPrincipal(caller);
        });
        (result, state);
      };
      case null {
        let fakeAddress = generateFakeBitcoinAddress();
        state.userBitcoinAddresses.put(caller, fakeAddress);

        let result = #ok({
          btcAddress = fakeAddress;
          owner = caller;
          subaccount = subaccountFromPrincipal(caller);
        });
        (result, state);
      };
    };
  };

  public func getSeiBalance(
    user : Principal,
    seiIntegration : SEI.SEIIntegration
  ) : async {
    #ok : Nat;
    #err : Text;
  } {
    let result = await seiIntegration.getSeiBalance({
      owner = user;
      subaccount = null;
    });
    switch (result) {
      case (#ok(balance)) { #ok(balance) };
      case (#err(error)) { #err(error) };
    };
  };

  public func getOrRequestSeiWallet(
    caller : Principal,
    state : IntegrationManagerState
  ) : ({
    #ok : { seiAddress : Text; owner : Principal };
    #err : Text;
  }, IntegrationManagerState) {
    switch (state.userSeiAddresses.get(caller)) {
      case (?existingAddress) {
        let result = #ok({
          seiAddress = existingAddress;
          owner = caller;
        });
        (result, state);
      };
      case null {
        let fakeAddress = generateFakeSeiAddress();
        state.userSeiAddresses.put(caller, fakeAddress);

        let result = #ok({
          seiAddress = fakeAddress;
          owner = caller;
        });
        (result, state);
      };
    };
  };

  public func requestSeiWalletAnonymous(
    caller : Principal,
    seiAddress : Text,
    state : IntegrationManagerState
  ) : ({
    #ok : { owner : Principal; seiAddress : Text };
    #err : Text;
  }, IntegrationManagerState) {
    state.userSeiAddresses.put(caller, seiAddress);

    switch (state.seiBalances.get(caller)) {
      case null {
        state.seiBalances.put(caller, 5_000_000);
      };
      case (?_) {};
    };

    let result = #ok({
      owner = caller;
      seiAddress = seiAddress;
    });

    (result, state);
  };

  public func getSeiNetworkInfo(seiIntegration : SEI.SEIIntegration) : {
    name : Text;
    chainId : Text;
    rpcUrl : Text;
    explorerUrl : Text;
    prefix : Text;
    isTestnet : Bool;
  } {
    seiIntegration.getNetworkInfo();
  };

  public func getSeiFaucetUrl(seiIntegration : SEI.SEIIntegration) : ?Text {
    seiIntegration.getFaucetUrl();
  };

  public func requestCkbtcWallet(
    caller : Principal,
    state : IntegrationManagerState
  ) : ({
    #ok : {
      btcAddress : Text;
      owner : Principal;
      subaccount : Blob;
    };
    #err : Text;
  }, IntegrationManagerState) {
    let (result, updatedState) = getOrRequestCkbtcWallet(caller, state);
    
    switch (result) {
      case (#ok(wallet)) {
        let finalResult = #ok({
          btcAddress = wallet.btcAddress;
          owner = wallet.owner;
          subaccount = wallet.subaccount;
        });
        (finalResult, updatedState);
      };
      case (#err(error)) {
        (#err(error), updatedState);
      };
    };
  };

  public func getCkbtcBalanceAnonymous() : {
    #ok : Nat;
    #err : Text;
  } {
    #ok(0);
  };

  public func getCkbtcAddressAnonymous(state : IntegrationManagerState) : ({
    #ok : {
      btcAddress : Text;
      owner : Principal;
      subaccount : Blob;
    };
    #err : Text;
  }, IntegrationManagerState) {
    // For anonymous users, generate a fake address for testing
    let fakeAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    let fakeOwner = Principal.fromText("2vxsx-fae"); // Anonymous principal
    let fakeSubaccount = subaccountFromPrincipal(fakeOwner);
    
    let result = #ok({
      btcAddress = fakeAddress;
      owner = fakeOwner;
      subaccount = fakeSubaccount;
    });
    
    (result, state);
  };

  public func getSeiBalanceAnonymous() : {
    #ok : Nat;
    #err : Text;
  } {
    #ok(0);
  };
};

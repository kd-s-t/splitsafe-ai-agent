import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

import Types "./schema";
import Vouchers "./voucher";

module {

  private let MIN_AMOUNT : Nat = 1; // 1 satoshi minimum
  private let MAX_AMOUNT : Nat = 1000000000000; // 10,000 BTC in satoshis

  public type VoucherManagerState = {
    userVouchers : HashMap.HashMap<Principal, HashMap.HashMap<Text, Types.Voucher>>;
    bitcoinBalances : HashMap.HashMap<Principal, Nat>;
  };

  public type VoucherResult = {
    #ok : Text;
    #err : Text;
  };

  public func validateVoucherInput(
    code : Text,
    amount : Nat,
    description : Text,
    expiredAt : Int,
    ownerId : Principal,
    state : VoucherManagerState,
  ) : ?Text {
    // Voucher code validation
    if (code.size() == 0) {
      return ?"Voucher code cannot be empty";
    };

    if (code.size() > 20) {
      return ?"Voucher code too long (max 20 characters)";
    };

    // Check for valid characters in voucher code (alphanumeric and hyphens only)
    for (char in code.chars()) {
      if (not ((char >= 'A' and char <= 'Z') or (char >= 'a' and char <= 'z') or (char >= '0' and char <= '9') or char == '-')) {
        return ?"Voucher code can only contain letters, numbers, and hyphens";
      };
    };

    // Check if voucher code already exists for this user
    switch (state.userVouchers.get(ownerId)) {
      case (?vouchers) {
        for ((_, voucher) in vouchers.entries()) {
          if (voucher.code == code) {
            return ?"Voucher code already exists";
          };
        };
      };
      case null {};
    };

    // Description validation
    if (description.size() > 500) {
      return ?"Description too long (max 500 characters)";
    };

    // Amount validation
    if (amount < MIN_AMOUNT) {
      // 1 satoshi minimum
      return ?"Amount must be at least 1 satoshi";
    };

    if (amount > MAX_AMOUNT) {
      // 10,000 BTC in satoshis
      return ?"Amount cannot exceed 10,000 BTC";
    };

    // Expiration date validation
    if (expiredAt <= 0) {
      return ?"Expiration date must be provided";
    };

    if (expiredAt <= Time.now()) {
      return ?"Expiration date must be in the future";
    };
    // Check user balance
    let userBalance = switch (state.bitcoinBalances.get(ownerId)) {
      case (?balance) balance;
      case null 0;
    };

    Debug.print("🔍 [VOUCHER] Checking balance for principal: " # Principal.toText(ownerId));
    Debug.print("🔍 [VOUCHER] User balance: " # Nat.toText(userBalance) # " satoshis");
    Debug.print("🔍 [VOUCHER] Required amount: " # Nat.toText(amount) # " satoshis");

    if (userBalance < amount) {
      Debug.print("❌ [VOUCHER] Insufficient balance: " # Nat.toText(userBalance) # " < " # Nat.toText(amount));
      return ?"Insufficient balance";
    };

    Debug.print("✅ [VOUCHER] Balance check passed");
    null;
  };

  public func validateRedeemVoucherInput(
    voucher : Types.Voucher,
    redeemer : Principal
  ) : ?Text {

    // Check if user is trying to redeem their own voucher
    if (voucher.createdBy == redeemer) {
      return ?"Cannot redeem your own voucher";
    };

    // Check if already redeemed
    if (voucher.redeemAt > 0) {
      return ?"Voucher already redeemed";
    };

    if (voucher.expiredAt <= Time.now()) {
      return ?"Voucher has expired";
    };

    null;
  };

  public func createVoucher(
    ownerId : Principal,
    code : Text,
    amount : Nat,
    description : Text,
    expiredAt : Int,
    state : VoucherManagerState,
  ) : (VoucherResult, VoucherManagerState) {
    switch (validateVoucherInput(code, amount, description, expiredAt, ownerId, state)) {
      case (?error) {
        return (#err(error), state);
      };
      case null {};
    };

    let vouchers = switch (state.userVouchers.get(ownerId)) {
      case (?existingVouchers) existingVouchers;
      case null {
        let newVouchers = HashMap.HashMap<Text, Types.Voucher>(10, Text.equal, Text.hash);
        newVouchers;
      };
    };

    let success = Vouchers.createVoucher(code, amount, description, expiredAt, ownerId, vouchers, state.bitcoinBalances);

    if (success) {
      // Create a new state with the updated vouchers and balances
      let updatedState = {
        userVouchers = state.userVouchers;
        bitcoinBalances = state.bitcoinBalances;
      };
      // Put the vouchers back into the state
      updatedState.userVouchers.put(ownerId, vouchers);
      (#ok("Voucher created successfully"), updatedState);
    } else {
      (#err("Failed to create voucher - insufficient balance or duplicate code"), state);
    };
  };

  public func deleteVoucher(
    voucherId : Text,
    state : VoucherManagerState,
  ) : (VoucherResult, VoucherManagerState) {
    // Extract ownerId from voucherId (format: VOU_ownerId_timestamp)
    let parts = Text.split(voucherId, #char '_');
    let partsArray = Iter.toArray(parts);

    if (partsArray.size() >= 2) {
      let ownerIdText = partsArray[1];
      let ownerId = Principal.fromText(ownerIdText);

      switch (state.userVouchers.get(ownerId)) {
        case (?vouchers) {
          switch (vouchers.get(voucherId)) {
            case (?voucher) {
              let userVouchers = HashMap.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);
              let success = Vouchers.cancelVoucher(voucherId, ownerId, vouchers, userVouchers, state.bitcoinBalances);

              if (success) {
                // Create a new state with the updated vouchers
                let updatedState = {
                  userVouchers = state.userVouchers;
                  bitcoinBalances = state.bitcoinBalances;
                };
                // Put the vouchers back into the state
                updatedState.userVouchers.put(ownerId, vouchers);
                (#ok("Voucher cancelled successfully"), updatedState);
              } else {
                (#err("Failed to cancel voucher"), state);
              };
            };
            case null {
              (#err("Voucher not found"), state);
            };
          };
        };
        case null {
          (#err("No vouchers found"), state);
        };
      };
    } else {
      (#err("Invalid voucher ID format"), state);
    };
  };

  public func updateVoucher(
    voucherId : Text,
    description : Text,
    expiredAt : Int,
    state : VoucherManagerState,
  ) : (VoucherResult, VoucherManagerState) {
    if (description.size() > 500) {
      return (#err("Description too long (max 500 characters)"), state);
    };

    // Extract ownerId from voucherId (format: VOU_ownerId_timestamp)
    let parts = Text.split(voucherId, #char '_');
    let partsArray = Iter.toArray(parts);

    if (partsArray.size() >= 2) {
      let ownerIdText = partsArray[1];
      let ownerId = Principal.fromText(ownerIdText);

      switch (state.userVouchers.get(ownerId)) {
        case (?vouchers) {
          switch (vouchers.get(voucherId)) {
            case (?voucher) {
              let success = Vouchers.updateVoucher(vouchers, voucherId, description, expiredAt, ownerId);

              if (success) {
                // Create a new state with the updated vouchers
                let updatedState = {
                  userVouchers = state.userVouchers;
                  bitcoinBalances = state.bitcoinBalances;
                };
                // Put the vouchers back into the state
                updatedState.userVouchers.put(ownerId, vouchers);
                (#ok("Voucher updated successfully"), updatedState);
              } else {
                (#err("Failed to update voucher"), state);
              };
            };
            case null {
              (#err("Voucher not found"), state);
            };
          };
        };
        case null {
          (#err("No vouchers found"), state);
        };
      };
    } else {
      (#err("Invalid voucher ID format"), state);
    };
  };

  public func getVouchers(
    ownerId : Principal,
    state : VoucherManagerState,
  ) : [Types.Voucher] {
    switch (state.userVouchers.get(ownerId)) {
      case (?vouchers) {
        Vouchers.getVouchers(vouchers, ownerId);
      };
      case null { [] };
    };
  };

  public func validateVoucher(
    voucherCode : Text,
    state : VoucherManagerState,
  ) : Types.ValidateVoucherResult {
    // Search through all user vouchers to find the voucher code
    for ((ownerId, vouchers) in state.userVouchers.entries()) {
      let result = Vouchers.validateVoucher(voucherCode, vouchers);
      if (result.valid) {
        return result;
      };
    };

    {
      valid = false;
      voucher = null;
      error = ?"Voucher not found";
    };
  };

  public func redeemVoucher(
    voucherCode : Text,
    redeemer : Principal,
    state : VoucherManagerState,
  ) : (VoucherResult, VoucherManagerState) {

    let voucher = getVoucherByCode(voucherCode, state);

    switch (voucher) {
      case (?v) {
        switch (validateRedeemVoucherInput(v, redeemer)) {
          //validate redeem input
          case (?error) {
            return (#err(error), state);
          };
          case null {
            // Get the vouchers HashMap for the voucher owner
            let vouchers = switch (state.userVouchers.get(v.createdBy)) {
              case (?vouchers) vouchers;
              case null {
                return (#err("Voucher not found"), state);
              };
            };

            let redeemedVoucher = Vouchers.redeemVoucher(v, redeemer, state.bitcoinBalances);

            // Update the voucher in the vouchers HashMap
            vouchers.put(v.id, redeemedVoucher);

            // Create a new state with the updated vouchers
            let updatedState = {
              userVouchers = state.userVouchers;
              bitcoinBalances = state.bitcoinBalances;
            };

            return (#ok("Voucher redeemed successfully"), updatedState);
          };
        };
      };
      case null {
        return (#err("Voucher not found"), state);
      };
    };
  };

  public func getVoucher(
    voucherId : Text,
    state : VoucherManagerState,
  ) : ?Types.Voucher {
    // Extract ownerId from voucherId (format: VOU_ownerId_timestamp)
    let parts = Text.split(voucherId, #char '_');
    let partsArray = Iter.toArray(parts);

    if (partsArray.size() >= 2) {
      let ownerIdText = partsArray[1];
      let ownerId = Principal.fromText(ownerIdText);

      switch (state.userVouchers.get(ownerId)) {
        case (?vouchers) {
          Vouchers.getVoucher(voucherId, vouchers);
        };
        case null { null };
      };
    } else {
      null;
    };
  };

  public func getVoucherByCode(
    code : Text,
    state : VoucherManagerState,
  ) : ?Types.Voucher {
    // Search through all user vouchers to find the voucher code
    for ((ownerId, vouchers) in state.userVouchers.entries()) {
      switch (Vouchers.getVoucherByCode(code, vouchers)) {
        case (?voucher) { return ?voucher };
        case null {};
      };
    };
    null;
  };
};

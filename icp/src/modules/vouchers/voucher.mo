// Voucher System - Motoko Implementation
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Types "./schema";
import TimeUtil "../../utils/time";

module {

  // Get user vouchers
  public func getVouchers(
    vouchers : HashMap.HashMap<Text, Types.Voucher>,
    principalid : Principal,
  ) : [Types.Voucher] {
    let entries = Iter.toArray(vouchers.entries());
    let allVouchers = Array.map<(Text, Types.Voucher), Types.Voucher>(
      entries,
      func(entry) { entry.1 },
    );
    // Filter vouchers to only return those owned by the caller
    Array.filter<Types.Voucher>(
      allVouchers,
      func(voucher) { voucher.createdBy == principalid },
    );
  };

  // Create voucher
  public func createVoucher(
    code : Text,
    amount : Nat,
    description : Text,
    expiredAt : Int,
    creator : Principal,
    vouchers : HashMap.HashMap<Text, Types.Voucher>,
    bitcoinBalances : HashMap.HashMap<Principal, Nat>,
  ) : Bool {
    // Create voucher
    let voucherId = "VOU_" # Principal.toText(creator) # "_" # Nat.toText(TimeUtil.now());

    let voucher : Types.Voucher = {
      id = voucherId;
      code = code;
      amount = amount;
      description = description;
      createdBy = creator;
      expiredAt = expiredAt;
      createdAt = Time.now();
      redeemAt = 0; // 0 means not redeemed
    };

    // Deduct amount from creator's balance
    let creatorBalance = switch (bitcoinBalances.get(creator)) {
      case (?balance) { balance };
      case null { 0 };
    };

    let newBalance : Nat = if (creatorBalance >= amount) { 
      creatorBalance - amount 
    } else { 
      0 
    };
    bitcoinBalances.put(creator, newBalance);

    // Store voucher
    vouchers.put(voucherId, voucher);

    return true;
  };

  // Get user balance
  public func getUserBalance(user : Principal, userBalances : HashMap.HashMap<Principal, Nat>) : Nat {
    switch (userBalances.get(user)) {
      case (?balance) { balance };
      case null { 0 };
    };
  };

  // Validate voucher
  public func validateVoucher(voucherCode : Text, vouchers : HashMap.HashMap<Text, Types.Voucher>) : Types.ValidateVoucherResult {
    let entries = Iter.toArray(vouchers.entries());
    for ((_, voucher) in entries.vals()) {
      if (voucher.code == voucherCode) {
        // Check if already redeemed
        if (voucher.redeemAt > 0) {
          return {
            valid = false;
            voucher = ?voucher;
            error = ?"Voucher already redeemed";
          };
        };

        // Check expiration
        if (voucher.expiredAt <= Time.now()) {
          return {
            valid = false;
            voucher = ?voucher;
            error = ?"Voucher has expired";
          };
        };

        return {
          valid = true;
          voucher = ?voucher;
          error = null;
        };
      };
    };

    {
      valid = false;
      voucher = null;
      error = ?"Voucher not found";
    };
  };

  // Redeem voucher
  public func redeemVoucher(
    voucher : Types.Voucher,
    redeemer : Principal,
    bitcoinBalances : HashMap.HashMap<Principal, Nat>,
  ) : Types.Voucher {

    // Mark as redeemed
    let redeemedVoucher : Types.Voucher = {
      id = voucher.id;
      code = voucher.code;
      amount = voucher.amount;
      description = voucher.description;
      createdBy = voucher.createdBy;
      expiredAt = voucher.expiredAt;
      createdAt = voucher.createdAt;
      redeemAt = Time.now();
    };

    // Credit funds to redeemer
    let redeemerBalance = switch (bitcoinBalances.get(redeemer)) {
      case (?balance) { balance };
      case null { 0 };
    };

    let newBalance = redeemerBalance + voucher.amount;
    bitcoinBalances.put(redeemer, newBalance);

    // Note: No need to deduct from creator's balance as the funds were already
    // deducted when the voucher was created. The voucher acts as a "locked" amount
    // that gets transferred to the redeemer upon redemption.

    return redeemedVoucher;
  };

  // Update voucher
  public func updateVoucher(
    vouchers : HashMap.HashMap<Text, Types.Voucher>,
    voucherId : Text,
    description : Text,
    expiredAt : Int,
    updater : Principal,
  ) : Bool {
    switch (vouchers.get(voucherId)) {
      case (?voucher) {
        // Check ownership
        if (voucher.createdBy != updater) {
          return false;
        };

        // Check if already redeemed
        if (voucher.redeemAt > 0) {
          return false;
        };

        // Validate new expiration date
        if (expiredAt <= Time.now()) {
          return false;
        };

        // Update voucher
        let updatedVoucher : Types.Voucher = {
          id = voucher.id;
          code = voucher.code;
          amount = voucher.amount;
          description = description;
          createdBy = voucher.createdBy;
          expiredAt = expiredAt;
          createdAt = voucher.createdAt;
          redeemAt = voucher.redeemAt;
        };

        vouchers.put(voucherId, updatedVoucher);
        true;
      };
      case null { false };
    };
  };

  // Get voucher by ID
  public func getVoucher(voucherId : Text, vouchers : HashMap.HashMap<Text, Types.Voucher>) : ?Types.Voucher {
    vouchers.get(voucherId);
  };

  // Get voucher by code
  public func getVoucherByCode(code : Text, vouchers : HashMap.HashMap<Text, Types.Voucher>) : ?Types.Voucher {
    let entries = Iter.toArray(vouchers.entries());
    for ((_, voucher) in entries.vals()) {
      if (voucher.code == code) {
        return ?voucher;
      };
    };
    null;
  };

  // Cancel voucher (refund to creator)
  public func cancelVoucher(voucherId : Text, canceller : Principal, vouchers : HashMap.HashMap<Text, Types.Voucher>, userVouchers : HashMap.HashMap<Principal, [Text]>, userBalances : HashMap.HashMap<Principal, Nat>) : Bool {
    switch (vouchers.get(voucherId)) {
      case (?voucher) {
        // Check ownership
        if (voucher.createdBy != canceller) {
          return false;
        };

        // Check if already redeemed
        if (voucher.redeemAt > 0) {
          return false;
        };

        // Refund amount to creator
        let creatorBalance = switch (userBalances.get(voucher.createdBy)) {
          case (?balance) { balance };
          case null { 0 };
        };

        let newBalance = creatorBalance + voucher.amount;
        userBalances.put(voucher.createdBy, newBalance);

        // Remove voucher
        vouchers.delete(voucherId);

        // Remove from user vouchers list
        switch (userVouchers.get(voucher.createdBy)) {
          case (?voucherList) {
            let filteredList = Array.filter<Text>(voucherList, func(id) { id != voucherId });
            userVouchers.put(voucher.createdBy, filteredList);
          };
          case null {};
        };

        true;
      };
      case null { false };
    };
  };
};

module {
  public type Voucher = {
    id : Text;
    code : Text;
    amount : Nat;
    description : Text;
    createdBy : Principal;
    expiredAt : Int;
    createdAt : Int;
    redeemAt : Int; // Changed from ?Int to Int (0 means not redeemed)
  };

  public type CreateVoucherResult = {
    success : Bool;
    voucher : ?Voucher;
    error : ?Text;
  };

  public type RedeemVoucherResult = {
    success : Bool;
    amount : ?Nat;
    newBalance : ?Nat;
    redeemAt : ?Int;
    error : ?Text;
  };

  public type ValidateVoucherResult = {
    valid : Bool;
    voucher : ?Voucher;
    error : ?Text;
  };

  public type UpdateVoucherResult = {
    success : Bool;
    error : ?Text;
  };
};

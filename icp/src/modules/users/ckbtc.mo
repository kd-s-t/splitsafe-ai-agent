import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Result "mo:base/Result";
import _Time "mo:base/Time";
import _Debug "mo:base/Debug";

module {
    public type Subaccount = Blob;
    public type Account = { owner : Principal; subaccount : ?Subaccount };

    public type TransferArgs = {
        memo : Nat64;
        amount : Nat;
        fee : Nat;
        from_subaccount : ?Subaccount;
        to : Account;
        created_at_time : ?Nat64;
    };

    public type TransferResult = {
        #Ok : Nat;
        #Err : TransferError;
    };

    public type TransferError = {
        #BadFee : { expected_fee : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #InsufficientFunds : { balance : Nat };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; error_message : Text };
    };

    public type Ledger = actor {
        transfer : (TransferArgs) -> async TransferResult;
        icrc1_balance_of : (Account) -> async Nat;
    };

    public type Minter = actor {
        get_deposit_address : shared { owner : Principal; subaccount : ?Blob } -> async Text;
    };

    public class CKBTCIntegration(ledgerCanisterId : Text, minterCanisterId : Text, canisterPrincipal : Principal) {
        private let ledger : Ledger = actor(ledgerCanisterId);
        private let minter : Minter = actor(minterCanisterId);
        private let me = canisterPrincipal;

        public func subaccountFromPrincipal(p : Principal) : Subaccount {
            let src = Blob.toArray(Principal.toBlob(p));
            let out = Array.tabulate<Nat8>(32, func(i : Nat) : Nat8 {
                if (i == 0) 0x53
                else if (i == 1) 0x41
                else if (i == 2) 0x46
                else if (i == 3) 0x45
                else if (i < 4 + src.size() and i >= 4) src[i - 4]
                else 0
            });
            Blob.fromArray(out)
        };

        public func requestCkbtcWallet(caller : Principal) : async Result.Result<{
            btcAddress : Text; 
            owner : Principal; 
            subaccount : Subaccount;
        }, Text> {
            try {
                let sub = subaccountFromPrincipal(caller);
                let addr = await minter.get_deposit_address({ 
                    owner = me; 
                    subaccount = ?sub 
                });
                #ok({
                    btcAddress = addr;
                    owner = me;
                    subaccount = sub;
                })
            } catch (_error) {
                #err("Failed to generate cKBTC wallet")
            }
        };

        public func getCkbtcBalance(user : Principal) : async Result.Result<Nat, Text> {
            try {
                let sub = subaccountFromPrincipal(user);
                let account = { owner = me; subaccount = ?sub };
                let balance = await ledger.icrc1_balance_of(account);
                #ok(balance)
            } catch (_error) {
                #err("Failed to get cKBTC balance")
            }
        };

        public func validateBitcoinAddress(address : Text) : Bool {
            if (address.size() < 26 or address.size() > 90) {
                return false;
            };
            Text.startsWith(address, #text "1") or 
            Text.startsWith(address, #text "3") or 
            Text.startsWith(address, #text "bc1")
        };

        public func getBitcoinBalance(account : Account) : async Result.Result<Nat, Text> {
            try {
                let balance = await ledger.icrc1_balance_of(account);
                #ok(balance)
            } catch (_error) {
                #err("Failed to get Bitcoin balance")
            }
        };

        public func transferBitcoin(
            fromAccount : Account,
            toAccount : Account,
            amount : Nat,
            memo : Nat64
        ) : async Result.Result<Nat, Text> {
            try {
                let transferArgs : TransferArgs = {
                    memo = memo;
                    amount = amount;
                    fee = 0;
                    from_subaccount = fromAccount.subaccount;
                    to = toAccount;
                    created_at_time = null;
                };
                let result = await ledger.transfer(transferArgs);
                switch (result) {
                    case (#Ok(txId)) { #ok(txId) };
                    case (#Err(_error)) { #err("Transfer failed") };
                }
            } catch (_error) {
                #err("Transfer failed")
            }
        };

        public func createBitcoinEscrowAccount(_escrowId : Text) : Account {
            return {
                owner = me;
                subaccount = null;
            };
        };
    };
};

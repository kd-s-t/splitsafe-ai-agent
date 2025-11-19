import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import _Blob "mo:base/Blob";
import _Array "mo:base/Array";
import Time "mo:base/Time";
import _Timer "mo:base/Timer";
import Debug "mo:base/Debug";

module {
    public type Account = {
        owner : Principal;
        subaccount : ?[Nat8];
    };

    public type TransferArgs = {
        memo : Nat64;
        amount : Nat;
        fee : Nat;
        from_subaccount : ?[Nat8];
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
        account_balance : (Account) -> async { e8s : Nat64 };
    };

    public type SeiNetwork = {
        name : Text;
        chainId : Text;
        rpcUrl : Text;
        explorerUrl : Text;
        prefix : Text;
        isTestnet : Bool;
    };

    public type SeiBalanceResponse = {
        result : {
            response : {
                value : Text; // Base64 encoded balance
            };
        };
    };

    public type SeiTxResponse = {
        result : {
            hash : Text;
            code : Nat;
            log : Text;
        };
    };

    public class SEIIntegration(_ledgerCanisterId : Text, networkConfig : SeiNetwork) {
        private let network = networkConfig;
        
        private var seiBalanceCache = HashMap.HashMap<Principal, { balance : Nat; timestamp : Nat64 }>(10, Principal.equal, Principal.hash);
        private let CACHE_DURATION : Nat64 = 30_000_000_000; // 30 seconds in nanoseconds

        public func icpToSei(icpE8s : Nat) : Nat {
            // For demo purposes: 1 BTC = 10,000 SEI (more reasonable conversion rate)
            return icpE8s / 10_000;
        };

        public func seiToIcp(usei : Nat) : Nat {
            // For demo purposes: 1 SEI = 0.0001 BTC (inverse of above)
            return usei * 10_000;
        };

        public func transferSei(
            fromAccount : Account,
            amount : Nat
        ) : async Result.Result<Nat, Text> {
            // SEI balance checking disabled - always return success for demo purposes
            Debug.print("🔄 SEI Transfer (Simulated): " # Nat.toText(amount) # " usei from " # Principal.toText(fromAccount.owner));
            
            let seiTx = await createSeiTransaction();
            switch (seiTx) {
                case (#ok(_txHash)) {
                    return #ok(1);
                };
                case (#err(error)) {
                    return #err("SEI transaction failed: " # error);
                };
            };
        };

        public func getSeiBalance(account : Account) : async Result.Result<Nat, Text> {
            let now = Nat64.fromIntWrap(Time.now());
            switch (seiBalanceCache.get(account.owner)) {
                case (?cached) {
                    if (now - cached.timestamp < CACHE_DURATION) {
                        return #ok(cached.balance);
                    };
                };
                case null {};
            };

            let seiAddress = generateSeiAddress(account.owner);
            let balance = await simulateSeiBalanceQuery(seiAddress);
            
            switch (balance) {
                case (#ok(bal)) {
                    seiBalanceCache.put(account.owner, { balance = bal; timestamp = now });
                    return #ok(bal);
                };
                case (#err(error)) {
                    return #err(error);
                };
            };
        };

        private func simulateSeiBalanceQuery(_address : Text) : async Result.Result<Nat, Text> {
            let simulatedBalance = 5_000_000;
            return #ok(simulatedBalance);
        };

        private func createSeiTransaction() : async Result.Result<Text, Text> {
            let txHash = "sei_testnet_tx_" # Nat.toText(Nat64.toNat(Nat64.fromIntWrap(Time.now())));
            
            return #ok(txHash);
        };



        public func generateSeiAddress(principal : Principal) : Text {
            let principalText = Principal.toText(principal);
            return network.prefix # "1" # principalText;
        };

        public func getNetworkInfo() : SeiNetwork {
            return network;
        };

        public func isTestnet() : Bool {
            return network.isTestnet;
        };

        public func getExplorerUrl(txHash : Text) : Text {
            return network.explorerUrl # "/tx/" # txHash;
        };

        public func getFaucetUrl() : ?Text {
            if (network.isTestnet) {
                return ?(network.explorerUrl # "/faucet");
            };
            return null;
        };

        public func clearBalanceCache() {
            seiBalanceCache := HashMap.HashMap<Principal, { balance : Nat; timestamp : Nat64 }>(10, Principal.equal, Principal.hash);
        };
    };
};

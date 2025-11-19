import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import _Int "mo:base/Int";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import _Array "mo:base/Array";
import _Iter "mo:base/Iter";

module {
    public type BitcoinAddress = Text;
    public type BitcoinBalance = Nat;
    public type BitcoinNetwork = {
        #testnet;
        #mainnet;
    };

    // HTTP outcall types
    public type HttpRequest = {
        url: Text;
        method: Text;
        headers: [(Text, Text)];
        body: ?Blob;
    };

    public type HttpResponse = {
        status: Nat;
        headers: [(Text, Text)];
        body: Blob;
    };

    public type HttpOutcall = actor {
        http_request: HttpRequest -> async HttpResponse;
    };

    public type BitcoinIntegrationState = {
        addresses: HashMap.HashMap<Principal, BitcoinAddress>;
        balances: HashMap.HashMap<Principal, BitcoinBalance>;
        network: BitcoinNetwork;
    };

    public class BitcoinIntegration() {
        private var addresses = HashMap.HashMap<Principal, BitcoinAddress>(10, Principal.equal, Principal.hash);
        private var balances = HashMap.HashMap<Principal, BitcoinBalance>(10, Principal.equal, Principal.hash);
        private let network: BitcoinNetwork = #testnet; // Use testnet for development
        
        // Bitcoin RPC configuration
        private let _bitcoinRpcUrl = "http://localhost:18332";
        private let _rpcUser = "testnetuser";
        private let _rpcPassword = "testnetpass123";

        public func createState(): BitcoinIntegrationState {
            {
                addresses = addresses;
                balances = balances;
                network = network;
            };
        };

        public func restoreState(state: BitcoinIntegrationState): () {
            addresses := state.addresses;
            balances := state.balances;
        };

        // TODO: Implement HTTP outcalls to Bitcoin RPC when stable
        // For now, we'll use deterministic addresses and stored balances

        /**
         * Generate a Bitcoin address (deterministic for now, can be enhanced with RPC later)
         */
        public func generateBitcoinAddress(user: Principal, state: BitcoinIntegrationState): (Result.Result<BitcoinAddress, Text>, BitcoinIntegrationState) {
            // For now, generate deterministic addresses
            // TODO: Implement real Bitcoin RPC calls when HTTP outcalls are more stable
            let addressPrefix = switch (network) {
                case (#testnet) "tb1q";
                case (#mainnet) "bc1q";
            };
            
            let principalText = Principal.toText(user);
            let cleanPrincipal = Text.replace(principalText, #text "-", "");
            let addressSuffix = "test" # Nat.toText(Text.size(cleanPrincipal));
            let bitcoinAddress = addressPrefix # addressSuffix;
            
            // Store the address
            addresses.put(user, bitcoinAddress);
            
            Debug.print("Generated Bitcoin address for user " # Principal.toText(user) # ": " # bitcoinAddress);
            (#ok bitcoinAddress, state);
        };

        /**
         * Get Bitcoin address for a user
         */
        public func getBitcoinAddress(user: Principal, _state: BitcoinIntegrationState): ?BitcoinAddress {
            addresses.get(user);
        };

        /**
         * Set Bitcoin address for a user (admin function)
         */
        public func setBitcoinAddress(user: Principal, address: BitcoinAddress, state: BitcoinIntegrationState): (Bool, BitcoinIntegrationState) {
            addresses.put(user, address);
            Debug.print("Set Bitcoin address for user " # Principal.toText(user) # ": " # address);
            (true, state);
        };

        /**
         * Remove Bitcoin address for a user
         */
        public func removeBitcoinAddress(user: Principal, state: BitcoinIntegrationState): (Bool, BitcoinIntegrationState) {
            addresses.delete(user);
            balances.delete(user);
            Debug.print("Removed Bitcoin address for user " # Principal.toText(user));
            (true, state);
        };

        /**
         * Get Bitcoin balance for a user (from stored state for now)
         */
        public func getUserBitcoinBalance(user: Principal, _state: BitcoinIntegrationState): BitcoinBalance {
            switch (balances.get(user)) {
                case (?balance) balance;
                case null {
                    // Return 0 if no balance is set
                    // TODO: Query real Bitcoin blockchain when HTTP outcalls are stable
                    0;
                };
            };
        };

        /**
         * Set Bitcoin balance for a user (admin function for testing)
         */
        public func setBitcoinBalance(user: Principal, balance: BitcoinBalance, state: BitcoinIntegrationState): (Bool, BitcoinIntegrationState) {
            balances.put(user, balance);
            Debug.print("Set Bitcoin balance for user " # Principal.toText(user) # ": " # Nat.toText(balance));
            (true, state);
        };

        /**
         * Update Bitcoin balance from external source
         * This would be called by a service that monitors the Bitcoin blockchain
         */
        public func updateBitcoinBalance(user: Principal, newBalance: BitcoinBalance, state: BitcoinIntegrationState): (Bool, BitcoinIntegrationState) {
            balances.put(user, newBalance);
            Debug.print("Updated Bitcoin balance for user " # Principal.toText(user) # ": " # Nat.toText(newBalance));
            (true, state);
        };

        /**
         * Get network information
         */
        public func getNetworkInfo(): BitcoinNetwork {
            network;
        };

        /**
         * Check if user has Bitcoin address
         */
        public func hasBitcoinAddress(user: Principal, _state: BitcoinIntegrationState): Bool {
            Option.isSome(addresses.get(user));
        };

        /**
         * Get all users with Bitcoin addresses
         */
        public func getAllUsersWithBitcoinAddresses(_state: BitcoinIntegrationState): [(Principal, BitcoinAddress)] {
            let result = Buffer.Buffer<(Principal, BitcoinAddress)>(addresses.size());
            for ((user, address) in addresses.entries()) {
                result.add((user, address));
            };
            Buffer.toArray(result);
        };
    };
};

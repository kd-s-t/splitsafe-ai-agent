import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";

import Types "./schema";
import ApiKeys "./api_keys";

module {
    // Use the Types.ApiKeyManagerState type from the schema

    public type ApiKeyManagerResult = {
        #ok : Text;
        #err : Text;
    };

    public func createApiKeyManagerState(): Types.ApiKeyManagerState {
        {
            apiKeys = HashMap.HashMap<Types.ApiKeyId, Types.ApiKey>(0, Text.equal, Text.hash);
            keyToId = HashMap.HashMap<Text, Types.ApiKeyId>(0, Text.equal, Text.hash);
            userKeys = HashMap.HashMap<Principal, [Types.ApiKeyId]>(0, Principal.equal, Principal.hash);
            nextKeyId = 1;
            logs = [];
            // Usage monitoring
            usageHistory = HashMap.HashMap<Text, [Types.ApiKeyUsage]>(0, Text.equal, Text.hash);
            usagePatterns = HashMap.HashMap<Types.ApiKeyId, Types.UsagePattern>(0, Text.equal, Text.hash);
            suspiciousActivities = HashMap.HashMap<Text, Types.SuspiciousActivity>(0, Text.equal, Text.hash);
            alerts = HashMap.HashMap<Text, Types.UsageAlert>(0, Text.equal, Text.hash);
            nextUsageId = 1;
            nextAlertId = 1;
        }
    };

    public func createApiKey(
        caller: Principal,
        request: Types.CreateApiKeyRequest,
        state: Types.ApiKeyManagerState
    ): (Types.ApiKeyResult, Types.ApiKeyManagerState) {
        let (result, updatedCoreState) = ApiKeys.createApiKey(caller, request, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        });

        let newLogs = switch (result) {
            case (#ok(response)) {
                Array.append(state.logs, [
                    "API key created: " # response.id # " by " # Principal.toText(caller)
                ])
            };
            case (#err(_)) {
                Array.append(state.logs, [
                    "Failed to create API key for " # Principal.toText(caller)
                ])
            };
        };

        let updatedState =         {
            apiKeys = updatedCoreState.apiKeys;
            keyToId = updatedCoreState.keyToId;
            userKeys = updatedCoreState.userKeys;
            nextKeyId = updatedCoreState.nextKeyId;
            logs = newLogs;
            usageHistory = updatedCoreState.usageHistory;
            usagePatterns = updatedCoreState.usagePatterns;
            suspiciousActivities = updatedCoreState.suspiciousActivities;
            alerts = updatedCoreState.alerts;
            nextUsageId = updatedCoreState.nextUsageId;
            nextAlertId = updatedCoreState.nextAlertId;
        };

        (result, updatedState)
    };

    public func listApiKeys(
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): Types.ApiKeyListResult {
        ApiKeys.listApiKeys(caller, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        })
    };

    public func getApiKey(
        keyId: Types.ApiKeyId,
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): Types.ApiKeyResult {
        ApiKeys.getApiKey(keyId, caller, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        })
    };

    public func revokeApiKey(
        keyId: Types.ApiKeyId,
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): (Types.VoidResult, Types.ApiKeyManagerState) {
        let (result, updatedCoreState) = ApiKeys.revokeApiKey(keyId, caller, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        });

        let newLogs = switch (result) {
            case (#ok(_)) {
                Array.append(state.logs, [
                    "API key revoked: " # keyId # " by " # Principal.toText(caller)
                ])
            };
            case (#err(_)) {
                Array.append(state.logs, [
                    "Failed to revoke API key: " # keyId # " by " # Principal.toText(caller)
                ])
            };
        };

        let updatedState =         {
            apiKeys = updatedCoreState.apiKeys;
            keyToId = updatedCoreState.keyToId;
            userKeys = updatedCoreState.userKeys;
            nextKeyId = updatedCoreState.nextKeyId;
            logs = newLogs;
            usageHistory = updatedCoreState.usageHistory;
            usagePatterns = updatedCoreState.usagePatterns;
            suspiciousActivities = updatedCoreState.suspiciousActivities;
            alerts = updatedCoreState.alerts;
            nextUsageId = updatedCoreState.nextUsageId;
            nextAlertId = updatedCoreState.nextAlertId;
        };

        (result, updatedState)
    };

    public func updateApiKeyPermissions(
        keyId: Types.ApiKeyId,
        permissions: [Types.Permission],
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): (Types.VoidResult, Types.ApiKeyManagerState) {
        let (result, updatedCoreState) = ApiKeys.updateApiKeyPermissions(keyId, permissions, caller, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        });

        let newLogs = switch (result) {
            case (#ok(_)) {
                Array.append(state.logs, [
                    "API key permissions updated: " # keyId # " by " # Principal.toText(caller)
                ])
            };
            case (#err(_)) {
                Array.append(state.logs, [
                    "Failed to update API key permissions: " # keyId # " by " # Principal.toText(caller)
                ])
            };
        };

        let updatedState =         {
            apiKeys = updatedCoreState.apiKeys;
            keyToId = updatedCoreState.keyToId;
            userKeys = updatedCoreState.userKeys;
            nextKeyId = updatedCoreState.nextKeyId;
            logs = newLogs;
            usageHistory = updatedCoreState.usageHistory;
            usagePatterns = updatedCoreState.usagePatterns;
            suspiciousActivities = updatedCoreState.suspiciousActivities;
            alerts = updatedCoreState.alerts;
            nextUsageId = updatedCoreState.nextUsageId;
            nextAlertId = updatedCoreState.nextAlertId;
        };

        (result, updatedState)
    };

    public func validateApiKey(
        key: Text,
        requiredPermission: Types.Permission,
        state: Types.ApiKeyManagerState
    ): (Result.Result<Principal, Types.ApiKeyError>, Types.ApiKeyManagerState) {
        let (result, updatedCoreState) = ApiKeys.validateApiKey(key, requiredPermission, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        });

        let newLogs = switch (result) {
            case (#ok(principal)) {
                Array.append(state.logs, [
                    "API key validated for permission: " # debug_show(requiredPermission) # " by " # Principal.toText(principal)
                ])
            };
            case (#err(_)) {
                Array.append(state.logs, [
                    "API key validation failed for permission: " # debug_show(requiredPermission)
                ])
            };
        };

        let updatedState =         {
            apiKeys = updatedCoreState.apiKeys;
            keyToId = updatedCoreState.keyToId;
            userKeys = updatedCoreState.userKeys;
            nextKeyId = updatedCoreState.nextKeyId;
            logs = newLogs;
            usageHistory = updatedCoreState.usageHistory;
            usagePatterns = updatedCoreState.usagePatterns;
            suspiciousActivities = updatedCoreState.suspiciousActivities;
            alerts = updatedCoreState.alerts;
            nextUsageId = updatedCoreState.nextUsageId;
            nextAlertId = updatedCoreState.nextAlertId;
        };

        (result, updatedState)
    };

    public func getKeyStats(state: Types.ApiKeyManagerState): Result.Result<{totalKeys: Nat; activeKeys: Nat; revokedKeys: Nat}, Types.ApiKeyError> {
        ApiKeys.getKeyStats({
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        })
    };

    public func cleanupExpiredKeys(state: Types.ApiKeyManagerState): (Result.Result<Nat, Types.ApiKeyError>, Types.ApiKeyManagerState) {
        let (result, updatedCoreState) = ApiKeys.cleanupExpiredKeys({
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        });

        let newLogs = switch (result) {
            case (#ok(count)) {
                Array.append(state.logs, [
                    "Cleaned up " # Nat.toText(count) # " expired API keys"
                ])
            };
            case (#err(_)) {
                Array.append(state.logs, [
                    "Failed to cleanup expired API keys"
                ])
            };
        };

        let updatedState =         {
            apiKeys = updatedCoreState.apiKeys;
            keyToId = updatedCoreState.keyToId;
            userKeys = updatedCoreState.userKeys;
            nextKeyId = updatedCoreState.nextKeyId;
            logs = newLogs;
            usageHistory = updatedCoreState.usageHistory;
            usagePatterns = updatedCoreState.usagePatterns;
            suspiciousActivities = updatedCoreState.suspiciousActivities;
            alerts = updatedCoreState.alerts;
            nextUsageId = updatedCoreState.nextUsageId;
            nextAlertId = updatedCoreState.nextAlertId;
        };

        (result, updatedState)
    };

    public func getLogs(state: Types.ApiKeyManagerState): [Text] {
        state.logs
    };

    public func addLog(state: Types.ApiKeyManagerState, log: Text): Types.ApiKeyManagerState {
        let newLogs = Array.append(state.logs, [log]);
        {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            logs = newLogs;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
        }
    };

    public func logApiKeyUsage(
        keyId: Types.ApiKeyId,
        endpoint: Text,
        method: Text,
        ipAddress: ?Text,
        userAgent: ?Text,
        success: Bool,
        responseTime: ?Nat,
        errorCode: ?Text,
        state: Types.ApiKeyManagerState
    ): (Result.Result<(), Types.ApiKeyError>, Types.ApiKeyManagerState) {
        let (result, updatedCoreState) = ApiKeys.logApiKeyUsage(
            keyId, endpoint, method, ipAddress, userAgent, success, responseTime, errorCode, {
                apiKeys = state.apiKeys;
                keyToId = state.keyToId;
                userKeys = state.userKeys;
                nextKeyId = state.nextKeyId;
                usageHistory = state.usageHistory;
                usagePatterns = state.usagePatterns;
                suspiciousActivities = state.suspiciousActivities;
                alerts = state.alerts;
                nextUsageId = state.nextUsageId;
                nextAlertId = state.nextAlertId;
                logs = state.logs;
            }
        );

        let updatedState = {
            apiKeys = updatedCoreState.apiKeys;
            keyToId = updatedCoreState.keyToId;
            userKeys = updatedCoreState.userKeys;
            nextKeyId = updatedCoreState.nextKeyId;
            logs = state.logs;
            usageHistory = updatedCoreState.usageHistory;
            usagePatterns = updatedCoreState.usagePatterns;
            suspiciousActivities = updatedCoreState.suspiciousActivities;
            alerts = updatedCoreState.alerts;
            nextUsageId = updatedCoreState.nextUsageId;
            nextAlertId = updatedCoreState.nextAlertId;
        };

        (result, updatedState)
    };

    public func getUsageHistory(keyId: Types.ApiKeyId, caller: Principal, state: Types.ApiKeyManagerState): Result.Result<[Types.ApiKeyUsage], Types.ApiKeyError> {
        ApiKeys.getUsageHistory(keyId, caller, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        })
    };

    public func getUsagePatterns(keyId: Types.ApiKeyId, caller: Principal, state: Types.ApiKeyManagerState): Result.Result<Types.UsagePattern, Types.ApiKeyError> {
        ApiKeys.getUsagePatterns(keyId, caller, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        })
    };

    public func getAlerts(caller: Principal, state: Types.ApiKeyManagerState): Result.Result<[Types.UsageAlert], Types.ApiKeyError> {
        ApiKeys.getAlerts(caller, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        })
    };

    public func getApiKeyByKey(key: Text, state: Types.ApiKeyManagerState): Types.ApiKeyResult {
        ApiKeys.getApiKeyByKey(key, {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        })
    };
};

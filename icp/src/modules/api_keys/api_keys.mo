import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Array "mo:base/Array";
import _Option "mo:base/Option";
import _Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import _Hash "mo:base/Hash";
import Debug "mo:base/Debug";

import Types "./schema";

module {
    // Helper functions
    public func generateApiKey(nextKeyId: Nat): (Text, Nat) {
        let timestamp = Time.now();
        let random = Nat.toText(Int.abs(timestamp) % 1000000);
        let key = Types.KEY_PREFIX # random # "_" # Nat.toText(nextKeyId) # "_" # Nat.toText(Int.abs(timestamp));
        (key, nextKeyId + 1)
    };

    public func validatePermissions(permissions: [Types.Permission]): Bool {
        permissions.size() > 0 and permissions.size() <= 7
    };

    public func hasPermission(key: Types.ApiKey, permission: Types.Permission): Bool {
        Array.find<Types.Permission>(key.permissions, func(p) = p == permission) != null
    };

    public func isKeyOwner(keyId: Types.ApiKeyId, caller: Principal, apiKeys: HashMap.HashMap<Types.ApiKeyId, Types.ApiKey>): Bool {
        switch (apiKeys.get(keyId)) {
            case (?key) { key.owner == caller };
            case null { false };
        }
    };

    // Core API Key Operations
    public func createApiKey(
        caller: Principal,
        request: Types.CreateApiKeyRequest,
        state: Types.ApiKeyManagerState
    ): (Types.ApiKeyResult, Types.ApiKeyManagerState) {
        // Check if user has reached key limit
        let userKeyIds = state.userKeys.get(caller);
        let currentKeyCount = switch (userKeyIds) {
            case (?ids) { ids.size() };
            case null { 0 };
        };

        if (currentKeyCount >= Types.MAX_KEYS_PER_USER) {
            return (#err(#rate_limit_exceeded), state);
        };

        // Validate permissions
        if (not validatePermissions(request.permissions)) {
            return (#err(#invalid_permissions), state);
        };

        // Generate new API key
        let keyId = "key_" # Nat.toText(state.nextKeyId);
        let (apiKey, newNextKeyId) = generateApiKey(state.nextKeyId);
        
        // Generate name if empty
        let keyName = if (request.name == "") {
            "API Key " # Nat.toText(currentKeyCount + 1) # " - " # Int.toText(Time.now())
        } else {
            request.name
        };
        
        let newKey: Types.ApiKey = {
            id = keyId;
            name = keyName;
            key = apiKey;
            status = #active;
            createdAt = Time.now();
            lastUsed = null;
            revokedAt = null;
            permissions = request.permissions;
            owner = caller;
            // Security enhancements
            usageCount = 0;
            lastUsedFrom = null;
            maxUsagePerDay = ?Types.MAX_DAILY_USAGE;
            expiresAt = null;
        };

        // Create updated state
        let updatedApiKeys = HashMap.HashMap<Types.ApiKeyId, Types.ApiKey>(0, Text.equal, Text.hash);
        let updatedKeyToId = HashMap.HashMap<Text, Types.ApiKeyId>(0, Text.equal, Text.hash);
        let updatedUserKeys = HashMap.HashMap<Principal, [Types.ApiKeyId]>(0, Principal.equal, Principal.hash);

        // Copy existing data
        for ((id, key) in state.apiKeys.entries()) {
            updatedApiKeys.put(id, key);
        };
        for ((key, id) in state.keyToId.entries()) {
            updatedKeyToId.put(key, id);
        };
        for ((principal, ids) in state.userKeys.entries()) {
            updatedUserKeys.put(principal, ids);
        };

        // Add new key
        updatedApiKeys.put(keyId, newKey);
        updatedKeyToId.put(apiKey, keyId);

        // Update user's key list
        let updatedUserKeyIds = switch (userKeyIds) {
            case (?ids) { Array.append(ids, [keyId]) };
            case null { [keyId] };
        };
        updatedUserKeys.put(caller, updatedUserKeyIds);

        let updatedState = {
            apiKeys = updatedApiKeys;
            keyToId = updatedKeyToId;
            userKeys = updatedUserKeys;
            nextKeyId = newNextKeyId;
            usageHistory = state.usageHistory;
            usagePatterns = state.usagePatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = state.alerts;
            nextUsageId = state.nextUsageId;
            nextAlertId = state.nextAlertId;
            logs = state.logs;
        };

        let response: Types.ApiKeyResponse = {
            id = newKey.id;
            name = newKey.name;
            key = newKey.key;
            status = newKey.status;
            createdAt = newKey.createdAt;
            lastUsed = newKey.lastUsed;
            revokedAt = newKey.revokedAt;
            permissions = newKey.permissions;
            owner = newKey.owner;
            usageCount = newKey.usageCount;
            lastUsedFrom = newKey.lastUsedFrom;
            expiresAt = newKey.expiresAt;
        };

        (#ok(response), updatedState)
    };

    public func listApiKeys(
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): Types.ApiKeyListResult {
        let userKeyIds = state.userKeys.get(caller);
        switch (userKeyIds) {
            case (?ids) {
                let keyResponses = Array.map<Types.ApiKeyId, Types.ApiKeyResponse>(
                    ids,
                    func(id) {
                        let key = switch (state.apiKeys.get(id)) {
                            case (?k) k;
                            case null { Debug.trap("Key not found: " # id) };
                        };
                        {
                            id = key.id;
                            name = key.name;
                            key = key.key;
                            status = key.status;
                            createdAt = key.createdAt;
                            lastUsed = key.lastUsed;
                            revokedAt = key.revokedAt;
                            permissions = key.permissions;
                            owner = key.owner;
                            usageCount = key.usageCount;
                            lastUsedFrom = key.lastUsedFrom;
                            expiresAt = key.expiresAt;
                        }
                    }
                );
                #ok({
                    keys = keyResponses;
                    total = keyResponses.size();
                })
            };
            case null {
                #ok({
                    keys = [];
                    total = 0;
                })
            };
        }
    };

    public func getApiKey(
        keyId: Types.ApiKeyId,
        _caller: Principal,
        state: Types.ApiKeyManagerState
    ): Types.ApiKeyResult {
        // Allow anonymous access to query any API key
        // if (not isKeyOwner(keyId, caller, state.apiKeys)) {
        //     return #err(#unauthorized);
        // };

        switch (state.apiKeys.get(keyId)) {
            case (?key) {
                let response: Types.ApiKeyResponse = {
                    id = key.id;
                    name = key.name;
                    key = key.key;
                    status = key.status;
                    createdAt = key.createdAt;
                    lastUsed = key.lastUsed;
                    revokedAt = key.revokedAt;
                    permissions = key.permissions;
                    owner = key.owner;
                    usageCount = key.usageCount;
                    lastUsedFrom = key.lastUsedFrom;
                    expiresAt = key.expiresAt;
                };
                #ok(response)
            };
            case null {
                #err(#not_found)
            };
        }
    };

    public func revokeApiKey(
        keyId: Types.ApiKeyId,
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): (Types.VoidResult, Types.ApiKeyManagerState) {
        if (not isKeyOwner(keyId, caller, state.apiKeys)) {
            return (#err(#unauthorized), state);
        };

        switch (state.apiKeys.get(keyId)) {
            case (?key) {
                let updatedKey = {
                    id = key.id;
                    name = key.name;
                    key = key.key;
                    status = #revoked;
                    createdAt = key.createdAt;
                    lastUsed = key.lastUsed;
                    revokedAt = ?Time.now();
                    permissions = key.permissions;
                    owner = key.owner;
                    usageCount = key.usageCount;
                    lastUsedFrom = key.lastUsedFrom;
                    maxUsagePerDay = key.maxUsagePerDay;
                    expiresAt = key.expiresAt;
                };

                let updatedApiKeys = HashMap.HashMap<Types.ApiKeyId, Types.ApiKey>(0, Text.equal, Text.hash);
                for ((id, k) in state.apiKeys.entries()) {
                    if (id == keyId) {
                        updatedApiKeys.put(id, updatedKey);
                    } else {
                        updatedApiKeys.put(id, k);
                    };
                };

                let updatedState = {
                    apiKeys = updatedApiKeys;
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
                };

                (#ok(()), updatedState)
            };
            case null {
                (#err(#not_found), state)
            };
        }
    };

    public func updateApiKeyPermissions(
        keyId: Types.ApiKeyId,
        permissions: [Types.Permission],
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): (Types.VoidResult, Types.ApiKeyManagerState) {
        if (not isKeyOwner(keyId, caller, state.apiKeys)) {
            return (#err(#unauthorized), state);
        };

        if (not validatePermissions(permissions)) {
            return (#err(#invalid_permissions), state);
        };

        switch (state.apiKeys.get(keyId)) {
            case (?key) {
                let updatedKey = {
                    id = key.id;
                    name = key.name;
                    key = key.key;
                    status = key.status;
                    createdAt = key.createdAt;
                    lastUsed = key.lastUsed;
                    revokedAt = key.revokedAt;
                    permissions = permissions;
                    owner = key.owner;
                    usageCount = key.usageCount;
                    lastUsedFrom = key.lastUsedFrom;
                    maxUsagePerDay = key.maxUsagePerDay;
                    expiresAt = key.expiresAt;
                };

                let updatedApiKeys = HashMap.HashMap<Types.ApiKeyId, Types.ApiKey>(0, Text.equal, Text.hash);
                for ((id, k) in state.apiKeys.entries()) {
                    if (id == keyId) {
                        updatedApiKeys.put(id, updatedKey);
                    } else {
                        updatedApiKeys.put(id, k);
                    };
                };

                let updatedState = {
                    apiKeys = updatedApiKeys;
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
                };

                (#ok(()), updatedState)
            };
            case null {
                (#err(#not_found), state)
            };
        }
    };

    // Internal function to validate API key (used by other modules)
    public func validateApiKey(
        key: Text,
        requiredPermission: Types.Permission,
        state: Types.ApiKeyManagerState
    ): (Result.Result<Principal, Types.ApiKeyError>, Types.ApiKeyManagerState) {
        switch (state.keyToId.get(key)) {
            case (?keyId) {
                switch (state.apiKeys.get(keyId)) {
                    case (?apiKey) {
                        if (apiKey.status != #active) {
                            return (#err(#unauthorized), state);
                        };
                        
                        if (not hasPermission(apiKey, requiredPermission)) {
                            return (#err(#unauthorized), state);
                        };

                        // Update last used timestamp
                        let updatedKey = {
                            id = apiKey.id;
                            name = apiKey.name;
                            key = apiKey.key;
                            status = apiKey.status;
                            createdAt = apiKey.createdAt;
                            lastUsed = ?Time.now();
                            revokedAt = apiKey.revokedAt;
                            permissions = apiKey.permissions;
                            owner = apiKey.owner;
                            usageCount = apiKey.usageCount + 1;
                            lastUsedFrom = apiKey.lastUsedFrom;
                            maxUsagePerDay = apiKey.maxUsagePerDay;
                            expiresAt = apiKey.expiresAt;
                        };

                        let updatedApiKeys = HashMap.HashMap<Types.ApiKeyId, Types.ApiKey>(0, Text.equal, Text.hash);
                        for ((id, k) in state.apiKeys.entries()) {
                            if (id == keyId) {
                                updatedApiKeys.put(id, updatedKey);
                            } else {
                                updatedApiKeys.put(id, k);
                            };
                        };

                        let updatedState = {
                            apiKeys = updatedApiKeys;
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
                        };

                        (#ok(apiKey.owner), updatedState)
                    };
                    case null {
                        (#err(#not_found), state)
                    };
                }
            };
            case null {
                (#err(#not_found), state)
            };
        }
    };

    // Admin functions
    public func getKeyStats(state: Types.ApiKeyManagerState): Result.Result<{totalKeys: Nat; activeKeys: Nat; revokedKeys: Nat}, Types.ApiKeyError> {
        let allKeys = state.apiKeys.vals();
        var totalKeys: Nat = 0;
        var activeKeys: Nat = 0;
        var revokedKeys: Nat = 0;

        for (key in allKeys) {
            totalKeys += 1;
            switch (key.status) {
                case (#active) { activeKeys += 1 };
                case (#revoked) { revokedKeys += 1 };
                case (#expired) { };
            };
        };

        #ok({
            totalKeys = totalKeys;
            activeKeys = activeKeys;
            revokedKeys = revokedKeys;
        })
    };

    public func cleanupExpiredKeys(state: Types.ApiKeyManagerState): (Result.Result<Nat, Types.ApiKeyError>, Types.ApiKeyManagerState) {
        let now = Time.now();
        let expirationTime = 365 * 24 * 60 * 60 * 1000000000; // 1 year in nanoseconds
        var cleanedCount: Nat = 0;

        let updatedApiKeys = HashMap.HashMap<Types.ApiKeyId, Types.ApiKey>(0, Text.equal, Text.hash);

        for ((keyId, key) in state.apiKeys.entries()) {
            if (now - key.createdAt > expirationTime and key.status == #active) {
                    let expiredKey = {
                        id = key.id;
                        name = key.name;
                        key = key.key;
                        status = #expired;
                        createdAt = key.createdAt;
                        lastUsed = key.lastUsed;
                        revokedAt = key.revokedAt;
                        permissions = key.permissions;
                        owner = key.owner;
                        usageCount = key.usageCount;
                        lastUsedFrom = key.lastUsedFrom;
                        maxUsagePerDay = key.maxUsagePerDay;
                        expiresAt = key.expiresAt;
                    };
                updatedApiKeys.put(keyId, expiredKey);
                cleanedCount += 1;
            } else {
                updatedApiKeys.put(keyId, key);
            };
        };

        let updatedState = {
            apiKeys = updatedApiKeys;
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
        };

        (#ok(cleanedCount), updatedState)
    };

    // Usage Monitoring Functions
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
        let usageId = "usage_" # Nat.toText(state.nextUsageId);
        let now = Time.now();
        
        let usage: Types.ApiKeyUsage = {
            id = usageId;
            keyId = keyId;
            timestamp = now;
            endpoint = endpoint;
            method = method;
            ipAddress = ipAddress;
            userAgent = userAgent;
            success = success;
            responseTime = responseTime;
            errorCode = errorCode;
        };

        // Add to usage history
        let updatedUsageHistory = HashMap.HashMap<Text, [Types.ApiKeyUsage]>(0, Text.equal, Text.hash);
        for ((id, usages) in state.usageHistory.entries()) {
            updatedUsageHistory.put(id, usages);
        };
        
        let existingUsages = switch (state.usageHistory.get(keyId)) {
            case (?usages) usages;
            case null [];
        };
        updatedUsageHistory.put(keyId, Array.append(existingUsages, [usage]));

        // Update usage patterns and check for suspicious activity
        let (updatedPatterns, suspiciousActivity) = updateUsagePatterns(keyId, usage, state.usagePatterns);
        
        // Create alerts if suspicious activity detected
        let (updatedAlerts, _newAlerts) = if (suspiciousActivity) {
            createSuspiciousActivityAlert(keyId, usage, state.alerts, state.nextAlertId)
        } else {
            (state.alerts, [])
        };

        let updatedState = {
            apiKeys = state.apiKeys;
            keyToId = state.keyToId;
            userKeys = state.userKeys;
            nextKeyId = state.nextKeyId;
            usageHistory = updatedUsageHistory;
            usagePatterns = updatedPatterns;
            suspiciousActivities = state.suspiciousActivities;
            alerts = updatedAlerts;
            nextUsageId = state.nextUsageId + 1;
            nextAlertId = state.nextAlertId + (if (suspiciousActivity) 1 else 0);
            logs = state.logs;
        };

        (#ok(()), updatedState)
    };

    private func updateUsagePatterns(
        keyId: Types.ApiKeyId,
        usage: Types.ApiKeyUsage,
        currentPatterns: HashMap.HashMap<Types.ApiKeyId, Types.UsagePattern>
    ): (HashMap.HashMap<Types.ApiKeyId, Types.UsagePattern>, Bool) {
        let now = Time.now();
        let oneDay = 24 * 60 * 60 * 1000000000; // 1 day in nanoseconds
        let oneHour = 60 * 60 * 1000000000; // 1 hour in nanoseconds
        
        let existingPattern = switch (currentPatterns.get(keyId)) {
            case (?pattern) pattern;
            case null {
                {
                    keyId = keyId;
                    dailyUsage = 0;
                    hourlyUsage = 0;
                    lastUsed = now;
                    commonEndpoints = [];
                    commonIpAddresses = [];
                    suspiciousActivity = false;
                }
            };
        };

        // Calculate daily and hourly usage
        let dailyUsage = if (now - existingPattern.lastUsed < oneDay) {
            existingPattern.dailyUsage + 1
        } else {
            1
        };

        let hourlyUsage = if (now - existingPattern.lastUsed < oneHour) {
            existingPattern.hourlyUsage + 1
        } else {
            1
        };

        // Update common endpoints and IP addresses
        let updatedEndpoints = Array.append(existingPattern.commonEndpoints, [usage.endpoint]);
        let updatedIpAddresses = switch (usage.ipAddress) {
            case (?ip) { Array.append(existingPattern.commonIpAddresses, [ip]) };
            case null { existingPattern.commonIpAddresses };
        };

        // Check for suspicious activity
        let suspiciousActivity = 
            dailyUsage > Types.MAX_DAILY_USAGE or
            hourlyUsage > Types.MAX_HOURLY_USAGE or
            (not usage.success and existingPattern.suspiciousActivity);

        let updatedPattern: Types.UsagePattern = {
            keyId = keyId;
            dailyUsage = dailyUsage;
            hourlyUsage = hourlyUsage;
            lastUsed = now;
            commonEndpoints = updatedEndpoints;
            commonIpAddresses = updatedIpAddresses;
            suspiciousActivity = suspiciousActivity;
        };

        let updatedPatterns = HashMap.HashMap<Types.ApiKeyId, Types.UsagePattern>(0, Text.equal, Text.hash);
        for ((id, pattern) in currentPatterns.entries()) {
            if (id == keyId) {
                updatedPatterns.put(id, updatedPattern);
            } else {
                updatedPatterns.put(id, pattern);
            };
        };
        if (currentPatterns.get(keyId) == null) {
            updatedPatterns.put(keyId, updatedPattern);
        };

        (updatedPatterns, suspiciousActivity)
    };

    private func createSuspiciousActivityAlert(
        keyId: Types.ApiKeyId,
        _usage: Types.ApiKeyUsage,
        currentAlerts: HashMap.HashMap<Text, Types.UsageAlert>,
        nextAlertId: Nat
    ): (HashMap.HashMap<Text, Types.UsageAlert>, [Types.UsageAlert]) {
        let alertId = "alert_" # Nat.toText(nextAlertId);
        let now = Time.now();
        
        let alert: Types.UsageAlert = {
            id = alertId;
            keyId = keyId;
            alertType = #usage_spike;
            timestamp = now;
            message = "Suspicious API key usage detected";
            severity = #medium;
            acknowledged = false;
        };

        let updatedAlerts = HashMap.HashMap<Text, Types.UsageAlert>(0, Text.equal, Text.hash);
        for ((id, alert) in currentAlerts.entries()) {
            updatedAlerts.put(id, alert);
        };
        updatedAlerts.put(alertId, alert);

        (updatedAlerts, [alert])
    };

    public func getUsageHistory(
        keyId: Types.ApiKeyId,
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): Result.Result<[Types.ApiKeyUsage], Types.ApiKeyError> {
        // Check if caller owns the key
        switch (state.apiKeys.get(keyId)) {
            case (?key) {
                if (key.owner != caller) {
                    return #err(#unauthorized);
                };
            };
            case null {
                return #err(#not_found);
            };
        };

        let usages = switch (state.usageHistory.get(keyId)) {
            case (?usages) usages;
            case null [];
        };

        #ok(usages)
    };

    public func getUsagePatterns(
        keyId: Types.ApiKeyId,
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): Result.Result<Types.UsagePattern, Types.ApiKeyError> {
        // Check if caller owns the key
        switch (state.apiKeys.get(keyId)) {
            case (?key) {
                if (key.owner != caller) {
                    return #err(#unauthorized);
                };
            };
            case null {
                return #err(#not_found);
            };
        };

        let pattern = switch (state.usagePatterns.get(keyId)) {
            case (?pattern) pattern;
            case null {
                {
                    keyId = keyId;
                    dailyUsage = 0;
                    hourlyUsage = 0;
                    lastUsed = 0;
                    commonEndpoints = [];
                    commonIpAddresses = [];
                    suspiciousActivity = false;
                }
            };
        };

        #ok(pattern)
    };

    public func getAlerts(
        caller: Principal,
        state: Types.ApiKeyManagerState
    ): Result.Result<[Types.UsageAlert], Types.ApiKeyError> {
        // Get all alerts for keys owned by the caller
        var userAlerts: [Types.UsageAlert] = [];
        
        for ((alertId, alert) in state.alerts.entries()) {
            switch (state.apiKeys.get(alert.keyId)) {
                case (?key) {
                    if (key.owner == caller) {
                        userAlerts := Array.append(userAlerts, [alert]);
                    };
                };
                case null {};
            };
        };

        #ok(userAlerts)
    };

    public func getApiKeyByKey(
        key: Text,
        state: Types.ApiKeyManagerState
    ): Types.ApiKeyResult {
        // Find the key ID from the key text
        switch (state.keyToId.get(key)) {
            case (?keyId) {
                // Get the API key details
                switch (state.apiKeys.get(keyId)) {
                    case (?apiKey) {
                        #ok(apiKey)
                    };
                    case null {
                        #err(#not_found)
                    };
                };
            };
            case null {
                #err(#not_found)
            };
        };
    };
};

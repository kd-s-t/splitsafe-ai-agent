import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

module {
    // Core API Key Types
    public type ApiKeyId = Text;
    
    public type ApiKeyStatus = {
        #active;
        #revoked;
        #expired;
    };

    public type Permission = {
        #escrow_create;
        #escrow_read;
        #escrow_update;
        #escrow_delete;
        #milestone_release;
        #webhook_manage;
        #admin;
    };

    public type ApiKey = {
        id: ApiKeyId;
        name: Text;
        key: Text;
        status: ApiKeyStatus;
        createdAt: Time.Time;
        lastUsed: ?Time.Time;
        revokedAt: ?Time.Time;
        permissions: [Permission];
        owner: Principal;
        // Security enhancements
        usageCount: Nat;
        lastUsedFrom: ?Text; // IP address or identifier
        maxUsagePerDay: ?Nat; // Optional rate limiting
        expiresAt: ?Time.Time; // Optional expiration
    };

    // Request/Response Types
    public type CreateApiKeyRequest = {
        name: Text;
        permissions: [Permission];
    };

    public type ApiKeyResponse = {
        id: ApiKeyId;
        name: Text;
        key: Text;
        status: ApiKeyStatus;
        createdAt: Time.Time;
        lastUsed: ?Time.Time;
        revokedAt: ?Time.Time;
        permissions: [Permission];
        owner: Principal;
        // Security info (safe to expose)
        usageCount: Nat;
        lastUsedFrom: ?Text;
        expiresAt: ?Time.Time;
    };

    public type ApiKeyListResponse = {
        keys: [ApiKeyResponse];
        total: Nat;
    };

    // Error Types
    public type ApiKeyError = {
        #unauthorized;
        #not_found;
        #invalid_permissions;
        #key_already_exists;
        #invalid_key_format;
        #rate_limit_exceeded;
        #key_expired;
        #usage_limit_exceeded;
        #suspicious_activity;
    };

    // Result Types
    public type ApiKeyResult = {
        #ok : ApiKeyResponse;
        #err : ApiKeyError;
    };

    public type ApiKeyListResult = {
        #ok : ApiKeyListResponse;
        #err : ApiKeyError;
    };

    public type VoidResult = {
        #ok : ();
        #err : ApiKeyError;
    };


    // Usage Monitoring Types
    public type ApiKeyUsage = {
        id: Text;
        keyId: ApiKeyId;
        timestamp: Time.Time;
        endpoint: Text;
        method: Text;
        ipAddress: ?Text;
        userAgent: ?Text;
        success: Bool;
        responseTime: ?Nat; // in milliseconds
        errorCode: ?Text;
    };

    public type UsagePattern = {
        keyId: ApiKeyId;
        dailyUsage: Nat;
        hourlyUsage: Nat;
        lastUsed: Time.Time;
        commonEndpoints: [Text];
        commonIpAddresses: [Text];
        suspiciousActivity: Bool;
    };

    public type SuspiciousActivity = {
        id: Text;
        keyId: ApiKeyId;
        activityType: SuspiciousActivityType;
        timestamp: Time.Time;
        details: Text;
        severity: ActivitySeverity;
        resolved: Bool;
    };

    public type SuspiciousActivityType = {
        #unusual_ip;
        #unusual_time;
        #high_frequency;
        #failed_attempts;
        #unusual_endpoint;
        #geographic_anomaly;
    };

    public type ActivitySeverity = {
        #low;
        #medium;
        #high;
        #critical;
    };

    public type UsageAlert = {
        id: Text;
        keyId: ApiKeyId;
        alertType: AlertType;
        timestamp: Time.Time;
        message: Text;
        severity: ActivitySeverity;
        acknowledged: Bool;
    };

    public type AlertType = {
        #usage_spike;
        #new_ip_address;
        #failed_authentication;
        #unusual_pattern;
        #key_compromise_suspected;
    };

    // Manager State Types (Updated)
    public type ApiKeyManagerState = {
        apiKeys: HashMap.HashMap<ApiKeyId, ApiKey>;
        keyToId: HashMap.HashMap<Text, ApiKeyId>;
        userKeys: HashMap.HashMap<Principal, [ApiKeyId]>;
        nextKeyId: Nat;
        // Usage monitoring
        usageHistory: HashMap.HashMap<Text, [ApiKeyUsage]>;
        usagePatterns: HashMap.HashMap<ApiKeyId, UsagePattern>;
        suspiciousActivities: HashMap.HashMap<Text, SuspiciousActivity>;
        alerts: HashMap.HashMap<Text, UsageAlert>;
        nextUsageId: Nat;
        nextAlertId: Nat;
        logs: [Text];
    };

    // Constants
    public let MAX_KEYS_PER_USER = 2;
    public let KEY_PREFIX = "sk_live_";
    public let KEY_LENGTH = 64;
    
    // Usage monitoring constants
    public let MAX_DAILY_USAGE = 1000;
    public let MAX_HOURLY_USAGE = 100;
    public let SUSPICIOUS_FAILURE_THRESHOLD = 5;
    public let USAGE_SPIKE_THRESHOLD = 3; // 3x normal usage
    public let ALERT_RETENTION_DAYS = 30;
};

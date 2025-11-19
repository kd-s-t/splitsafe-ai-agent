interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private maxSize = 100;

    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;

            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if entry has expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    has(key: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // Check if entry has expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            keys: Array.from(this.cache.keys())
        };
    }
}

export const cache = new MemoryCache();
export const CACHE_KEYS = {
    ICP_BALANCE: (principal: string) => `icp_balance_${principal}`,
    CKBT_BALANCE: (principal: string) => `ckbtc_balance_${principal}`,
    SEI_BALANCE: (principal: string) => `sei_balance_${principal}`,
    USER_PROFILE: (principal: string) => `user_profile_${principal}`,
    TRANSACTIONS: (principal: string, page: number = 0) => `transactions_${principal}_${page}`,
    TRANSACTION_DETAILS: (transactionId: string) => `transaction_${transactionId}`,
    CONTACTS: (principal: string) => `contacts_${principal}`,
    BITCOIN_PRICE: 'bitcoin_price',
    ICP_PRICE: 'icp_price',
    SEI_PRICE: 'sei_price',
} as const;

export const CACHE_TTL = {
    BALANCE: 30 * 1000, // 30 seconds for balances
    USER_PROFILE: 5 * 60 * 1000, // 5 minutes for user profiles
    TRANSACTIONS: 2 * 60 * 1000, // 2 minutes for transactions
    TRANSACTION_DETAILS: 5 * 60 * 1000, // 5 minutes for transaction details
    CONTACTS: 10 * 60 * 1000, // 10 minutes for contacts
    PRICES: 5 * 60 * 1000, // 5 minutes for prices
} as const;

export function withCache<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    keyGenerator: (...args: T) => string,
    ttl: number = 5 * 60 * 1000
) {
    return async (...args: T): Promise<R> => {
        const key = keyGenerator(...args);

        const cached = cache.get<R>(key);
        if (cached !== null) {
            return cached;
        }

        const result = await fn(...args);
        cache.set(key, result, ttl);

        return result;
    };
}

export function invalidateCache(pattern: string | RegExp): void {
    const stats = cache.getStats();

    for (const key of stats.keys) {
        if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
            cache.delete(key);
        }
    }
}

export async function prefetchData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) {
        return cached;
    }

    const data = await fetcher();
    cache.set(key, data, ttl);
    return data;
}

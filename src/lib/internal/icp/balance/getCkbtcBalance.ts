type BalanceResult = string | null;
import { CACHE_KEYS, CACHE_TTL, withCache } from '@/lib/utils/cache';
import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp';

/**
 * Get cKBTC (Bitcoin) balance for a user (with caching)
 * Fetches real Bitcoin balance from the canister
 */
export const getCkbtcBalance = withCache(
  async (principal: Principal): Promise<BalanceResult> => {
    try {
      const actor = await createAnonymousActorNew();
      if (actor && typeof actor.getUserBitcoinBalance === 'function') {
        const balanceResult = await actor.getUserBitcoinBalance(principal) as bigint;
        const balanceInSatoshis = Number(balanceResult);
        const balanceInBTC = (balanceInSatoshis / 1e8).toFixed(8);
        return balanceInBTC;
      } else {
        return '0.00000000';
      }
    } catch {
      return '0.00000000';
    }
  },
  (principal: Principal) => CACHE_KEYS.CKBT_BALANCE(principal.toString()),
  CACHE_TTL.BALANCE
);


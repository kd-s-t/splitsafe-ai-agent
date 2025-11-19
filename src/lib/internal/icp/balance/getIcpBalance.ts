import { CACHE_KEYS, CACHE_TTL, withCache } from '@/lib/utils/cache';
import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp';

type BalanceResult = string | null;

/**
 * Get ICP balance for a user (with caching)
 */
export const getIcpBalance = withCache(
  async (principal: Principal): Promise<BalanceResult> => {
    try {
      const actor = await createAnonymousActorNew();

      if (actor && typeof actor.getInfo === 'function') {
        const userInfoResult = await actor.getInfo(principal, principal) as { balance?: bigint };
        if (userInfoResult && userInfoResult.balance !== undefined) {
          const icpBalanceResult = userInfoResult.balance as bigint;
          const formattedIcp = (Number(icpBalanceResult) / 1e8).toFixed(8);
          return formattedIcp;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch {
      return null;
    }
  },
  (principal: Principal) => CACHE_KEYS.ICP_BALANCE(principal.toString()),
  CACHE_TTL.BALANCE
);


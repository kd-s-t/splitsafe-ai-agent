import { Principal } from '@dfinity/principal';
import type { UserBalances } from '../types';
import { getCkbtcBalance } from './getCkbtcBalance';
import { getIcpBalance } from './getIcpBalance';

/**
 * Get all balances for a user (ICP, cKBTC)
 */
export async function getAllBalances(principal: Principal): Promise<UserBalances> {
  const [icp, ckbtc] = await Promise.all([
    getIcpBalance(principal),
    getCkbtcBalance(principal)
  ]);

  return { icp, ckbtc, sei: null };
}


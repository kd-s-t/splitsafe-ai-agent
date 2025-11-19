/**
 * Factory function for creating SplitSafe clients
 */

import { SplitSafeClient, type SplitSafeConfig } from './client';

/**
 * Create a new SplitSafe client instance
 * 
 * @example
 * ```typescript
 * import { createSplitSafeClient } from '@splitsafe/sdk';
 * 
 * const client = createSplitSafeClient({
 *   apiKey: process.env.SPLITSAFE_API_KEY!,
 *   environment: 'production'
 * });
 * ```
 */
export function createSplitSafeClient(config: SplitSafeConfig): SplitSafeClient {
  return new SplitSafeClient(config);
}


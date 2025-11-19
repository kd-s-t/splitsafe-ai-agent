import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { createSplitDappActor } from '../splitDapp';
import type { WithdrawalResult } from '../types';

/**
 * Withdraw cKBTC to a Bitcoin address
 */
export async function withdrawBtc(
  principal: Principal,
  amount: bigint,
  address: string
): Promise<WithdrawalResult> {
  try {
    const actor = await createSplitDappActor();

    const result = await actor.withdrawBtc(principal, amount, address) as { ok: string } | { err: string };

    if ('ok' in result) {
      toast.success('Success', { description: 'Bitcoin withdrawal initiated successfully!' });
    } else {
      toast.error('Bitcoin withdrawal failed', { description: result.err });
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toast.error('Failed to withdraw Bitcoin', { description: errorMessage });
    return { err: errorMessage };
  }
}


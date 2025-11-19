import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { createSplitDappActor } from '../splitDapp';
import type { WithdrawalResult } from '../types';

/**
 * Withdraw ICP to an external address
 */
export async function withdrawIcp(
  principal: Principal,
  amount: bigint,
  address: string
): Promise<WithdrawalResult> {
  try {
    const actor = await createSplitDappActor();

    const result = await actor.withdrawIcp(principal, amount, address) as { ok: string } | { err: string };

    if ('ok' in result) {
      toast.success('Success', { description: 'ICP withdrawal initiated successfully!' });
    } else {
      toast.error('ICP withdrawal failed', { description: result.err });
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toast.error('Failed to withdraw ICP', { description: errorMessage });
    return { err: errorMessage };
  }
}


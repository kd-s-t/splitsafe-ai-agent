import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import type { WithdrawalResult } from '../types';

/**
 * Withdraw SEI to an external address
 * Note: SEI withdrawal is not directly supported by the ICP canister.
 * SEI is used for escrow acceleration but not for direct withdrawals.
 */
export async function withdrawSei(
  principal: Principal,
  amount: bigint,
  address: string
): Promise<WithdrawalResult> {
  try {
    const errorMessage = 'SEI direct withdrawal is not supported. SEI is used for escrow acceleration only.';

    console.log({
      principal: principal.toText(),
      amount: amount.toString(),
      address
    });

    toast.error('Error', { description: errorMessage });
    return { err: errorMessage };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toast.error('SEI withdrawal error', { description: errorMessage });
    return { err: errorMessage };
  }
}


import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';
import type { CreateTransactionResult } from '../types';

export async function createTransaction(
  caller: Principal,
  kind: Record<string, null>,
  request: unknown
): Promise<CreateTransactionResult> {
  const actor = await createSplitDappActor();
  if (!actor || typeof (actor as any).createTransaction !== 'function') { // eslint-disable-line @typescript-eslint/no-explicit-any
    return { err: 'createTransaction not available on actor' };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (actor as any).createTransaction(caller, kind as any, request as any);
  return result as CreateTransactionResult;
}



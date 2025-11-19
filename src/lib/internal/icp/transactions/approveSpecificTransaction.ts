import { approveTransactionById } from './approveTransactionById';

/**
 * Approve specific transaction (legacy function)
 */
export async function approveSpecificTransaction(callerPrincipal: string): Promise<boolean> {
  const transactionId = "1755403244998582000-ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe-582000";
  return approveTransactionById(transactionId, callerPrincipal);
}


import { postJson } from './_postJson';
import type { SendEmailPayload } from './types';

export function sendVoucherEmail(payload: SendEmailPayload, baseUrl?: string) {
  return postJson<{ success: boolean; message?: string }>(
    '/api/emails/voucher',
    payload,
    baseUrl,
  )
}



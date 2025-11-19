import { postJson } from './_postJson'
import type { SendEmailPayload } from './types'

export function sendEscrowEmail(payload: SendEmailPayload, baseUrl?: string) {
  return postJson<{ success: boolean }>(
    '/api/emails/escrow',
    payload,
    baseUrl,
  )
}



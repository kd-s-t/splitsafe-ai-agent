import { postJson } from './_postJson'
import type { SendEmailPayload } from './types'

export function sendMilestoneEmail(payload: SendEmailPayload, baseUrl?: string) {
  return postJson<{ success: boolean }>(
    '/api/emails/milestone',
    payload,
    baseUrl,
  )
}



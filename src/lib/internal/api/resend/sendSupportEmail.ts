import { postJson } from './_postJson'

export function sendSupportEmail(payload: {
  name: string
  email: string
  subject: string
  message: string
}, baseUrl?: string) {
  return postJson<{ success: boolean }>(
    '/api/contact',
    payload,
    baseUrl,
  )
}



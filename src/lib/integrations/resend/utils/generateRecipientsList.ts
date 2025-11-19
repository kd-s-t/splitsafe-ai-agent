/**
 * Generate standardized recipients list
 */
export function generateRecipientsList(recipients: Array<{ name: string; email?: string; amount: string; percentage: string }>, coin: string): string {
  return recipients.map(recipient => `
    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin: 8px 0; border-left: 3px solid #007AFF;">
      <p style="margin: 3px 0;"><strong>${recipient.name}</strong> ${recipient.email ? `(${recipient.email})` : ''}</p>
      <p style="margin: 3px 0; color: #666; font-size: 14px;">Amount: ${recipient.amount} ${coin} (${recipient.percentage}%)</p>
    </div>
  `).join('');
}

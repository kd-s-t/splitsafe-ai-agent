import { apiCall } from '@/lib/internal/auth/api-client';
import { generateVoucherRedemptionEmail } from './generateVoucherRedemptionEmail';

export interface VoucherRedemptionEmailData {
  voucherCode: string;
  amount: string;
  redeemerId: string;
  creatorId: string;
  timestamp: number;
}

export class VoucherRedemptionService {
  /**
   * Send voucher redemption notification email
   */
  async sendVoucherRedemptionEmail(data: VoucherRedemptionEmailData): Promise<void> {
    try {
      // Generate the email template
      const emailHtml = generateVoucherRedemptionEmail(data);
      const subject = `Voucher Redeemed: ${data.voucherCode}`;

      // Send email to voucher creator
      // apiCall throws on error, so if we get here, the request succeeded
      await apiCall('/api/emails/voucher', {
        method: 'POST',
        body: JSON.stringify({
          to: 'dev@example.com', // This should be the creator's email
          subject,
          html: emailHtml,
          voucherData: data
        }),
      });
      console.log('✅ Voucher redemption email sent successfully');

    } catch (error) {
      console.error('Error sending voucher redemption email:', error);
    }
  }
}

export const voucherRedemptionService = new VoucherRedemptionService();

import { apiCall } from '@/lib/internal/auth/api-client';
import { EscrowApproveData, generateEscrowApproveEmail } from './generateEscrowApproveEmail';
import { EscrowCancelData, generateEscrowCancelEmail } from './generateEscrowCancelEmail';
import { EscrowDeclineData, generateEscrowDeclineEmail } from './generateEscrowDeclineEmail';
import { EscrowRefundData, generateEscrowRefundEmail } from './generateEscrowRefundEmail';

/**
 * Unified Escrow Notification Service
 * Handles all escrow-related email notifications (approve, decline, cancel, refund)
 */
export class EscrowNotificationService {
  /**
   * Generic email sending method using API route
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const response = await apiCall('/api/emails/escrow', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com', // This will be overridden by the API route
          subject: subject,
          html: html,
        }),
      });

      // apiCall throws on error, so if we get here, the request succeeded
      try {
        const responseText = await response.text();
        if (responseText) {
          const result = JSON.parse(responseText);
          if (result.skipped) {
            console.log('📧 Escrow email skipped (service not configured)');
          } else if (result.blocked) {
            console.log('📧 Escrow email blocked (domain not verified)');
          } else {
            console.log('✅ Escrow email sent successfully');
          }
        }
      } catch (parseError) {
        console.error('📧 Failed to parse email API response:', parseError);
        console.log('✅ Escrow email sent successfully (parse error)');
      }
    } catch (error) {
      console.error('Error sending escrow email:', error);
    }
  }

  /**
   * Send escrow approval notification
   */
  async sendEscrowApprovalEmail(data: EscrowApproveData): Promise<void> {
    const emailHtml = generateEscrowApproveEmail(data);
    const subject = `Escrow Approved: ${data.title}`;
    await this.sendEmail('test@example.com', subject, emailHtml);
  }

  /**
   * Send escrow decline notification
   */
  async sendEscrowDeclineEmail(data: EscrowDeclineData): Promise<void> {
    const emailHtml = generateEscrowDeclineEmail(data);
    const subject = `Escrow Declined: ${data.title}`;
    await this.sendEmail('test@example.com', subject, emailHtml);
  }

  /**
   * Send escrow cancellation notification
   */
  async sendEscrowCancelEmail(data: EscrowCancelData): Promise<void> {
    const emailHtml = generateEscrowCancelEmail(data);
    const subject = `Escrow Cancelled: ${data.title}`;
    await this.sendEmail('test@example.com', subject, emailHtml);
  }

  /**
   * Send escrow refund notification
   */
  async sendEscrowRefundEmail(data: EscrowRefundData): Promise<void> {
    const emailHtml = generateEscrowRefundEmail(data);
    const subject = `Escrow Refunded: ${data.title}`;
    await this.sendEmail('test@example.com', subject, emailHtml);
  }
}

// Export singleton instance
export const escrowNotificationService = new EscrowNotificationService();


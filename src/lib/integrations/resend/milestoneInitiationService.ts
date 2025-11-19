import { apiCall } from '@/lib/internal/auth/api-client';
import { MilestoneEmailData, RecipientEmailData } from '@/lib/integrations/resend/types';
import { generateMilestoneInitiateEmail } from './generateMilestoneInitiateEmail';

export class MilestoneInitiationService {
  /**
   * Send milestone initiation emails to all recipients
   */
  async sendMilestoneInitiationEmails(data: MilestoneEmailData, recipients: RecipientEmailData[]): Promise<void> {
    try {
      
      // Generate the email template
      const emailHtml = generateMilestoneInitiateEmail(data);
      const subject = `New Milestone: ${data.title}`;

      // Send emails to all recipients who have email addresses
      const validRecipients = recipients.filter(recipient => recipient.email && typeof recipient.email === 'string' && recipient.email.trim() !== '');
      
      // Send emails sequentially with delay to avoid rate limiting
      for (let i = 0; i < validRecipients.length; i++) {
        const recipient = validRecipients[i];
        try {
          // apiCall throws on error, so if we get here, the request succeeded
          const response = await apiCall('/api/emails/milestone', {
            method: 'POST',
            body: JSON.stringify({
              to: recipient.email,
              subject: `${subject} - You're a recipient!`,
              html: emailHtml,
            }),
          });

          const responseData = await response.json().catch(() => ({}));
          if (responseData.blocked) {
            console.log(`📧 Email to ${recipient.email} blocked by Resend (domain not verified) - this is expected in development`);
          } else {
            console.log(`✅ Email sent successfully to ${recipient.email}`);
          }
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error);
        }
        
        // Add delay between emails to avoid rate limiting (1 second delay)
        if (i < validRecipients.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
    } catch (error) {
      console.error('Error sending milestone initiation emails:', error);
    }
  }
}

// Export singleton instance
export const milestoneInitiationService = new MilestoneInitiationService();

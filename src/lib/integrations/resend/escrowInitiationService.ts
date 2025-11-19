import { apiCall } from '@/lib/internal/auth/api-client';
import { generateEscrowInitiateEmail } from './generateEscrowInitiateEmail';
import { EscrowEmailData } from './types';

export class EscrowInitiationService {
  /**
   * Send escrow initiation emails to all recipients
   */
  async sendEscrowInitiationEmails(data: EscrowEmailData): Promise<void> {
    try {
      
      // Generate the email template
      const emailHtml = generateEscrowInitiateEmail(data);
      const subject = `New Escrow: ${data.title}`;

      // Check if any recipients have email addresses
      const recipientsWithEmails = data.recipients.filter(recipient => recipient.email);
      
      console.log(`📧 Email check: ${data.recipients.length} total recipients, ${recipientsWithEmails.length} with emails`);
      
      // If no recipients have emails, send to dev email instead
      if (recipientsWithEmails.length === 0) {
        console.log('📧 No recipients have email addresses - sending to dev email instead');
        console.log('📧 No recipients have email addresses - skipping email notifications');
        return;
        
        // Send one email to dev email for all recipients
        const response = await apiCall('/api/emails/escrow', {
          method: 'POST',
          body: JSON.stringify({
            to: 'support@example.com',
            subject: `[ESCROW] ${subject} - ${data.recipients.length} recipients`,
            html: emailHtml,
          }),
        });

        if (!response.ok) {
          try {
            const error = await response.json();
            console.error(`Failed to send dev email:`, error);
          } catch {
            console.error(`Failed to send dev email - non-JSON response:`, {
              status: response.status,
              statusText: response.statusText,
              url: response.url
            });
          }
        } else {
          console.log('✅ Dev email sent successfully');
        }
        return;
      }

      
      // Send emails to all recipients who have email addresses
      const emailPromises = recipientsWithEmails.map(async (recipient) => {
          try {
            await apiCall('/api/emails/escrow', {
              method: 'POST',
              body: JSON.stringify({
                to: recipient.email,
                subject: `${subject} - You're a recipient!`,
                html: emailHtml,
              }),
            });

            // apiCall throws on error, so if we get here, the request succeeded
            console.log(`✅ Email sent to ${recipient.email}`);
          } catch (error) {
            console.error(`Error sending email to ${recipient.email}:`, error);
          }
        });

      // Wait for all emails to be sent
      await Promise.all(emailPromises);
      
    } catch (error) {
      console.error('Error sending escrow initiation emails:', error);
    }
  }
}

// Export singleton instance
export const escrowInitiationService = new EscrowInitiationService();

import { apiCall } from '@/lib/internal/auth/api-client';
import { generateEscrowInitiateEmail } from './generateEscrowInitiateEmail';
import { generateMilestoneInitiateEmail } from './generateMilestoneInitiateEmail';
import { EscrowEmailData, MilestoneEmailData } from './types';

export class CreatorNotificationService {
  /**
   * Send notification email to the creator (for confirmation)
   */
  async sendCreatorNotificationEmail(
    type: 'escrow' | 'milestone',
    data: EscrowEmailData | MilestoneEmailData,
    creatorEmail?: string
  ): Promise<void> {
    if (!creatorEmail) {
      return;
    }

    try {
      
      let emailHtml: string;
      let subject: string;

      if (type === 'escrow') {
        const escrowData = data as EscrowEmailData;
        emailHtml = generateEscrowInitiateEmail(escrowData);
        subject = `Escrow Created: ${escrowData.title}`;
      } else {
        const milestoneData = data as MilestoneEmailData;
        emailHtml = generateMilestoneInitiateEmail(milestoneData);
        subject = `Milestone Created: ${milestoneData.title}`;
      }

      const endpoint = type === 'escrow' ? '/api/emails/escrow' : '/api/emails/milestone';
      // apiCall throws on error, so if we get here, the request succeeded
      await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          to: creatorEmail,
          subject: subject,
          html: emailHtml,
        }),
      });
      console.log('✅ Creator notification email sent successfully');
    } catch (error) {
      console.error('Error sending creator notification email:', error);
    }
  }
}

// Export singleton instance
export const creatorNotificationService = new CreatorNotificationService();

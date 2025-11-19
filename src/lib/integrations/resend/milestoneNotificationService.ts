import { generateMilestoneApprovalEmail } from './generateMilestoneApprovalEmail';
import { generateMilestoneCompletionEmail } from './generateMilestoneCompletionEmail';
import { generateMilestoneContractEmail } from './generateMilestoneContractEmail';
import { generateMilestoneDeclineEmail } from './generateMilestoneDeclineEmail';
import { generateMilestoneProofEmail } from './generateMilestoneProofEmail';
import { generateMilestoneReleaseEmail } from './generateMilestoneReleaseEmail';

export interface MilestoneApprovalData {
  milestoneId: string;
  transactionId: string;
  title: string;
  recipientName: string;
  approvedAt: string;
}

export interface MilestoneCompletionData {
  milestoneId: string;
  transactionId: string;
  title: string;
  totalAmount: bigint;
  totalRecipients: number;
}

export interface MilestoneReleaseData {
  milestoneId: string;
  transactionId: string;
  title: string;
  recipientName: string;
  amount: bigint;
  totalAmount: bigint;
}

export interface MilestoneDeclineData {
  milestoneId: string;
  transactionId: string;
  title: string;
  recipientName: string;
  declinedAt: string;
}

export interface MilestoneContractData {
  milestoneId: string;
  transactionId: string;
  title: string;
  recipientName: string;
  contractFile: string;
  signingDeadline: string;
}

export interface MilestoneProofData {
  milestoneId: string;
  transactionId: string;
  title: string;
  recipientName: string;
  description: string;
  submittedAt: string;
  screenshotsCount: number;
  filesCount: number;
}

export class MilestoneNotificationService {
  /**
   * Send milestone approval notification
   */
  async sendMilestoneApprovalEmail(data: MilestoneApprovalData, recipientEmail?: string): Promise<void> {
    if (!recipientEmail) return;

    try {
      const emailHtml = generateMilestoneApprovalEmail({
        milestoneId: data.milestoneId,
        recipientId: data.recipientName, // Using recipientName as recipientId
        approvedBy: 'System', // Default value since not provided
        approvedAt: data.approvedAt
      });
      const subject = `Milestone Approved: ${data.title}`;

      await this.sendEmail(recipientEmail, subject, emailHtml);
    } catch (error) {
      console.error('Error sending milestone approval email:', error);
    }
  }

  /**
   * Send milestone completion notification
   */
  async sendMilestoneCompletionEmail(data: MilestoneCompletionData, creatorEmail?: string): Promise<void> {
    if (!creatorEmail) return;

    try {
      const emailHtml = generateMilestoneCompletionEmail({
        milestoneId: data.milestoneId,
        title: data.title,
        completedBy: 'System', // Default value since not provided
        completedAt: new Date().toISOString(), // Default to current time
        totalRecipients: data.totalRecipients
      });
      const subject = `Milestone Completed: ${data.title}`;

      await this.sendEmail(creatorEmail, subject, emailHtml);
    } catch (error) {
      console.error('Error sending milestone completion email:', error);
    }
  }

  /**
   * Send milestone release notification
   */
  async sendMilestoneReleaseEmail(data: MilestoneReleaseData, recipientEmail?: string): Promise<void> {
    if (!recipientEmail) return;

    try {
      const emailHtml = generateMilestoneReleaseEmail({
        milestoneId: data.milestoneId,
        title: data.title,
        releasedBy: 'System', // Default value since not provided
        releasedAt: new Date().toISOString(), // Default to current time
        totalAmount: data.totalAmount
      });
      const subject = `Payment Released: ${data.title}`;

      await this.sendEmail(recipientEmail, subject, emailHtml);
    } catch (error) {
      console.error('Error sending milestone release email:', error);
    }
  }

  /**
   * Send milestone decline notification
   */
  async sendMilestoneDeclineEmail(data: MilestoneDeclineData, creatorEmail?: string): Promise<void> {
    if (!creatorEmail) return;

    try {
      const emailHtml = generateMilestoneDeclineEmail({
        milestoneId: data.milestoneId,
        recipientId: data.recipientName, // Using recipientName as recipientId
        declinedBy: 'System', // Default value since not provided
        declinedAt: data.declinedAt
      });
      const subject = `Milestone Declined: ${data.title}`;

      await this.sendEmail(creatorEmail, subject, emailHtml);
    } catch (error) {
      console.error('Error sending milestone decline email:', error);
    }
  }

  /**
   * Send contract signing notification
   */
  async sendMilestoneContractEmail(data: MilestoneContractData, recipientEmail?: string): Promise<void> {
    if (!recipientEmail) return;

    try {
      const emailHtml = generateMilestoneContractEmail({
        milestoneId: data.milestoneId,
        transactionId: data.transactionId,
        title: data.title,
        recipientName: data.recipientName,
        contractFile: data.contractFile,
        signingDeadline: data.signingDeadline
      });
      const subject = `Contract Signing Required: ${data.title}`;

      await this.sendEmail(recipientEmail, subject, emailHtml);
    } catch (error) {
      console.error('Error sending milestone contract email:', error);
    }
  }

  /**
   * Send proof of work submission notification
   */
  async sendMilestoneProofEmail(data: MilestoneProofData, creatorEmail?: string): Promise<void> {
    if (!creatorEmail) return;

    try {
      const emailHtml = generateMilestoneProofEmail({
        milestoneId: data.milestoneId,
        transactionId: data.transactionId,
        title: data.title,
        recipientName: data.recipientName,
        description: data.description,
        submittedAt: data.submittedAt,
        screenshotsCount: data.screenshotsCount,
        filesCount: data.filesCount
      });
      const subject = `Proof of Work Submitted: ${data.title}`;

      await this.sendEmail(creatorEmail, subject, emailHtml);
    } catch (error) {
      console.error('Error sending milestone proof email:', error);
    }
  }

  /**
   * Generic email sending method
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const { apiCall } = await import('@/lib/internal/auth/api-client');
      // apiCall throws on error, so if we get here, the request succeeded
      await apiCall('/api/emails/milestone', {
        method: 'POST',
        body: JSON.stringify({
          to,
          subject,
          html,
        }),
      });
      console.log(`✅ Milestone email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
    }
  }
}

// Export singleton instance
export const milestoneNotificationService = new MilestoneNotificationService();

import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface MilestoneDeclineEmailData {
  milestoneId: string;
  recipientId: string;
  declinedBy: string;
  declinedAt: string;
}

/**
 * Generate HTML email template for milestone decline
 */
export function generateMilestoneDeclineEmail(data: MilestoneDeclineEmailData): string {
  const header = generateEmailHeader('Milestone Declined');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Decline Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Milestone ID', data.milestoneId, true)}
      ${generateFieldDisplay('Recipient ID', data.recipientId, true)}
      ${generateFieldDisplay('Declined by', data.declinedBy)}
      ${generateFieldDisplay('Declined at', data.declinedAt)}
    `)}
    
    <p style="color: #666; margin: 20px 0;">
      This milestone has been declined by the recipient. The milestone will not proceed until all recipients approve.
    </p>
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#dc3545')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

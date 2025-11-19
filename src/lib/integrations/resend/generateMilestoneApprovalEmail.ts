import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface MilestoneApprovalEmailData {
  milestoneId: string;
  recipientId: string;
  approvedBy: string;
  approvedAt: string;
}

/**
 * Generate HTML email template for milestone approval
 */
export function generateMilestoneApprovalEmail(data: MilestoneApprovalEmailData): string {
  const header = generateEmailHeader('Milestone Approved!');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Approval Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Milestone ID', data.milestoneId, true)}
      ${generateFieldDisplay('Recipient ID', data.recipientId, true)}
      ${generateFieldDisplay('Approved by', data.approvedBy)}
      ${generateFieldDisplay('Approved at', data.approvedAt)}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#28a745')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface MilestoneCompletionEmailData {
  milestoneId: string;
  title: string;
  completedBy: string;
  completedAt: string;
  totalRecipients: number;
}

/**
 * Generate HTML email template for milestone completion
 */
export function generateMilestoneCompletionEmail(data: MilestoneCompletionEmailData): string {
  const header = generateEmailHeader(' Milestone Completed!');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Completion Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Milestone ID', data.milestoneId, true)}
      ${generateFieldDisplay('Total Recipients', data.totalRecipients.toString())}
      ${generateFieldDisplay('Completed by', data.completedBy)}
      ${generateFieldDisplay('Completed at', data.completedAt)}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#6f42c1')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface MilestoneReleaseEmailData {
  milestoneId: string;
  title: string;
  releasedBy: string;
  releasedAt: string;
  totalAmount: bigint;
}

/**
 * Generate HTML email template for milestone release
 */
export function generateMilestoneReleaseEmail(data: MilestoneReleaseEmailData): string {
  const header = generateEmailHeader('Milestone Released!');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Release Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Milestone ID', data.milestoneId, true)}
      ${generateFieldDisplay('Total Amount', `${(Number(data.totalAmount) / 1e8).toFixed(8)} BTC`)}
      ${generateFieldDisplay('Released by', data.releasedBy)}
      ${generateFieldDisplay('Released at', data.releasedAt)}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#17a2b8')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

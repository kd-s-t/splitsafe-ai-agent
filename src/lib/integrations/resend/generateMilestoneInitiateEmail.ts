import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface MilestoneInitiateData {
  title: string;
  milestoneId: string;
  transactionId: string;
  allocation: bigint;
  recipientsCount: number;
  frequency: string;
}

/**
 * Generate HTML email template for milestone creation
 */
export function generateMilestoneInitiateEmail(data: MilestoneInitiateData): string {
  const header = generateEmailHeader('Milestone Created Successfully!');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Milestone Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Milestone ID', data.milestoneId, true)}
      ${generateFieldDisplay('Transaction ID', data.transactionId, true)}
      ${generateFieldDisplay('Total Allocation', `${(Number(data.allocation) / 1e8).toFixed(8)} BTC`)}
      ${generateFieldDisplay('Recipients', data.recipientsCount.toString())}
      ${generateFieldDisplay('Frequency', data.frequency)}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#FEB64D')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

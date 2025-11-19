import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface EscrowReleaseData {
  escrowId: string;
  title: string;
  releasedBy: string;
  releasedAt: string;
  amount: bigint;
  coin: string;
  recipientCount: number;
}

/**
 * Generate HTML email template for escrow release
 */
export function generateEscrowReleaseEmail(data: EscrowReleaseData): string {
  const header = generateEmailHeader('Escrow Released!');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Release Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Escrow ID', data.escrowId, true)}
      ${generateFieldDisplay('Total Amount', `${(Number(data.amount) / 1e8).toFixed(8)} ${data.coin}`)}
      ${generateFieldDisplay('Recipients', data.recipientCount.toString())}
      ${generateFieldDisplay('Released by', data.releasedBy)}
      ${generateFieldDisplay('Released at', data.releasedAt)}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#17a2b8')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

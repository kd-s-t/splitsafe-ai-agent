import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface EscrowDeclineData {
  escrowId: string;
  title: string;
  declinedBy: string;
  declinedAt: string;
  amount: bigint;
  coin: string;
  reason?: string;
}

/**
 * Generate HTML email template for escrow decline
 */
export function generateEscrowDeclineEmail(data: EscrowDeclineData): string {
  const header = generateEmailHeader('Escrow Declined');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Decline Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Escrow ID', data.escrowId, true)}
      ${generateFieldDisplay('Amount', `${(Number(data.amount) / 1e8).toFixed(8)} ${data.coin}`)}
      ${generateFieldDisplay('Declined by', data.declinedBy)}
      ${generateFieldDisplay('Declined at', data.declinedAt)}
      ${data.reason ? generateFieldDisplay('Reason', data.reason) : ''}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#dc3545')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

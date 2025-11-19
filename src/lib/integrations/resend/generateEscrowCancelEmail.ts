import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface EscrowCancelData {
  escrowId: string;
  title: string;
  cancelledBy: string;
  cancelledAt: string;
  amount: bigint;
  coin: string;
  reason?: string;
}

/**
 * Generate HTML email template for escrow cancellation
 */
export function generateEscrowCancelEmail(data: EscrowCancelData): string {
  const header = generateEmailHeader('Escrow Cancelled');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Cancellation Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Escrow ID', data.escrowId, true)}
      ${generateFieldDisplay('Amount', `${(Number(data.amount) / 1e8).toFixed(8)} ${data.coin}`)}
      ${generateFieldDisplay('Cancelled by', data.cancelledBy)}
      ${generateFieldDisplay('Cancelled at', data.cancelledAt)}
      ${data.reason ? generateFieldDisplay('Reason', data.reason) : ''}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#6c757d')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

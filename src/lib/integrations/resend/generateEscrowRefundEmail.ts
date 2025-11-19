import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface EscrowRefundData {
  escrowId: string;
  title: string;
  refundedBy: string;
  refundedAt: string;
  amount: bigint;
  coin: string;
  refundReason?: string;
}

/**
 * Generate HTML email template for escrow refund
 */
export function generateEscrowRefundEmail(data: EscrowRefundData): string {
  const header = generateEmailHeader('Escrow Refunded');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Refund Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Escrow ID', data.escrowId, true)}
      ${generateFieldDisplay('Refund Amount', `${(Number(data.amount) / 1e8).toFixed(8)} ${data.coin}`)}
      ${generateFieldDisplay('Refunded by', data.refundedBy)}
      ${generateFieldDisplay('Refunded at', data.refundedAt)}
      ${data.refundReason ? generateFieldDisplay('Reason', data.refundReason) : ''}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#fd7e14')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

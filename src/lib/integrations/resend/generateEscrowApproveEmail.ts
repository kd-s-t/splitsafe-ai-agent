import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface EscrowApproveData {
  escrowId: string;
  title: string;
  approvedBy: string;
  approvedAt: string;
  amount: bigint;
  coin: string;
}

/**
 * Generate HTML email template for escrow approval
 */
export function generateEscrowApproveEmail(data: EscrowApproveData): string {
  const header = generateEmailHeader('Escrow Approved!');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Approval Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Escrow ID', data.escrowId, true)}
      ${generateFieldDisplay('Amount', `${(Number(data.amount) / 1e8).toFixed(8)} ${data.coin}`)}
      ${generateFieldDisplay('Approved by', data.approvedBy)}
      ${generateFieldDisplay('Approved at', data.approvedAt)}
    `)}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#28a745')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateAlertBox } from './utils/generateAlertBox';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';
import { generateRecipientsList } from './utils/generateRecipientsList';

export interface EscrowInitiateData {
  escrowId: string;
  title: string;
  createdBy: string;
  createdAt: string;
  amount: bigint;
  coin: string;
  recipientCount: number;
  recipients: Array<{
    name: string;
    email?: string;
    amount: string;
    percentage: string;
  }>;
}

/**
 * Generate HTML email template for escrow initiation
 */
export function generateEscrowInitiateEmail(data: EscrowInitiateData): string {
  const header = generateEmailHeader('New Escrow Created!');

  const detailsContent = `
    <h2 style="color: #333; margin-top: 0;">Escrow Details</h2>
    
    ${generateInfoBox(`
      ${generateFieldDisplay('Title', data.title)}
      ${generateFieldDisplay('Escrow ID', data.escrowId, true)}
      ${generateFieldDisplay('Total Amount', `${(Number(data.amount) / 1e8).toFixed(8)} ${data.coin}`)}
      ${generateFieldDisplay('Recipients', data.recipientCount.toString())}
      ${generateFieldDisplay('Created By', data.createdBy)}
      ${generateFieldDisplay('Created At', new Date(data.createdAt).toLocaleString())}
    `)}
    
    <h3 style="color: #333; margin-top: 25px;">Recipients</h3>
    ${generateRecipientsList(data.recipients, data.coin)}
    
    ${generateAlertBox('📧 Action Required<br>Recipients will receive email notifications to approve or decline this escrow.', 'info')}
    
    ${generateActionButton('View Transaction', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/transactions`, '#007AFF')}
  `;

  const content = generateContentCard(detailsContent);
  const footer = generateEmailFooter();

  return generateEmailContainer(header + content + footer);
}

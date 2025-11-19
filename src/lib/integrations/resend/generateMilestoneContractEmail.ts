import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface MilestoneContractEmailData {
  milestoneId: string;
  transactionId: string;
  title: string;
  recipientName: string;
  contractFile: string;
  signingDeadline: string;
}

export function generateMilestoneContractEmail(data: MilestoneContractEmailData): string {
  const header = generateEmailHeader("Contract Signing Required");
  const footer = generateEmailFooter();

  const content = `
    <div style="margin-bottom: 20px;">
      <p>Hello ${data.recipientName},</p>
      <p>A milestone contract is ready for your signature. Please review and sign the contract to proceed with the milestone.</p>
    </div>

    ${generateContentCard(`
      ${generateFieldDisplay("Milestone ID", data.milestoneId)}
      ${generateFieldDisplay("Transaction ID", data.transactionId)}
      ${generateFieldDisplay("Title", data.title)}
      ${generateFieldDisplay("Signing Deadline", data.signingDeadline)}
    `)}

    ${generateInfoBox("Please review the contract carefully before signing. Once signed, you'll be committed to the milestone terms and conditions.")}

    ${generateActionButton("Review & Sign Contract", `https://thesplitsafe.com/transactions/${data.transactionId}/milestone/${data.milestoneId}/contract`)}
  `;

  return generateEmailContainer(header + content + footer);
}

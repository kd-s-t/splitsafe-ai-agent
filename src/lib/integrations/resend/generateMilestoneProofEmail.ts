import { generateEmailFooter } from './layout/generateEmailFooter';
import { generateEmailHeader } from './layout/generateEmailHeader';
import { generateActionButton } from './utils/generateActionButton';
import { generateContentCard } from './utils/generateContentCard';
import { generateEmailContainer } from './utils/generateEmailContainer';
import { generateFieldDisplay } from './utils/generateFieldDisplay';
import { generateInfoBox } from './utils/generateInfoBox';

export interface MilestoneProofEmailData {
  milestoneId: string;
  transactionId: string;
  title: string;
  recipientName: string;
  description: string;
  submittedAt: string;
  screenshotsCount: number;
  filesCount: number;
}

export function generateMilestoneProofEmail(data: MilestoneProofEmailData): string {
  const header = generateEmailHeader("Proof of Work Submitted");
  const footer = generateEmailFooter();

  const content = `
    <div style="margin-bottom: 20px;">
      <p>Hello,</p>
      <p>${data.recipientName} has submitted proof of work for the milestone. Please review the submission and approve or request changes.</p>
    </div>

    ${generateContentCard(`
      ${generateFieldDisplay("Milestone ID", data.milestoneId)}
      ${generateFieldDisplay("Transaction ID", data.transactionId)}
      ${generateFieldDisplay("Title", data.title)}
      ${generateFieldDisplay("Submitted By", data.recipientName)}
      ${generateFieldDisplay("Submitted At", data.submittedAt)}
      ${generateFieldDisplay("Screenshots", data.screenshotsCount.toString())}
      ${generateFieldDisplay("Files", data.filesCount.toString())}
    `)}

    <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #333;">Description:</h4>
      <p style="margin: 0; color: #666; line-height: 1.5;">${data.description}</p>
    </div>

    ${generateInfoBox("Please review the proof of work submission carefully. You can approve it to release payment or request changes if needed.")}

    ${generateActionButton("Review Submission", `https://thesplitsafe.com/transactions/${data.transactionId}/milestone/${data.milestoneId}/proof`)}
  `;

  return generateEmailContainer(header + content + footer);
}

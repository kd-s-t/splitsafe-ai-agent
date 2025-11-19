// Resend Integration Types

export interface RecipientEmailData {
  email: string | undefined;
  name: string;
  amount: string;
  percentage: string;
}

export interface EscrowEmailData {
  escrowId: string;
  title: string;
  createdBy: string;
  createdAt: string;
  amount: bigint;
  coin: string;
  recipientCount: number;
  recipients: RecipientEmailData[];
}

export interface MilestoneEmailData {
  milestoneId: string;
  transactionId: string;
  title: string;
  allocation: bigint;
  recipientsCount: number;
  frequency: string;
}

// Resend Service Response Types
export interface ResendServiceResponse {
  success: boolean;
  error?: string;
  blocked?: boolean;
}

export interface ResendEmailRequest {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

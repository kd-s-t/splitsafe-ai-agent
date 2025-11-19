export type StorySetupRequest = {
  escrowId: string;
  title: string;
  description: string;
  creator: string;
  participants: unknown[];
  totalAmount: string;
  createdAt: number;
};

export type StoryAttestAction =
  | 'approve_attest'
  | 'cancel_attest'
  | 'decline_attest'
  | 'refund_attest'
  | 'release_attest'
  | 'transfer_attest';

export type StoryAttestRequest = {
  escrowId: string;
  action: StoryAttestAction;
};

export type StorySetupResponse = {
  success?: boolean;
  ipAssetId?: string;
  transactionHash?: string;
  error?: string;
};

export type StoryAttestResponse = {
  transactionHash?: string;
  error?: string;
};



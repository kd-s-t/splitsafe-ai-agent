// Main Email Service
export * from './emailService';

// Email Services
export * from './creatorNotificationService';
export * from './escrowInitiationService';
export * from './escrowNotificationService';
export * from './escrowReleaseService';
export * from './milestoneInitiationService';
export * from './milestoneNotificationService';

// Email Template Functions
export * from './generateEscrowApproveEmail';
export * from './generateEscrowCancelEmail';
export * from './generateEscrowDeclineEmail';
export * from './generateEscrowInitiateEmail';
export * from './generateEscrowRefundEmail';
export * from './generateEscrowReleaseEmail';
export * from './generateMilestoneApprovalEmail';
export * from './generateMilestoneCompletionEmail';
export * from './generateMilestoneContractEmail';
export * from './generateMilestoneDeclineEmail';
export * from './generateMilestoneInitiateEmail';
export * from './generateMilestoneProofEmail';
export * from './generateMilestoneReleaseEmail';

// Email Component Functions
export * from './layout';
export * from './utils';

// Types
export * from './types';

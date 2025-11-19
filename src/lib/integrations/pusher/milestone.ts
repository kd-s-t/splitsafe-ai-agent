
// Valid milestone event types
export const MILESTONE_EVENT_TYPES = [
  'milestone-created',
  'milestone-approved',
  'milestone-declined',
  'contract-signed',
  'contract-approved',
  'milestone-completed',
  'milestone-released',
  'proof-of-work-submitted',
  'milestone-payment-released'
] as const;

export type MilestoneEventType = typeof MILESTONE_EVENT_TYPES[number];

// Milestone notification data interface
export interface MilestoneNotificationData {
  id: string;
  milestoneId: string;
  transactionId: string;
  title: string;
  from: string;
  amount?: string;
  monthNumber?: number;
  recipientName?: string;
  recipientPrincipal?: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Send milestone notification via Pusher
 */
export async function sendMilestoneNotification(
  recipientPrincipal: string,
  eventType: MilestoneEventType,
  milestoneData: MilestoneNotificationData
): Promise<void> {
  try {
    const { apiCall } = await import('@/lib/internal/auth/api-client');
    // apiCall throws on error, so if we get here, the request succeeded
    const response = await apiCall('/api/events/milestone', {
      method: 'POST',
      body: JSON.stringify({
        recipientPrincipal,
        eventType,
        milestoneData
      })
    });
    const result = await response.json();
    console.log(`✅ Milestone notification sent: ${eventType}`, result);
  } catch (error) {
    console.error('Error sending milestone notification:', error);
    // Don't throw - notifications are not critical for core functionality
  }
}

/**
 * Send milestone creation notification
 */
export async function sendMilestoneCreatedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'milestone-created', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send milestone approval notification
 */
export async function sendMilestoneApprovedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
    recipientName: string;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'milestone-approved', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send milestone decline notification
 */
export async function sendMilestoneDeclinedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
    recipientName: string;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'milestone-declined', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send contract signed notification
 */
export async function sendContractSignedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
    recipientName: string;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'contract-signed', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send contract approved notification
 */
export async function sendContractApprovedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
    recipientName: string;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'contract-approved', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send milestone completed notification
 */
export async function sendMilestoneCompletedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
    monthNumber: number;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'milestone-completed', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send milestone released notification
 */
export async function sendMilestoneReleasedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
    monthNumber: number;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'milestone-released', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send proof of work submitted notification
 */
export async function sendProofOfWorkSubmittedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
    recipientName: string;
    monthNumber: number;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'proof-of-work-submitted', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send milestone payment released notification
 */
export async function sendMilestonePaymentReleasedNotification(
  recipientPrincipal: string,
  milestoneData: {
    id: string;
    milestoneId: string;
    transactionId: string;
    title: string;
    from: string;
    amount: string;
    monthNumber: number;
  }
): Promise<void> {
  await sendMilestoneNotification(recipientPrincipal, 'milestone-payment-released', {
    ...milestoneData,
    timestamp: new Date().toISOString()
  });
}

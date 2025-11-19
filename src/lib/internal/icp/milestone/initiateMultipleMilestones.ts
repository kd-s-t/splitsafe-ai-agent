import {
  sendMilestoneCreatedNotification
} from '@/lib/integrations/pusher/milestone';
import {
  RecipientEmailData,
  milestoneInitiationService
} from '@/lib/integrations/resend';
import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';
import { InitiateMultipleMilestonesRequest, MilestoneResult } from './types';

/**
 * Initiate multiple milestones in a single transaction
 */
export async function initiateMultipleMilestones(
  caller: Principal,
  request: InitiateMultipleMilestonesRequest
): Promise<MilestoneResult> {
  try {
    const actor = await createSplitDappActor();
    
    const result = await actor.initiateMultipleMilestones(
      caller,
      request
    ) as MilestoneResult;
    
    
    if ('ok' in result) {
      const milestoneId = result.ok.milestoneId;
      const transactionId = result.ok.transactionId;
      
      const recipientEmailData: RecipientEmailData[] = [];

      const allRecipients = request.milestones.flatMap(milestone => milestone.recipients);
      const milestoneEmailData = {
        milestoneId,
        transactionId,
        title: request.title,
        allocation: request.milestones.reduce((sum, m) => sum + m.allocation, BigInt(0)),
        recipientsCount: allRecipients.length,
        frequency: Object.keys(request.milestones[0]?.frequency || { day: BigInt(1) })[0]
      };

      milestoneInitiationService.sendMilestoneInitiationEmails(milestoneEmailData, recipientEmailData)

      try {
        const totalAmount = request.milestones.reduce((sum, m) => sum + Number(m.allocation), 0);
        
        for (const recipient of allRecipients) {
          await sendMilestoneCreatedNotification(recipient.principal.toString(), {
            id: transactionId,
            milestoneId,
            transactionId,
            title: request.title,
            from: caller.toString(),
            amount: totalAmount.toString()
          });
        }
        
      } catch (error) {
        console.warn('Failed to send milestone notification:', error);
      }
    }
    
    return result;
  } catch (error) {
    return {
      err: error instanceof Error ? error.message : String(error)
    };
  }
}


import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp/splitDappNew';

/**
 * Get unread notification count
 */
export async function getUnreadCount(principal: Principal): Promise<number> {
  try {
    const actor = await createAnonymousActorNew();
    
    if (actor && typeof actor.getUnreadCount === 'function') {
      const count = await actor.getUnreadCount(principal) as bigint;
      return Number(count);
    } else {
      return 0;
    }
  } catch {
    return 0;
  }
}

export { getUnreadCount as getUnreadCountNew } from './notificationsNew';

import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp';
import { UserInfo } from '../types';

/**
 * Get complete user info (nickname, username, picture, email, balance)
 */
export async function getInfo(principal: Principal, caller: Principal): Promise<UserInfo | null> {
  try {
    const actor = await createAnonymousActorNew();
    
    if (actor && typeof actor.getInfo === 'function') {
      const userInfoResult = await actor.getInfo(principal, caller) as UserInfo | null;
      return userInfoResult;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}


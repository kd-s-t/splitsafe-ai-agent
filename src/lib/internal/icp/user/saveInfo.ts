import { Principal } from '@dfinity/principal';
import { createAuthenticatedActorNew } from '../splitDapp';
import { SaveInfoRequest } from '../types';

/**
 * Save complete user info (nickname, username, picture, email)
 */
export async function saveInfo(principal: Principal, request: SaveInfoRequest): Promise<boolean> {
  try {
    
    const actor = await createAuthenticatedActorNew();
    
    if (actor && typeof actor.saveInfo === 'function') {
      await actor.saveInfo(principal, request);
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}


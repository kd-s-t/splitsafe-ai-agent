import { createAnonymousActorNew } from '../splitDapp';
import { UserWithPrincipal } from '../types';

/**
 * Get all users in the system
 */
export async function getAllUsers(): Promise<UserWithPrincipal[]> {
  try {
    const actor = await createAnonymousActorNew();
    
    if (actor && typeof actor.getAllUsers === 'function') {
      const users = await actor.getAllUsers() as UserWithPrincipal[];
      return users;
    } else {
      return [];
    }
  } catch {
    return [];
  }
}


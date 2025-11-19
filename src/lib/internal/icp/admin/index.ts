import { Principal } from '@dfinity/principal';
import { createAnonymousActorNew } from '../splitDapp';

/**
 * Get the admin principal from the ICP backend
 */
export async function getAdmin(): Promise<Principal | null> {
  try {
    const actor = await createAnonymousActorNew();
    
    if (actor && typeof actor.getAdmin === 'function') {
      const adminPrincipal = await actor.getAdmin() as Principal;
      return adminPrincipal;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Check if a user is admin by comparing their principal with the admin principal
 */
export async function isUserAdmin(userPrincipal: Principal): Promise<boolean> {
  try {
    const adminPrincipal = await getAdmin();
    if (!adminPrincipal) {
      return false;
    }
    
    const isAdmin = userPrincipal?.toText() === adminPrincipal?.toText();
    
    const defaultAdminPrincipal = process.env.VITE_ADMIN_PRINCIPAL || "ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe";
    const isDefaultAdmin = userPrincipal?.toText() === defaultAdminPrincipal;
    
    const isDevelopmentAdmin = process.env.NODE_ENV === 'development';
    
    return isAdmin || isDefaultAdmin || isDevelopmentAdmin;
  } catch {
    return process.env.NODE_ENV === 'development';
  }
}
/**
 * Centralized Contact Methods for ICP Integration
 * 
 * All contact-related canister calls should go through these methods
 * to ensure consistency, error handling, and maintainability.
 */

import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';
import { Contact, ContactResult, PrincipalObject } from '../types';

// Re-export types for convenience
export type { Contact, ContactResult, PrincipalObject } from '../types';

/**
 * Get all contacts for the current user
 * @returns Promise<Contact[]> - Array of user's contacts
 */
export const getContacts = async (ownerId: Principal): Promise<Contact[]> => {
  try {
    const canister = await createSplitDappActor();
    const result = await canister.getContacts(ownerId);
    
    const converted = (result as unknown[]).map((contact: unknown) => {
      const contactObj = contact as Record<string, unknown>;
      
      let ownerIdStr = contactObj.ownerId;
      let principalidStr = contactObj.principalid;
      
      if (contactObj.ownerId && typeof contactObj.ownerId === 'object' && (contactObj.ownerId as PrincipalObject)._isPrincipal) {
        try {
          ownerIdStr = contactObj.ownerId.toString();
        } catch {
          ownerIdStr = 'invalid-principal';
        }
      }
      
      if (contactObj.principalid && typeof contactObj.principalid === 'object' && (contactObj.principalid as PrincipalObject)._isPrincipal) {
        try {
          principalidStr = contactObj.principalid.toString();
        } catch {
          principalidStr = 'invalid-principal';
        }
      }
      
      const convertedContact = {
        ...contactObj,
        ownerId: ownerIdStr,
        principalid: principalidStr,
      };
      
      return convertedContact;
    }) as Contact[];
    
    return converted;
  } catch {
    throw new Error('Failed to fetch contacts');
  }
};

/**
 * Add a new contact
 * @param contactPrincipal - Principal ID of the contact to add
 * @param nickname - Display name for the contact
 * @returns Promise<ContactResult> - Result of the add operation
 */
export const addContact = async (
  ownerPrincipal: Principal,
  contactPrincipal: Principal,
  nickname: string
): Promise<ContactResult> => {
  try {
    const canister = await createSplitDappActor();
    const result = await canister.addContact(ownerPrincipal, contactPrincipal, nickname);
    return result as ContactResult;
  } catch {
    throw new Error('Failed to add contact');
  }
};

/**
 * Update an existing contact's nickname
 * @param contactId - ID of the contact to update
 * @param nickname - New nickname for the contact
 * @returns Promise<ContactResult> - Result of the update operation
 */
export const updateContact = async (
  contactId: string,
  nickname: string
): Promise<ContactResult> => {
  try {
    const canister = await createSplitDappActor();
    const result = await canister.updateContact(contactId, nickname);
    return result as ContactResult;
  } catch {
    throw new Error('Failed to update contact');
  }
};

/**
 * Delete a contact
 * @param contactId - ID of the contact to delete
 * @returns Promise<ContactResult> - Result of the delete operation
 */
export const deleteContact = async (
  contactId: string
): Promise<ContactResult> => {
  try {
    const canister = await createSplitDappActor();
    const result = await canister.deleteContact(contactId);
    return result as ContactResult;
  } catch {
    throw new Error('Failed to delete contact');
  }
};

/**
 * Search contacts by query
 * @param ownerId - Principal ID of the user whose contacts to search
 * @param query - Search query (searches nickname and principal ID)
 * @returns Promise<Contact[]> - Array of matching contacts
 */
export const searchContacts = async (ownerId: Principal, query: string): Promise<Contact[]> => {
  try {
    const canister = await createSplitDappActor();
    const result = await canister.searchContacts(ownerId, query);
    return (result as unknown[]).map((contact: unknown) => {
      const contactObj = contact as Record<string, unknown>;
      return {
        ...contactObj,
        ownerId: (contactObj.ownerId as PrincipalObject).toString(),
        principalid: (contactObj.principalid as PrincipalObject).toString(),
      };
    }) as Contact[];
  } catch {
    throw new Error('Failed to search contacts');
  }
};

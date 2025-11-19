'use client';

import { useUser } from '@/hooks/useUser';
import {
    addContact,
    deleteContact,
    getContacts,
    updateContact
} from '@/lib/internal/icp';
import { ContactFormData } from '@/validation/contacts';
import { Principal } from '@dfinity/principal';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type Contact, type ContactDialogMode } from './types';

// Optimized consolidated contacts hook
export const useContacts = () => {
  const { principal } = useUser();

  // State management
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<boolean>(false);
  // const [refreshKey, setRefreshKey] = useState(0); // Unused for now

  // Simple filtered contacts for search
  const filteredContacts = searchQuery.trim()
    ? contacts.filter(contact => {
      const query = searchQuery.toLowerCase();
      return contact.nickname.toLowerCase().includes(query) ||
        contact.principalid.toLowerCase().includes(query);
    })
    : contacts;

  // Optimized load contacts function
  const loadContacts = useCallback(async () => {
    if (!principal) {
      setContacts([]);
      setContactsLoading(false);
      loadingRef.current = false;
      return;
    }

    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setContactsLoading(true);
      setError(null);
      const result = await getContacts(principal);
      setContacts(result);
    } catch {
      setError('Failed to load contacts');
      toast.error('Failed to load contacts');
    } finally {
      setContactsLoading(false);
      loadingRef.current = false;
    }
  }, [principal]);

  // Optimized search function
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Optimized add contact function
  const addContactOptimized = useCallback(async (data: ContactFormData) => {
    if (!principal) {
      toast.error('User not authenticated');
      return false;
    }

    try {
      const contactPrincipal = Principal.fromText(data.principalId);

      // Frontend validation: Cannot add yourself as a contact
      if (principal.toString() === contactPrincipal.toString()) {
        toast.error('Cannot add yourself as a contact');
        return false;
      }

      // Frontend validation: Check if contact already exists
      const existingContact = contacts.find(contact =>
        contact.principalid === contactPrincipal.toString()
      );
      if (existingContact) {
        toast.error('Contact already exists', {
          description: `You already have ${existingContact.nickname} in your contacts`
        });
        return false;
      }

      const result = await addContact(principal, contactPrincipal, data.nickname.trim());

      if (result.ok) {
        toast.success('Contact Added', {
          description: `${data.nickname} has been added to your contacts`,
          duration: 3000,
        });

        // Contact added successfully - reload to update the table
        await loadContacts();
        return true;
      } else {
        // Handle backend validation errors
        if (result.err?.includes('duplicate') || result.err?.includes('already exists')) {
          toast.error('Contact already exists', {
            description: 'This contact is already in your contacts list'
          });
        } else if (result.err?.includes('yourself') || result.err?.includes('same principal')) {
          toast.error('Cannot add yourself as a contact');
        } else {
          toast.error('Failed to add contact', { description: result.err || 'Unknown error' });
        }
        return false;
      }
    } catch {
      toast.error('Failed to add contact');
      return false;
    }
  }, [principal, contacts, loadContacts]);

  // Optimized update contact function
  const updateContactOptimized = useCallback(async (contactId: string, nickname: string) => {
    try {
      await updateContact(contactId, nickname.trim());

      toast.success('Contact Updated', {
        description: `Contact nickname updated to ${nickname}`,
        duration: 3000,
      });

      // Contact updated successfully - no need to reload, user can refresh manually
      return true;
    } catch {
      toast.error('Failed to update contact');
      return false;
    }
  }, []);

  // Optimized delete contact function
  const deleteContactOptimized = useCallback(async (contact: Contact) => {
    if (!principal || !contact) {
      toast.error('User not authenticated or contact not found');
      return false;
    }

    try {
      const result = await deleteContact(contact.id);

      if (result.ok) {
        toast.success('Contact Deleted', {
          description: `${contact.nickname} has been removed from your contacts`,
          duration: 3000,
        });

        // Reload contacts after successful deletion
        await loadContacts();
        return true;
      } else {
        toast.error('Failed to delete contact', { description: result.err });
        return false;
      }
    } catch {
      toast.error('Failed to delete contact');
      return false;
    }
  }, [principal, loadContacts]);

  // Unified save function for add/update
  const handleSaveContact = useCallback(async (
    data: ContactFormData,
    mode: ContactDialogMode,
    contact?: Contact | null
  ) => {
    let success = false;

    if (mode === 'add') {
      success = await addContactOptimized(data);
    } else if (mode === 'update' && contact) {
      success = await updateContactOptimized(contact.id, data.nickname);
    }

    // Reload contacts after successful add/update
    if (success) {
      await loadContacts();
    }

    return success;
  }, [addContactOptimized, updateContactOptimized, loadContacts]);

  // Load contacts only on page load
  useEffect(() => {
    if (principal) {
      loadContacts();
    }
  }, [loadContacts, principal]); // Added missing dependencies

  return {
    // State
    contacts: filteredContacts,
    allContacts: contacts,
    contactsLoading,
    searchQuery,
    error,

    // Actions
    loadContacts,
    handleSearchChange,
    clearSearch,
    handleSaveContact,
    deleteContact: deleteContactOptimized,

    // Setters
    setSearchQuery,
  };
};

// Optimized dialog management hook
export const useContactDialogs = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);

  const openAddDialog = useCallback(() => {
    setShowAddDialog(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setShowAddDialog(false);
  }, []);

  const openEditDialog = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setEditDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setSelectedContact(undefined);
  }, []);

  const openRemoveDialog = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setRemoveDialogOpen(true);
  }, []);

  const closeRemoveDialog = useCallback(() => {
    setRemoveDialogOpen(false);
    setSelectedContact(undefined);
  }, []);

  return {
    // Add dialog
    showAddDialog,
    openAddDialog,
    closeAddDialog,

    // Edit dialog
    editDialogOpen,
    openEditDialog,
    closeEditDialog,

    // Remove dialog
    removeDialogOpen,
    openRemoveDialog,
    closeRemoveDialog,

    // Selected contact
    selectedContact,
  };
};

// Optimized formatting utilities hook
export const useContactFormatting = () => {
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const getInitials = useCallback((nickname: string) => {
    return nickname.charAt(0).toUpperCase();
  }, []);

  const truncateId = useCallback((id: string, length: number = 12) => {
    return `${id.slice(0, length)}...`;
  }, []);

  const truncatePrincipal = useCallback((principal: string, startLength: number = 8, endLength: number = 8) => {
    if (principal.length <= startLength + endLength) {
      return principal;
    }
    return `${principal.slice(0, startLength)}...${principal.slice(-endLength)}`;
  }, []);

  return {
    formatDate,
    getInitials,
    truncateId,
    truncatePrincipal,
  };
};
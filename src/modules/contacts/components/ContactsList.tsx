'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// import { useUser } from '@/hooks/useUser'; // Unused import
import { truncatePrincipal } from '@/lib/utils/utils';
import { Check, Copy, Plus, RotateCw, Search } from 'lucide-react';
import { useState } from 'react';
import { CONTACT_MESSAGES, CONTACT_UI } from '../constants';
import { useContactFormatting } from '../hooks';
import { type Contact } from '../types';
import { ContactFormData } from '@/validation/contacts';
import RemoveContactDialog from './RemoveContactDialog';
import { Empty, EmptyContent, EmptyTitle, EmptyMedia, EmptyHeader, EmptyDescription } from '@/components/ui/empty-state';
// Image component removed - use <img> tags instead

interface ContactsListProps {
  contacts: Contact[];
  contactsLoading: boolean;
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  loadContacts: () => Promise<void>;
  deleteContact: (contact: Contact) => Promise<boolean>;
  handleSaveContact: (data: ContactFormData, mode: 'add' | 'update', contact?: Contact) => Promise<boolean>;
  editDialogOpen: boolean;
  openEditDialog: (contact: Contact) => void;
  setOpenAddDialog: () => void;
  closeEditDialog: () => void;
  removeDialogOpen: boolean;
  openRemoveDialog: (contact: Contact) => void;
  closeRemoveDialog: () => void;
  selectedContact: Contact | undefined;
}

export default function ContactsList({
  contacts,
  contactsLoading,
  searchQuery,
  handleSearchChange,
  clearSearch,
  loadContacts,
  deleteContact,
  openEditDialog,
  removeDialogOpen,
  openRemoveDialog,
  closeRemoveDialog,
  selectedContact,
  setOpenAddDialog,
}: ContactsListProps) {
  // const { principal } = useUser(); // Unused for now

  const { formatDate, getInitials, truncateId } = useContactFormatting();

  // Copy button state management
  const [copyStates, setCopyStates] = useState<Record<string, 'idle' | 'copying' | 'copied'>>({});

  // Copy to clipboard function with loading state
  const copyToClipboard = async (text: string, contactId: string) => {
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided to copyToClipboard');
      return;
    }

    setCopyStates(prev => ({ ...prev, [contactId]: 'copying' }));

    try {
      await navigator.clipboard.writeText(text);
      setCopyStates(prev => ({ ...prev, [contactId]: 'copied' }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [contactId]: 'idle' }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopyStates(prev => ({ ...prev, [contactId]: 'idle' }));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#BCBCBC]" />
          <Input
            placeholder={CONTACT_MESSAGES.SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1 pl-10 !bg-transparent !rounded-[10px] !border-[#303434]"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadContacts}
            variant='outline'
            className="!bg-transparent !rounded-[10px]"
            disabled={contactsLoading}
          >
            {contactsLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              <>
                <RotateCw size={14} className="mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button
            variant="default"
            onClick={setOpenAddDialog}
          >
            <Plus className="text-xs" /> Add contact
          </Button>
        </div>
      </div>

      <Table className='mt-4'>
        <TableHeader>
          <TableRow className={`${contacts.length === 0 ? '!border-none' : ''} border-gray-700 hover:bg-gray-750`}>
            <TableHead className="text-gray-300 font-medium">Contact</TableHead>
            <TableHead className="text-gray-300 font-medium">Principal ID</TableHead>
            <TableHead className="text-gray-300 font-medium">Created</TableHead>
            <TableHead className="text-gray-300 font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        {contacts.length === 0 ? (
          <TableBody className='relative' style={{ height: 'calc(100vh - 250px)' }}>
            <TableRow>
              <TableCell>
                <Empty className='!bg-[#191A1A] !border border-[#424747] !rounded-[10px] absolute top-0 left-0 bottom-0 right-0'>
                  <EmptyHeader className='!max-w-full !text-white'>
                    <EmptyMedia variant="icon" className='w-[94px]'>
                      <img src="/user-empty.svg" alt="Empty state" width={94} height={94} />
                    </EmptyMedia>
                    <EmptyTitle className="!font-semibold mt-8">Let&apos;s build your network</EmptyTitle>
                    <EmptyDescription>
                      You don&apos;t have any contacts yet. Tap below to find people you know and get started.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="default" onClick={setOpenAddDialog}>
                      <Plus /> Add contacts
                    </Button>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          contacts.map((contact) => {
              return (
                <TableBody key={contact.id}>
                  <TableRow className="border-gray-700 hover:bg-gray-750">
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-${CONTACT_UI.AVATAR_SIZE / 4} h-${CONTACT_UI.AVATAR_SIZE / 4} bg-blue-600 rounded-full flex items-center justify-center`}>
                          <span className="text-sm font-medium text-white">
                            {getInitials(contact.nickname)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{contact.nickname}</h3>
                          <p className="text-gray-400 text-sm">ID: {truncateId(contact.id)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-orange-400 font-mono text-sm">
                          {truncatePrincipal(String(contact.principalid || ''))}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => copyToClipboard(String(contact.principalid || ''), contact.id)}
                            disabled={copyStates[contact.id] === 'copying'}
                            className="px-2 py-1 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {copyStates[contact.id] === 'copying' ? (
                              <LoadingSpinner size="sm" />
                            ) : copyStates[contact.id] === 'copied' ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          {copyStates[contact.id] === 'copied' && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                              Copied!
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {formatDate(contact.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => openEditDialog(contact)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center space-x-1"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => openRemoveDialog(contact)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors flex items-center space-x-1"
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              );
          })
        )}
      </Table>

      {/* Remove Contact Dialog */}
      <RemoveContactDialog
        open={removeDialogOpen}
        onOpenChange={closeRemoveDialog}
        contact={selectedContact}
        deleteContact={deleteContact}
      />

    </>
  );
}

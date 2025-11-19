'use client';

import { setSubtitle, setTitle } from '@/lib/redux/store/store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useContactDialogs, useContacts } from '../hooks';
import AddUpdateContactDialog from './AddUpdateContactDialog';
import ContactsList from './ContactsList';

const Contacts = () => {
  const dispatch = useDispatch();
  const {
    showAddDialog,
    openAddDialog,
    closeAddDialog,
    editDialogOpen,
    openEditDialog,
    closeEditDialog,
    removeDialogOpen,
    openRemoveDialog,
    closeRemoveDialog,
    selectedContact,
  } = useContactDialogs();

  // No need for useContacts hook here

  const { contacts, contactsLoading, searchQuery, handleSearchChange, clearSearch, loadContacts, handleSaveContact, deleteContact } = useContacts();

  useEffect(() => {
    loadContacts();
    dispatch(setTitle('Contacts'));
    dispatch(setSubtitle('Manage your trusted contacts for escrow transactions'));
  }, [dispatch, loadContacts]); // Added missing dependencies


  return (
    <div className="min-h-screen text-white py-2">
      <div className="mx-auto">
        <div className="flex items-center space-x-4">

        </div>

        <ContactsList
          contacts={contacts}
          contactsLoading={contactsLoading}
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          clearSearch={clearSearch}
          loadContacts={loadContacts}
          deleteContact={deleteContact}
          handleSaveContact={handleSaveContact}
          editDialogOpen={editDialogOpen}
          openEditDialog={openEditDialog}
          closeEditDialog={closeEditDialog}
          removeDialogOpen={removeDialogOpen}
          openRemoveDialog={openRemoveDialog}
          closeRemoveDialog={closeRemoveDialog}
          selectedContact={selectedContact}
          setOpenAddDialog={openAddDialog}
        />

        <AddUpdateContactDialog
          open={showAddDialog || editDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              if (editDialogOpen) {
                closeEditDialog();
              } else {
                closeAddDialog();
              }
            }
          }}
          mode={editDialogOpen ? "update" : "add"}
          contact={selectedContact}
          handleSaveContact={handleSaveContact}
        />
      </div>
    </div>
  );
};

export default Contacts;
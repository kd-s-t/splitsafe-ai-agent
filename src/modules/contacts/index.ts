// Contacts module exports

// Main component
export { default as Contacts } from './components/Contacts';

// Components
export { default as AddUpdateContactDialog } from './components/AddUpdateContactDialog';
export { default as ContactsList } from './components/ContactsList';
export { default as RemoveContactDialog } from './components/RemoveContactDialog';

// Types
export type {
    AddUpdateContactDialogProps, Contact, ContactDialogMode,
    ContactFormData, ContactsListProps, RemoveContactDialogProps
} from './types';

// Constants
export { CONTACT_CONSTRAINTS, CONTACT_DIALOG, CONTACT_MESSAGES, CONTACT_UI } from './constants';

// Hooks
export {
    useContactDialogs, useContactFormatting, useContacts
} from './hooks';

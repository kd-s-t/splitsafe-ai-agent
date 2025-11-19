// Contacts module types

export interface Contact {
  id: string;
  ownerId: string;
  nickname: string;
  principalid: string;
  createdAt: number;
  updatedAt?: number;
}

export interface AddUpdateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'add' | 'update';
  contact?: Contact;
}

export interface RemoveContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | undefined;
  deleteContact: (contact: Contact) => Promise<boolean>;
}

// ContactsListProps interface - currently no props needed
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContactsListProps {
  // Add any props if needed in the future
}

export type ContactDialogMode = 'add' | 'update';

export interface ContactFormData {
  nickname: string;
  principalId: string;
}

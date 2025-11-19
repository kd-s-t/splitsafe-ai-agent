"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, X } from "lucide-react";

import { type Contact } from '@/modules/contacts/types';
import { useEffect, useRef, useState } from "react";

interface ContactComboboxProps {
  value: string | { toText?: () => string } | null | undefined;
  onChange: (value: string) => void;
  onNameChange?: (name: string) => void;
  contacts: Contact[];
  contactsLoading: boolean;
  selectedPrincipals?: string[]; // Array of already selected principal IDs to filter out
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const ContactCombobox = ({
  value,
  onChange,
  onNameChange,
  contacts,
  contactsLoading,
  selectedPrincipals = [],
  placeholder = "ICP Principal ID",
  className = "",
  error = false
}: ContactComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to convert value to string
  const valueToString = (val: string | { toText?: () => string } | null | undefined): string => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && 'toText' in val && typeof val.toText === 'function') {
      return val.toText();
    }
    return '';
  };

  // Filter contacts based on input and exclude already selected principals
  useEffect(() => {
    // First filter out already selected principals
    const availableContacts = contacts.filter(contact =>
      !selectedPrincipals.includes(String(contact.principalid))
    );

    if (inputValue.trim() === '') {
      setFilteredContacts(availableContacts);
    } else {
      const filtered = availableContacts.filter(contact =>
        contact.nickname.toLowerCase().includes(inputValue.toLowerCase()) ||
        `@${contact.nickname}`.toLowerCase().includes(inputValue.toLowerCase()) ||
        String(contact.principalid).toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [inputValue, contacts, selectedPrincipals]);

  // Update input value when prop value changes
  useEffect(() => {
    const stringValue = valueToString(value);

    // Find the contact that matches this principal ID
    const matchingContact = contacts.find(contact =>
      String(contact.principalid) === stringValue
    );

    if (matchingContact) {
      setSelectedContact(matchingContact);
      setInputValue(`@${matchingContact.nickname}`);
    } else {
      setSelectedContact(null);
      setInputValue(stringValue);
    }
  }, [value, contacts]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // If the user is typing and it doesn't start with @, clear selected contact
    if (!newValue.startsWith('@')) {
      setSelectedContact(null);
    }

    // Always call onChange to allow setting any ICP address, even if not in contacts
    onChange(newValue);
    setIsOpen(true);
  };

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    const principalString = String(contact.principalid);
    const displayName = `@${contact.nickname}`;
    setSelectedContact(contact);
    setInputValue(displayName);
    onChange(principalString); // Still pass the actual principal ID for the form data
    if (onNameChange) {
      onNameChange(contact.nickname);
    }
    setIsOpen(false);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle input key press (Enter to confirm)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // If user presses Enter and has typed something, confirm the input
      if (inputValue.trim() && !selectedContact) {
        onChange(inputValue.trim());
        setIsOpen(false);
      }
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        {selectedContact ? (
          <div className="flex items-center gap-2 px-3 py-2 border border-[#424444] rounded-md bg-[#2B2B2B] h-10">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#FEB64D] text-black rounded-full text-sm font-medium">
              <span>@{selectedContact.nickname}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedContact(null);
                  setInputValue('');
                  onChange('');
                }}
                className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={() => setIsOpen(!isOpen)}
            >
              <ChevronDown className={`w-4 h-4 text-[#A1A1A1] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={`text-white pr-8 ${error ? '!border-[#FF5050]' : ''} ${className}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
              onClick={() => setIsOpen(!isOpen)}
            >
              <ChevronDown className={`w-4 h-4 text-[#A1A1A1] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-[#2B2B2B] border border-[#424242] rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {contactsLoading ? (
            <div className="p-3 text-center text-[#A1A1A1]">
              Loading contacts...
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-[#404040] flex items-center justify-between"
                onClick={() => handleContactSelect(contact)}
              >
                <div>
                  <div className="text-white font-medium">{contact.nickname}</div>
                  <div className="text-[#A1A1A1] text-sm">{String(contact.principalid)}</div>
                </div>
                {inputValue === String(contact.principalid) && (
                  <Check className="w-4 h-4 text-[#FEB64D]" />
                )}
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-[#A1A1A1]">
              {inputValue.trim() ? (
                <div className="space-y-2">
                  <div>No contacts found</div>
                  <div className="text-xs text-[#FEB64D]">
                    You can still use the ICP address: {inputValue}
                  </div>
                </div>
              ) : (
                "No contacts found"
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactCombobox
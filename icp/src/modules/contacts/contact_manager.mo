import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

import Types "./schema";
import Contacts "./contacts";

module {
  public type ContactManagerState = {
    userContacts : HashMap.HashMap<Principal, HashMap.HashMap<Text, Types.Contact>>;
  };

  public type ContactResult = {
    #ok : Text;
    #err : Text;
  };

  public func validateContactInput(
    nickname : Text,
    caller : Principal,
    contactPrincipal : Principal,
  ) : ?Text {
    if (nickname.size() == 0) {
      return ?"Nickname cannot be empty";
    };

    if (nickname.size() > 50) {
      return ?"Nickname too long (max 50 characters)";
    };

    if (caller == contactPrincipal) {
      return ?"Cannot add yourself as a contact";
    };

    null;
  };

  public func addContact(
    ownerId : Principal,
    contactPrincipal : Principal,
    nickname : Text,
    state : ContactManagerState,
  ) : (ContactResult, ContactManagerState) {
    switch (validateContactInput(nickname, ownerId, contactPrincipal)) {
      case (?error) {
        return (#err(error), state);
      };
      case null {};
    };

    let contacts = switch (state.userContacts.get(ownerId)) {
      case (?existingContacts) existingContacts;
      case null {
        let newContacts = HashMap.HashMap<Text, Types.Contact>(10, Text.equal, Text.hash);
        newContacts;
      };
    };

    let success = Contacts.addContact(contacts, ownerId, nickname, contactPrincipal);

    if (success) {
      // Create a new state with the updated contacts
      let updatedState = {
        userContacts = state.userContacts;
      };
      // Put the contacts back into the state
      updatedState.userContacts.put(ownerId, contacts);
      (#ok("Contact added successfully"), updatedState);
    } else {
      (#err("Contact already exists"), state);
    };
  };

  public func deleteContact(
    contactId : Text,
    state : ContactManagerState,
  ) : (ContactResult, ContactManagerState) {
    // Extract ownerId from contactId (format: CON_ownerId_contactPrincipal_timestamp)
    let parts = Text.split(contactId, #char '_');
    let partsArray = Iter.toArray(parts);

    if (partsArray.size() >= 2) {
      let ownerIdText = partsArray[1];
      let ownerId = Principal.fromText(ownerIdText);

      switch (state.userContacts.get(ownerId)) {
        case (?contacts) {
          switch (contacts.get(contactId)) {
            case (?_contact) {
              let success = Contacts.deleteContact(contacts, contactId);

              if (success) {
                // Create a new state with the updated contacts
                let updatedState = {
                  userContacts = state.userContacts;
                };
                // Put the contacts back into the state
                updatedState.userContacts.put(ownerId, contacts);
                (#ok("Contact deleted successfully"), updatedState);
              } else {
                (#err("Failed to delete contact"), state);
              };
            };
            case null {
              (#err("Contact not found"), state);
            };
          };
        };
        case null {
          (#err("No contacts found"), state);
        };
      };
    } else {
      (#err("Invalid contact ID format"), state);
    };
  };

  public func updateContact(
    contactId : Text,
    newNickname : Text,
    state : ContactManagerState,
  ) : (ContactResult, ContactManagerState) {
    if (newNickname.size() == 0) {
      return (#err("Nickname cannot be empty"), state);
    };

    if (newNickname.size() > 50) {
      return (#err("Nickname too long (max 50 characters)"), state);
    };

    // Extract ownerId from contactId (format: CON_ownerId_contactPrincipal_timestamp)
    let parts = Text.split(contactId, #char '_');
    let partsArray = Iter.toArray(parts);

    if (partsArray.size() >= 2) {
      let ownerIdText = partsArray[1];
      let ownerId = Principal.fromText(ownerIdText);

      switch (state.userContacts.get(ownerId)) {
        case (?contacts) {
          switch (contacts.get(contactId)) {
            case (?contact) {
              let success = Contacts.updateContact(contacts, ownerId, contactId, newNickname, contact.principalid);

              if (success) {
                // Create a new state with the updated contacts
                let updatedState = {
                  userContacts = state.userContacts;
                };
                // Put the contacts back into the state
                updatedState.userContacts.put(ownerId, contacts);
                (#ok("Contact nickname updated successfully"), updatedState);
              } else {
                (#err("Failed to update contact"), state);
              };
            };
            case null {
              (#err("Contact not found"), state);
            };
          };
        };
        case null {
          (#err("No contacts found"), state);
        };
      };
    } else {
      (#err("Invalid contact ID format"), state);
    };
  };
};

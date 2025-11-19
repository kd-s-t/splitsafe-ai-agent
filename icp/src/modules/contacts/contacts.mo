import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Char "mo:base/Char";
import TimeUtil "../../utils/time";
import Types "./schema";

module {

  public func getContacts(
    contacts : HashMap.HashMap<Text, Types.Contact>,
    principalid : Principal,
  ) : [Types.Contact] {
    let entries = Iter.toArray(contacts.entries());
    let allContacts = Array.map<(Text, Types.Contact), Types.Contact>(
      entries,
      func(entry) { entry.1 },
    );
    // Filter contacts to only return those owned by the caller
    Array.filter<Types.Contact>(
      allContacts,
      func(contact) { contact.ownerId == principalid },
    );
  };

  public func addContact(
    contacts : HashMap.HashMap<Text, Types.Contact>,
    principalid : Principal,
    nickname : Text,
    contactPrincipal : Principal,
  ) : Bool {
    // Validation 1: Cannot add yourself as a contact
    if (principalid == contactPrincipal) {
      return false;
    };

    // Validation 2: Check if contact with this principal already exists for this owner
    let entries = Iter.toArray(contacts.entries());
    for ((_, contact) in entries.vals()) {
      if (contact.ownerId == principalid and contact.principalid == contactPrincipal) {
        return false; // Duplicate contact already exists
      };
    };

    // Create new contact if validations pass
    let contactId = "CON_" # Principal.toText(principalid) # "_" # Principal.toText(contactPrincipal) # "_" # Nat.toText(TimeUtil.now());

    let contact : Types.Contact = {
      id = contactId;
      ownerId = principalid;
      nickname = nickname;
      principalid = contactPrincipal;
      createdAt = TimeUtil.now();
      updatedAt = null;
    };
    contacts.put(contactId, contact);
    true;
  };

  public func updateContact(
    contacts : HashMap.HashMap<Text, Types.Contact>,
    principalid : Principal,
    id : Text,
    nickname : Text,
    contactPrincipal : Principal,
  ) : Bool {
    switch (contacts.get(id)) {
      case (?contact) {
        if (contact.ownerId == principalid) {
          let updatedContact : Types.Contact = {
            id = contact.id;
            ownerId = contact.ownerId;
            nickname = nickname;
            principalid = contactPrincipal;
            createdAt = contact.createdAt;
            updatedAt = ?TimeUtil.now();
          };
          contacts.put(id, updatedContact);
          true;
        } else {
          false;
        };
      };
      case null { false };
    };
  };

  public func deleteContact(
    contacts : HashMap.HashMap<Text, Types.Contact>,
    id : Text,
  ) : Bool {
    switch (contacts.get(id)) {
      case (?_) {
        contacts.delete(id);
        true;
      };
      case null { false };
    };
  };

  public func searchContacts(
    contacts : HashMap.HashMap<Text, Types.Contact>,
    principalid : Principal,
    searchQuery : Text,
  ) : [Types.Contact] {
    var results : [Types.Contact] = [];
    let lowercaseQuery = Text.map(
      searchQuery,
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(Char.toNat32(c) + 32);
        } else {
          c;
        };
      },
    );

    for ((id, contact) in contacts.entries()) {
      if (contact.ownerId == principalid) {
        let lowercaseNickname = Text.map(
          contact.nickname,
          func(c) {
            if (c >= 'A' and c <= 'Z') {
              Char.fromNat32(Char.toNat32(c) + 32);
            } else {
              c;
            };
          },
        );
        let principalText = Principal.toText(contact.principalid);
        let lowercasePrincipal = Text.map(
          principalText,
          func(c) {
            if (c >= 'A' and c <= 'Z') {
              Char.fromNat32(Char.toNat32(c) + 32);
            } else {
              c;
            };
          },
        );

        if (
          Text.contains(lowercaseNickname, #text lowercaseQuery) or
          Text.contains(lowercasePrincipal, #text lowercaseQuery)
        ) {
          results := Array.append(results, [contact]);
        };
      };
    };
    results;
  };

};

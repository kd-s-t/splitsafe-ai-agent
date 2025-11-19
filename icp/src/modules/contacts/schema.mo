module {
  public type Contact = {
    id : Text;
    ownerId : Principal;
    nickname : Text;
    principalid : Principal;
    createdAt : Nat;
    updatedAt : ?Nat;
  };
};

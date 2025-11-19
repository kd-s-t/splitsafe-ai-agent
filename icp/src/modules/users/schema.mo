module {
  public type UserInfo = {
    name : ?Text;
    username : ?Text;
    picture : ?Text;
    email : ?Text;
    balance : Nat;
  };

  public type SaveInfoRequest = {
    name : ?Text;
    username : ?Text;
    picture : ?Text;
    email : ?Text;
  };

  public type UserWithPrincipal = {
    principal : Principal;
    name : ?Text;
    username : ?Text;
    picture : ?Text;
    email : ?Text;
    balance : Nat;
  };
};

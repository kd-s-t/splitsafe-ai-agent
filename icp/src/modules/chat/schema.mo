module {
  public type ChatMessage = {
    id : Text;
    senderPrincipalId : Principal;
    message : Text;
    senderAt : Int;
    chatId : Text;
    senderName : Text;
  };

  public type ChatMessageResult = {
    success : Bool;
    messageId : ?Text;
    error : ?Text;
  };
};
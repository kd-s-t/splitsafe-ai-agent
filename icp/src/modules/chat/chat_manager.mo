import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";

import ChatTypes "./schema";
import TransactionTypes "../transaction/schema";
import Chat "./chat";

module {
  public type ChatManagerState = {
    transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>;
    chatState : Chat.ChatState;
  };

  public type ChatResult = {
    success : Bool;
    chatId : ?Text;
    error : ?Text;
  };

  public func getOrCreateChat(
    transactionId : Text,
    caller : Principal,
    state : ChatManagerState
  ) : (ChatResult, ChatManagerState) {
    let userTransactions = switch (state.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    var foundTransaction : ?TransactionTypes.Transaction = null;
    for (tx in userTransactions.vals()) {
      if (tx.id == transactionId) {
        foundTransaction := ?tx;
      } else {
        let recipients = switch (tx.basicData) {
          case (?basicData) basicData.to;
          case null [];
        };
        for (recipient in recipients.vals()) {
          if (recipient.principal == caller and tx.id == transactionId) {
            foundTransaction := ?tx;
          };
        };
      };
    };

    switch (foundTransaction) {
      case (?tx) {
        switch (tx.chatId) {
          case (?existingChatId) {
            let existingMessages = switch (state.chatState.chatMessages.get(existingChatId)) {
              case (?msgs) msgs;
              case null [];
            };

            if (existingMessages.size() > 0) {
              ({ success = true; chatId = ?existingChatId; error = null }, state);
            } else {
              state.chatState.chatMessages.put(existingChatId, []);
              ({ success = true; chatId = ?existingChatId; error = null }, state);
            };
          };
          case null {
            let newChatId = "chat_" # transactionId;
            state.chatState.chatMessages.put(newChatId, []);
            ({ success = true; chatId = ?newChatId; error = null }, state);
          };
        };
      };
      case null {
        ({
          success = false;
          chatId = null;
          error = ?"Transaction not found or you are not a participant";
        }, state);
      };
    };
  };

  public func validateParticipant(
    transactionId : Text,
    caller : Principal,
    state : ChatManagerState
  ) : Bool {
    let userTransactions = switch (state.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    for (tx in userTransactions.vals()) {
      if (tx.id == transactionId) {
        return true;
      } else {
        let recipients = switch (tx.basicData) {
          case (?basicData) basicData.to;
          case null [];
        };
        for (recipient in recipients.vals()) {
          if (recipient.principal == caller) {
            return true;
          };
        };
      };
    };
    false;
  };

  public func sendMessage(
    chatId : Text,
    message : Text,
    senderName : Text,
    caller : Principal,
    state : ChatManagerState
  ) : (ChatTypes.ChatMessageResult, ChatManagerState) {
    let transactionId = if (Text.startsWith(chatId, #text "chat_")) {
      switch (Text.stripStart(chatId, #text "chat_")) {
        case (?id) id;
        case null chatId;
      };
    } else {
      chatId
    };

    if (not validateParticipant(transactionId, caller, state)) {
      return ({
        success = false;
        messageId = null;
        error = ?"Unauthorized: You are not a participant in this transaction";
      }, state);
    };

    let (updatedState, result) = Chat.sendMessage(state.chatState, chatId, message, senderName, caller);
    (result, { transactions = state.transactions; chatState = updatedState });
  };

  public func getMessages(
    escrowId : Text,
    limit : ?Nat,
    caller : Principal,
    state : ChatManagerState
  ) : [ChatTypes.ChatMessage] {
    let userTransactions = switch (state.transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };

    var foundChatId : ?Text = null;
    var isParticipant = false;

    for (tx in userTransactions.vals()) {
      if (tx.id == escrowId) {
        isParticipant := true;
        foundChatId := tx.chatId;
      } else {
        let recipients = switch (tx.basicData) {
          case (?basicData) basicData.to;
          case null [];
        };
        for (recipient in recipients.vals()) {
          if (recipient.principal == caller and tx.id == escrowId) {
            isParticipant := true;
            foundChatId := tx.chatId;
          };
        };
      };
    };

    if (not isParticipant) {
      return [];
    };

    switch (foundChatId) {
      case (?chatId) {
        Chat.getMessages(state.chatState, chatId, limit);
      };
      case null {
        [];
      };
    };
  };

  public func findChatIdForEscrow(escrowId : Text, state : ChatManagerState) : ?Text {
    let allTransactions = state.transactions.entries();
    for ((principal, txs) in allTransactions) {
      for (tx in txs.vals()) {
        if (tx.id == escrowId) {
          return tx.chatId;
        };
      };
    };
    null;
  };

  public func getMessageCount(escrowId : Text, state : ChatManagerState) : Nat {
    switch (findChatIdForEscrow(escrowId, state)) {
      case (?chatId) {
        Chat.getMessageCount(state.chatState, chatId);
      };
      case null {
        0;
      };
    };
  };

  public func getLatestMessage(escrowId : Text, state : ChatManagerState) : ?ChatTypes.ChatMessage {
    switch (findChatIdForEscrow(escrowId, state)) {
      case (?chatId) {
        Chat.getLatestMessage(state.chatState, chatId);
      };
      case null {
        null;
      };
    };
  };

  public func searchMessages(escrowId : Text, searchQuery : Text, state : ChatManagerState) : [ChatTypes.ChatMessage] {
    switch (findChatIdForEscrow(escrowId, state)) {
      case (?chatId) {
        Chat.searchMessages(state.chatState, chatId, searchQuery);
      };
      case null { [] };
    };
  };

  public func getEscrowsWithMessages(state : ChatManagerState) : [Text] {
    Chat.getChatsWithMessages(state.chatState);
  };

  public func deleteEscrowMessages(
    escrowId : Text,
    caller : Principal,
    admin : Principal,
    state : ChatManagerState
  ) : (Bool, ChatManagerState) {
    switch (findChatIdForEscrow(escrowId, state)) {
      case (?chatId) {
        let (updatedState, result) = Chat.deleteChatMessages(state.chatState, chatId, caller, admin);
        (result, { transactions = state.transactions; chatState = updatedState });
      };
      case null {
        (false, state);
      };
    };
  };
};
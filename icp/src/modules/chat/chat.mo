import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";

import ChatTypes "./schema";

module {
    public type ChatState = {
        chatMessages: HashMap.HashMap<Text, [ChatTypes.ChatMessage]>;
        logs: [Text];
    };

    public func createChatState(): ChatState {
        {
            chatMessages = HashMap.HashMap<Text, [ChatTypes.ChatMessage]>(10, Text.equal, Text.hash);
            logs = [];
        }
    };

    public func sendMessage(
        state: ChatState,
        chatId: Text, 
        message: Text, 
        senderName: Text, 
        caller: Principal
    ): (ChatState, ChatTypes.ChatMessageResult) {
        let messageId = "CHAT_" # Int.toText(Time.now()) # "_" # Principal.toText(caller);
        let currentTime = Time.now();
        let newMessage: ChatTypes.ChatMessage = {
            id = messageId;
            senderPrincipalId = caller;
            message = message;
            senderAt = currentTime;
            chatId = chatId;
            senderName = senderName;
        };
        
        let existingMessages = switch (state.chatMessages.get(chatId)) {
            case (?msgs) msgs;
            case null [];
        };
        
        let updatedMessages = Array.append(existingMessages, [newMessage]);
        state.chatMessages.put(chatId, updatedMessages);
        
        let newLogs = Array.append(state.logs, ["Chat message stored: " # messageId # " for chat: " # chatId]);
        let updatedState = {
            chatMessages = state.chatMessages;
            logs = newLogs;
        };
        
        (updatedState, {
            success = true;
            messageId = ?messageId;
            error = null;
        })
    };

    public func getMessages(
        state: ChatState,
        chatId: Text, 
        limit: ?Nat
    ): [ChatTypes.ChatMessage] {
        let allMessages = switch (state.chatMessages.get(chatId)) {
            case (?msgs) msgs;
            case null [];
        };
        
        switch (limit) {
            case (?l) {
                if (allMessages.size() <= l) {
                    allMessages
                } else {
                    let reversed = Array.reverse<ChatTypes.ChatMessage>(allMessages);
                    let limited = Array.tabulate<ChatTypes.ChatMessage>(l, func(i) {
                        reversed[i]
                    });
                    Array.reverse<ChatTypes.ChatMessage>(limited)
                }
            };
            case null allMessages;
        };
    };

    public func getMessageCount(
        state: ChatState,
        chatId: Text
    ): Nat {
        let allMessages = switch (state.chatMessages.get(chatId)) {
            case (?msgs) msgs;
            case null [];
        };
        allMessages.size()
    };


    public func searchMessages(
        state: ChatState,
        chatId: Text, 
        searchQuery: Text
    ): [ChatTypes.ChatMessage] {
        let allMessages = switch (state.chatMessages.get(chatId)) {
            case (?msgs) msgs;
            case null [];
        };
        
        Array.filter<ChatTypes.ChatMessage>(allMessages, func(msg) {
            Text.contains(msg.message, #text searchQuery) or Text.contains(msg.senderName, #text searchQuery)
        });
    };

    public func getLatestMessage(
        state: ChatState,
        chatId: Text
    ): ?ChatTypes.ChatMessage {
        let allMessages = switch (state.chatMessages.get(chatId)) {
            case (?msgs) msgs;
            case null [];
        };
        
        if (allMessages.size() > 0) {
            ?allMessages[allMessages.size() - 1]
        } else {
            null
        }
    };

    public func getChatsWithMessages(state: ChatState): [Text] {
        let chatIds = Iter.toArray(state.chatMessages.entries());
        Array.map<(Text, [ChatTypes.ChatMessage]), Text>(chatIds, func((chatId, _)) { chatId });
    };

    public func deleteChatMessages(
        state: ChatState,
        chatId: Text,
        caller: Principal,
        admin: Principal
    ): (ChatState, Bool) {
        if (caller == admin) {
            state.chatMessages.delete(chatId);
            let newLogs = Array.append(state.logs, ["Chat messages deleted for chat: " # chatId]);
            let updatedState = {
                chatMessages = state.chatMessages;
                logs = newLogs;
            };
            (updatedState, true)
        } else {
            (state, false)
        }
    };

    public func getChatLogs(state: ChatState): [Text] {
        state.logs
    };

    public func addLog(state: ChatState, log: Text): ChatState {
        let newLogs = Array.append(state.logs, [log]);
        {
            chatMessages = state.chatMessages;
            logs = newLogs;
        }
    };
};
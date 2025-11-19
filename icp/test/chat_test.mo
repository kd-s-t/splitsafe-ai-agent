import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

import Chat "../src/modules/chat";
import TransactionTypes "../src/schema";

persistent actor ChatTest {
    public func testChatFunctionality() : async Text {
        Debug.print("🧪 Starting Chat Functionality Tests");
        
        // Create chat state
        let chatState = Chat.createChatState();
        let alice = Principal.fromText("2vxsx-fae");
        let escrowId = "test-escrow-123";
        
        // Test 1: Send a message
        Debug.print("Test 1: Sending a message");
        let (updatedState1, result1) = Chat.sendMessage(chatState, escrowId, "Hello World!", "Alice", alice);
        
        if (not result1.success) {
            return "❌ Test 1 failed: " # (switch (result1.error) { case (?e) e; case null "Unknown error" });
        };
        
        Debug.print("✅ Test 1 passed: Message sent successfully");
        
        // Test 2: Get messages
        Debug.print("Test 2: Getting messages");
        let messages = Chat.getMessages(updatedState1, escrowId, null);
        
        if (messages.size() != 1) {
            return "❌ Test 2 failed: Expected 1 message, got " # Debug.show(messages.size());
        };
        
        Debug.print("✅ Test 2 passed: Retrieved 1 message");
        
        // Test 3: Get message count
        Debug.print("Test 3: Getting message count");
        let count = Chat.getMessageCount(updatedState1, escrowId);
        
        if (count != 1) {
            return "❌ Test 3 failed: Expected count 1, got " # Debug.show(count);
        };
        
        Debug.print("✅ Test 3 passed: Message count is 1");
        
        // Test 4: Get latest message
        Debug.print("Test 4: Getting latest message");
        let latestMessage = Chat.getLatestMessage(updatedState1, escrowId);
        
        switch (latestMessage) {
            case (?msg) {
                if (msg.message != "Hello World!") {
                    return "❌ Test 4 failed: Message content mismatch";
                };
            };
            case null {
                return "❌ Test 4 failed: No latest message found";
            };
        };
        
        Debug.print("✅ Test 4 passed: Latest message retrieved");
        
        // Test 5: Search messages
        Debug.print("Test 5: Searching messages");
        let searchResults = Chat.searchMessages(updatedState1, escrowId, "Hello");
        
        if (searchResults.size() != 1) {
            return "❌ Test 5 failed: Search returned " # Debug.show(searchResults.size()) # " results, expected 1";
        };
        
        Debug.print("✅ Test 5 passed: Search functionality works");
        
        // Test 6: Get escrows with messages
        Debug.print("Test 6: Getting escrows with messages");
        let escrowsWithMessages = Chat.getEscrowsWithMessages(updatedState1);
        
        if (escrowsWithMessages.size() != 1) {
            return "❌ Test 6 failed: Expected 1 escrow with messages, got " # Debug.show(escrowsWithMessages.size());
        };
        
        if (escrowsWithMessages[0] != escrowId) {
            return "❌ Test 6 failed: Escrow ID mismatch";
        };
        
        Debug.print("✅ Test 6 passed: Escrow with messages retrieved");
        
        // Test 7: Send another message
        Debug.print("Test 7: Sending another message");
        let (updatedState2, result2) = Chat.sendMessage(updatedState1, escrowId, "Second message", "Alice", alice);
        
        if (not result2.success) {
            return "❌ Test 7 failed: " # (switch (result2.error) { case (?e) e; case null "Unknown error" });
        };
        
        let finalCount = Chat.getMessageCount(updatedState2, escrowId);
        if (finalCount != 2) {
            return "❌ Test 7 failed: Expected 2 messages, got " # Debug.show(finalCount);
        };
        
        Debug.print("✅ Test 7 passed: Second message sent successfully");
        
        Debug.print("🎉 All chat tests passed!");
        return "✅ All chat functionality tests passed successfully!";
    };
    
    public func testChatWithLimit() : async Text {
        Debug.print("🧪 Testing Chat with Message Limit");
        
        let chatState = Chat.createChatState();
        let alice = Principal.fromText("2vxsx-fae");
        let escrowId = "test-escrow-limit";
        
        // Send 5 messages
        var state = chatState;
        for (i in [1, 2, 3, 4, 5].vals()) {
            let (newState, result) = Chat.sendMessage(state, escrowId, "Message " # Debug.show(i), "Alice", alice);
            state := newState;
            if (not result.success) {
                return "❌ Failed to send message " # Debug.show(i);
            };
        };
        
        // Test getting last 3 messages
        let limitedMessages = Chat.getMessages(state, escrowId, ?3);
        
        if (limitedMessages.size() != 3) {
            return "❌ Expected 3 messages with limit, got " # Debug.show(limitedMessages.size());
        };
        
        // Check that we got the last 3 messages
        if (limitedMessages[0].message != "Message 3" or 
            limitedMessages[1].message != "Message 4" or 
            limitedMessages[2].message != "Message 5") {
            return "❌ Limited messages are not the last 3 messages";
        };
        
        Debug.print("✅ Chat limit test passed!");
        return "✅ Chat with message limit test passed!";
    };
};

# AWS Q Integration

Enterprise-grade Amazon Q Developer integration for SplitSafe AI Agent with advanced features including session management, metrics tracking, retry logic, and comprehensive error handling.

## Features

- 🚀 **Robust Error Handling** - Automatic retries with exponential backoff
- 📊 **Metrics & Analytics** - Track performance, success rates, and token usage
- 🔄 **Session Management** - Maintain conversation context across interactions
- ⚙️ **Configurable** - Flexible configuration with validation
- 🛡️ **Type-Safe** - Full TypeScript support with comprehensive types
- ⏱️ **Timeout Protection** - Configurable request timeouts
- 🔍 **Validation** - Input validation for all action types

## Installation

### Backend Setup

You'll need to set up the backend endpoints in your `splitsafe-ai-agent-backend` repository:

1. Install AWS SDK:
```bash
npm install @aws-sdk/client-bedrock-agent-runtime
```

2. Add environment variables to `.env`:
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_Q_AGENT_ID=your_agent_id
AWS_Q_AGENT_ALIAS_ID=TSTALIASID
```

3. Create backend endpoints:
   - `/api/amazonq/parse` - Parse user messages
   - `/api/amazonq/chat` - Send chat messages

## Quick Start

### Basic Message Parsing

```typescript
import { parseUserMessageWithQ } from '@/lib/integrations/awsq';

const action = await parseUserMessageWithQ("send $10 to user123");

if (action?.type === 'create_escrow') {
  console.log('Amount:', action.amount);
  console.log('Recipients:', action.recipients);
}
```

### Chat with Amazon Q

```typescript
import { sendMessageToQ, formatMessagesForQ } from '@/lib/integrations/awsq';

const messages = formatMessagesForQ([
  { role: 'user', content: 'Hello, I need help' }
]);

const response = await sendMessageToQ(messages, apiKey);
console.log(response.content);
```

### With Session Management

```typescript
import { 
  sendMessageToQ, 
  qSessionManager 
} from '@/lib/integrations/awsq';

// Create a session
const session = qSessionManager.createSession();

// Send message with session
const response = await sendMessageToQ(
  messages,
  apiKey,
  { sessionId: session.sessionId }
);

// Update session with conversation ID
qSessionManager.updateSession(session.sessionId, {
  conversationId: response.conversationId
});
```

## Advanced Usage

### Configuration

```typescript
import { initializeQConfig, getQConfig } from '@/lib/integrations/awsq';

// Initialize configuration
initializeQConfig({
  region: 'us-east-1',
  agentId: 'your-agent-id',
  agentAliasId: 'TSTALIASID',
  maxTokens: 1000,
  temperature: 0.8,
  timeout: 15000,
  retries: 3,
  enableLogging: true
});

// Get current config
const config = getQConfig();
console.log(config);
```

### Retry Logic

```typescript
import { sendMessageToQWithRetry } from '@/lib/integrations/awsq';

// Automatically retries up to 3 times with exponential backoff
const response = await sendMessageToQWithRetry(
  messages,
  apiKey,
  options,
  3 // max retries
);
```

### Custom Parse Options

```typescript
import { parseUserMessageWithQ } from '@/lib/integrations/awsq';

const action = await parseUserMessageWithQ(
  "send 0.001 BTC to user123",
  {
    timeout: 5000,        // 5 second timeout
    retries: 2,           // 2 retry attempts
    fallbackToLocal: true // fallback if all attempts fail
  }
);
```

### Metrics Tracking

```typescript
import { qMetrics } from '@/lib/integrations/awsq';

// Get current metrics
const metrics = qMetrics.getMetrics();
console.log('Total requests:', metrics.totalRequests);
console.log('Success rate:', qMetrics.getSuccessRate());
console.log('Avg response time:', metrics.averageResponseTime);

// Get recent events
const events = qMetrics.getEvents(10);
console.log('Recent events:', events);

// Export metrics
const report = qMetrics.exportMetrics();
console.log(report);
```

### Session Statistics

```typescript
import { qSessionManager } from '@/lib/integrations/awsq';

const stats = qSessionManager.getSessionStats(sessionId);
if (stats) {
  console.log('Messages sent:', stats.messageCount);
  console.log('Session duration:', stats.duration);
  console.log('Is active:', stats.isActive);
}

// Get all active sessions
const activeSessions = qSessionManager.getActiveSessions();
console.log('Active sessions:', activeSessions.length);
```

## Supported Actions

### 1. Create Escrow
```typescript
{
  type: 'create_escrow',
  amount: '0.001',
  recipients: ['user123', 'user456'],
  originalCurrency: 'USD',
  title: 'Payment for services',
  percentages: [60, 40]
}
```

### 2. Set Bitcoin Address
```typescript
{
  type: 'set_bitcoin_address',
  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
}
```

### 3. Approval Suggestion
```typescript
{
  type: 'approval_suggestion'
}
```

### 4. Help Decide Escrows
```typescript
{
  type: 'help_decide_escrows'
}
```

### 5. Query
```typescript
{
  type: 'query',
  query: 'btc_balance' | 'principal' | 'all' | ...
}
```

### 6. Navigation
```typescript
{
  type: 'navigate',
  destination: 'dashboard' | 'escrow' | 'transactions' | 'settings'
}
```

### 7. Positive Acknowledgment
```typescript
{
  type: 'positive_acknowledgment'
}
```

## API Reference

### Functions

#### `parseUserMessageWithQ(message, options?)`
Parse user message into structured action.

**Parameters:**
- `message: string` - User message to parse
- `options?: ParseOptions` - Optional parsing configuration

**Returns:** `Promise<ParsedAction>`

#### `sendMessageToQ(messages, apiKey?, options?)`
Send messages to Amazon Q.

**Parameters:**
- `messages: QMessage[]` - Array of messages
- `apiKey?: string` - Optional API key
- `options?: QChatOptions` - Optional chat configuration

**Returns:** `Promise<QResponse>`

#### `sendMessageToQWithRetry(messages, apiKey?, options?, maxRetries?)`
Send messages with automatic retry logic.

**Parameters:**
- `messages: QMessage[]` - Array of messages
- `apiKey?: string` - Optional API key
- `options?: QChatOptions` - Optional chat configuration
- `maxRetries?: number` - Maximum retry attempts (default: 3)

**Returns:** `Promise<QResponse>`

#### `formatMessagesForQ(messages)`
Format messages for Amazon Q API.

**Parameters:**
- `messages: Array<{role, content}>` - Messages to format

**Returns:** `QMessage[]`

#### `validateQMessage(message)`
Validate a Q message.

**Parameters:**
- `message: QMessage` - Message to validate

**Returns:** `boolean`

#### `sanitizeMessages(messages)`
Sanitize and filter messages.

**Parameters:**
- `messages: QMessage[]` - Messages to sanitize

**Returns:** `QMessage[]`

### Session Manager

#### `qSessionManager.createSession()`
Create a new session.

**Returns:** `QSession`

#### `qSessionManager.getSession(sessionId)`
Get existing session.

**Returns:** `QSession | null`

#### `qSessionManager.updateSession(sessionId, updates)`
Update session data.

#### `qSessionManager.incrementMessageCount(sessionId)`
Increment message counter for session.

#### `qSessionManager.deleteSession(sessionId)`
Delete a session.

#### `qSessionManager.getActiveSessions()`
Get all active sessions.

**Returns:** `QSession[]`

### Configuration

#### `initializeQConfig(config)`
Initialize AWS Q configuration.

#### `getQConfig()`
Get current configuration.

**Returns:** `Readonly<AWSQConfig>`

#### `isQConfigured()`
Check if AWS Q is configured.

**Returns:** `boolean`

### Metrics

#### `qMetrics.recordRequest(success, responseTime, tokensUsed?)`
Record a request for metrics.

#### `qMetrics.getMetrics()`
Get current metrics.

**Returns:** `Readonly<QMetrics>`

#### `qMetrics.getSuccessRate()`
Get success rate percentage.

**Returns:** `number`

#### `qMetrics.exportMetrics()`
Export metrics as JSON string.

**Returns:** `string`

## Error Handling

The integration includes comprehensive error handling:

```typescript
const response = await sendMessageToQ(messages, apiKey);

if (response.error) {
  switch (response.error) {
    case 'NO_API_KEY':
      // Handle missing API key
      break;
    case 'UNKNOWN_ERROR':
      // Handle unknown errors
      break;
    default:
      // Handle other errors
      console.error('Error:', response.error);
  }
}
```

## Best Practices

1. **Always use session management** for multi-turn conversations
2. **Monitor metrics** to track performance and identify issues
3. **Configure timeouts** appropriately for your use case
4. **Use retry logic** for production environments
5. **Validate inputs** before sending to API
6. **Handle errors gracefully** with fallback mechanisms
7. **Clean up sessions** when conversations end

## Migration from OpenAI

```typescript
// Before (OpenAI)
import { parseUserMessageWithAI } from '@/lib/integrations/openai';
const action = await parseUserMessageWithAI(message);

// After (AWS Q)
import { parseUserMessageWithQ } from '@/lib/integrations/awsq';
const action = await parseUserMessageWithQ(message);
```

## Troubleshooting

### High Latency
- Check `qMetrics.getMetrics()` for average response time
- Adjust timeout settings in configuration
- Review AWS region selection

### Failed Requests
- Check `qMetrics.getSuccessRate()`
- Review recent events with `qMetrics.getEvents()`
- Verify AWS credentials and permissions

### Session Issues
- Use `qSessionManager.getSessionStats()` to debug
- Check for expired sessions
- Verify session IDs are being passed correctly

## License

Part of the SplitSafe AI Agent project.

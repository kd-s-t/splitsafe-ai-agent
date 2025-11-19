# OpenAI vs Amazon Q Code Comparison

This document shows the key differences between the OpenAI and Amazon Q implementations.

## Frontend Integration

### 1. Import Statement

**Before (OpenAI):**
```typescript
import { parseUserMessageWithAI } from '@/lib/integrations/openai';
```

**After (Amazon Q):**
```typescript
import { parseUserMessageWithQ } from '@/lib/integrations/awsq';
```

### 2. Function Call

**Before (OpenAI):**
```typescript
const action = await parseUserMessageWithAI(message);
```

**After (Amazon Q):**
```typescript
const action = await parseUserMessageWithQ(message, {
  timeout: 10000,
  retries: 2,
  fallbackToLocal: true
});
```

### 3. API Endpoint

**Before (OpenAI):**
```typescript
const response = await apiCall('/api/openai/parse', {
  method: 'POST',
  body: JSON.stringify({ message }),
});
```

**After (Amazon Q):**
```typescript
const response = await apiCall('/api/amazonq/parse', {
  method: 'POST',
  body: JSON.stringify({ message }),
  signal: controller.signal, // Timeout support
});
```

## Backend Service

### Service File Location

**Before (OpenAI):**
```
lib/services/openai.service.ts
```

**After (Amazon Q):**
```
lib/services/amazonq.service.ts
```

### Service Implementation

**Before (OpenAI):**
```typescript
import { Configuration, OpenAIApi } from 'openai';

export class OpenAIService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async parseMessage(message: string) {
    const response = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
    });
    return response.data.choices[0].message?.content;
  }
}
```

**After (Amazon Q):**
```typescript
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';

export class AmazonQService {
  private client: BedrockAgentRuntimeClient;

  constructor() {
    this.client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async parseMessage(message: string) {
    const command = new InvokeAgentCommand({
      agentId: process.env.AWS_Q_AGENT_ID,
      agentAliasId: process.env.AWS_Q_AGENT_ALIAS_ID || 'TSTALIASID',
      sessionId: this.getSessionId(),
      inputText: message,
    });

    const response = await this.client.send(command);
    return this.extractResponseText(response);
  }
}
```

## Key Differences

### 1. Authentication

**OpenAI:**
- Uses API key: `OPENAI_API_KEY`
- Simple bearer token authentication

**Amazon Q:**
- Uses AWS credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- AWS IAM-based authentication
- Supports Builder ID for free tier

### 2. Error Handling

**OpenAI:**
- Basic error handling
- Single attempt
- Simple fallback

**Amazon Q:**
- Retry logic with exponential backoff
- Timeout support
- Enhanced error messages
- Validation functions

### 3. Features

**OpenAI:**
- Direct API calls
- Simple request/response

**Amazon Q:**
- Session management
- Agent-based architecture
- Enhanced validation
- Metrics tracking

### 4. Configuration

**OpenAI:**
```env
OPENAI_API_KEY=sk-proj-...
```

**Amazon Q:**
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_Q_AGENT_ID=your_agent_id
AWS_Q_AGENT_ALIAS_ID=TSTALIASID
```

## File Structure Comparison

### Before (OpenAI)
```
src/lib/integrations/openai/
├── aiParser.ts
├── gptService.ts
├── index.ts
└── ...
```

### After (Amazon Q)
```
src/lib/integrations/awsq/
├── aiParser.ts      (enhanced with retry logic)
├── qService.ts      (replaces gptService.ts)
├── config.ts        (NEW: configuration)
├── sessionManager.ts (NEW: session handling)
├── metrics.ts       (NEW: usage tracking)
├── types.ts         (NEW: type definitions)
└── index.ts
```

## Code Quality Improvements

### Amazon Q Implementation Adds:

1. **Retry Logic**: Automatic retries with exponential backoff
2. **Timeout Support**: Request timeouts to prevent hanging
3. **Validation**: Input/output validation functions
4. **Session Management**: Persistent session handling
5. **Metrics**: Usage tracking and monitoring
6. **Better Error Messages**: More descriptive error handling

## Migration Benefits

1. **Cost**: Amazon Q Builder ID is free (vs OpenAI paid)
2. **Reliability**: Better error handling and retry logic
3. **Scalability**: AWS infrastructure support
4. **Features**: Session management and metrics
5. **Integration**: Native AWS ecosystem integration


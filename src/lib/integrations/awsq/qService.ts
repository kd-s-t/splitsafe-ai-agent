export interface QMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface QResponse {
  content: string;
  sessionId?: string;
  conversationId?: string;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
  };
}

export interface QChatOptions {
  sessionId?: string;
  conversationId?: string;
  streaming?: boolean;
  maxTokens?: number;
  temperature?: number;
}

const SYSTEM_PROMPT = `You are SplitSafe Assistant, a specialized AI assistant for the SplitSafe platform. You can ONLY help with two specific actions:

1. **Create Escrow**: When users ask to create an escrow with an amount and recipient IDs, you redirect them to the escrow creation form.

2. **Approval Suggestions**: When users ask for suggestions on whether to approve or decline received escrows, you redirect them to the transactions page and provide recommendations.

You CANNOT answer general questions about SplitSafe, Bitcoin, or any other topics. You ONLY handle these two specific actions.

If users ask anything else, politely redirect them to these two actions only.`;

export async function sendMessageToQ(
  messages: QMessage[],
  apiKey?: string,
  options?: QChatOptions
): Promise<QResponse> {
  const startTime = Date.now();
  
  try {
    if (!apiKey) {
      return {
        content: "I'm sorry, but the Amazon Q service is not configured. Please contact support to enable this feature.",
        error: "NO_API_KEY"
      };
    }

    const { apiCall } = await import('@/lib/internal/auth/api-client');
    
    const requestBody = {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      sessionId: options?.sessionId,
      conversationId: options?.conversationId,
      maxTokens: options?.maxTokens || 500,
      temperature: options?.temperature || 0.7,
    };

    const response = await apiCall('/api/amazonq/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      
      console.error('Amazon Q API error:', {
        status: response.status,
        error: errorMessage,
        details: errorData
      });

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.content || data.response?.content || data.output;

    if (!content) {
      throw new Error('No response content received from Amazon Q');
    }

    const responseTime = Date.now() - startTime;

    return {
      content,
      sessionId: data.sessionId || options?.sessionId,
      conversationId: data.conversationId || options?.conversationId,
      metadata: {
        tokensUsed: data.tokensUsed,
        responseTime
      }
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Error calling Amazon Q API:', {
      error,
      responseTime,
      options
    });

    return {
      content: "I'm sorry, but I'm having trouble connecting to my services right now. Please try again later or contact support if the issue persists.",
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      metadata: {
        responseTime
      }
    };
  }
}

export async function sendMessageToQWithRetry(
  messages: QMessage[],
  apiKey?: string,
  options?: QChatOptions,
  maxRetries: number = 3
): Promise<QResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await sendMessageToQ(messages, apiKey, options);
      
      if (!response.error) {
        return response;
      }
      
      // Don't retry on certain errors
      if (response.error === 'NO_API_KEY') {
        return response;
      }
      
      lastError = new Error(response.error);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return {
    content: "I'm sorry, but I'm having trouble connecting to my services after multiple attempts. Please try again later.",
    error: lastError?.message || 'MAX_RETRIES_EXCEEDED'
  };
}

export function formatMessagesForQ(messages: Array<{ role: 'user' | 'assistant'; content: string }>): QMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

export function validateQMessage(message: QMessage): boolean {
  if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) {
    return false;
  }
  if (typeof message.content !== 'string' || message.content.trim().length === 0) {
    return false;
  }
  return true;
}

export function sanitizeMessages(messages: QMessage[]): QMessage[] {
  return messages
    .filter(validateQMessage)
    .map(msg => ({
      ...msg,
      content: msg.content.trim()
    }));
}

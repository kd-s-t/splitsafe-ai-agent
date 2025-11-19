export interface GPTMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GPTResponse {
  content: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are SplitSafe Assistant, a specialized AI assistant for the SplitSafe platform. You can ONLY help with two specific actions:

1. **Create Escrow**: When users ask to create an escrow with an amount and recipient IDs, you redirect them to the escrow creation form.

2. **Approval Suggestions**: When users ask for suggestions on whether to approve or decline received escrows, you redirect them to the transactions page and provide recommendations.

You CANNOT answer general questions about SplitSafe, Bitcoin, or any other topics. You ONLY handle these two specific actions.

If users ask anything else, politely redirect them to these two actions only.`;

export async function sendMessageToGPT(
  messages: GPTMessage[],
  apiKey?: string
): Promise<GPTResponse> {
  try {
    // Check if API key is available
    if (!apiKey) {
      return {
        content: "I'm sorry, but the GPT-3.5 service is not configured. Please contact support to enable this feature.",
        error: "No API key provided"
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content received from GPT');
    }

    return { content };
  } catch (error) {
    console.error('Error calling GPT API:', error);
    return {
      content: "I'm sorry, but I'm having trouble connecting to my services right now. Please try again later or contact support if the issue persists.",
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function formatMessagesForGPT(messages: Array<{ role: 'user' | 'assistant'; content: string }>): GPTMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
} 
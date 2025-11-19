export interface EscrowCreateAction {
  type: 'create_escrow';
  amount: string;
  recipients: string[];
  originalCurrency?: string; // Track original currency for conversion
  title?: string; // Custom title if provided
  percentages?: number[]; // Percentage distribution for recipients
}

export interface ApprovalSuggestionAction {
  type: 'approval_suggestion';
}

export interface HelpDecideEscrowsAction {
  type: 'help_decide_escrows';
}

export interface BitcoinAddressSetAction {
  type: 'set_bitcoin_address';
  address: string;
}

export interface QueryAction {
  type: 'query';
  query: 'principal' | 'icp_balance' | 'btc_balance' | 'btc_address' | 'sei_address' | 'sei_balance' | 'nickname' | 'all';
}

export interface PositiveAcknowledgmentAction {
  type: 'positive_acknowledgment';
}

export interface NavigationAction {
  type: 'navigate';
  destination: 'dashboard' | 'escrow' | 'transactions' | 'settings';
}

export type ParsedAction = EscrowCreateAction | ApprovalSuggestionAction | HelpDecideEscrowsAction | BitcoinAddressSetAction | QueryAction | PositiveAcknowledgmentAction | NavigationAction | null;

export async function parseUserMessageWithAI(message: string): Promise<ParsedAction> {
  try {
    console.log('DEBUG: AI Parser - Message:', message);
    
    // Call our server-side API route instead of OpenAI directly
    // Use apiCall which handles JWT token automatically
    const { apiCall } = await import('@/lib/internal/auth/api-client');
    
    const response = await apiCall('/api/openai/parse', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.warn(`AI Parser API request failed with status ${response.status}. Falling back to local parser.`);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.content) {
      console.warn('No response content received from AI Parser API. Falling back to local parser.');
      return null;
    }

    const content = data.content;

    console.log('DEBUG: AI Parser - API response content:', content);

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      
      if (parsed.action === 'create_escrow') {
        return {
          type: 'create_escrow',
          amount: parsed.amount,
          recipients: parsed.recipients || [],
          originalCurrency: parsed.originalCurrency,
          title: parsed.title,
          percentages: parsed.percentages
        };
      } else if (parsed.action === 'set_bitcoin_address') {
        return {
          type: 'set_bitcoin_address',
          address: parsed.address
        };
      } else if (parsed.action === 'approval_suggestion') {
        return {
          type: 'approval_suggestion'
        };
      } else if (parsed.action === 'help_decide_escrows') {
        return {
          type: 'help_decide_escrows'
        };
      } else if (parsed.action === 'query') {
        return {
          type: 'query',
          query: parsed.query
        };
      } else if (parsed.action === 'positive_acknowledgment') {
        return {
          type: 'positive_acknowledgment'
        };
      } else if (parsed.action === 'navigate') {
        return {
          type: 'navigate',
          destination: parsed.destination
        };
      }
    } catch {
      console.warn('Failed to parse AI response as JSON. Falling back to local parser.');
      console.debug('Raw AI response:', content);
    }

    return null;
  } catch (error) {
    console.warn('Error parsing message with AI. Falling back to local parser.');
    console.debug('Error details:', error);
    return null;
  }
} 
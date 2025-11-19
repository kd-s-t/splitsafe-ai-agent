import { parseUserMessageWithQ, type ParsedAction, type ParseOptions } from '../awsq';
import { parseUserMessageWithAI } from '../openai';
import { getAIProvider } from './provider';

export type AIProvider = 'openai' | 'amazonq';

export interface UnifiedParseOptions extends ParseOptions {
  provider?: AIProvider;
}

export async function parseUserMessage(
  message: string,
  options: UnifiedParseOptions = {}
): Promise<ParsedAction> {
  const { provider = getAIProvider(), ...parseOptions } = options;

  try {
    const { apiCall } = await import('@/lib/internal/auth/api-client');
    
    const response = await apiCall('/api/ai/parse', {
      method: 'POST',
      body: JSON.stringify({ message, provider }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.content) {
        return parseActionFromContent(data.content);
      }
    }
  } catch (error) {
    console.warn('Unified endpoint failed, falling back to individual providers');
  }

  return provider === 'amazonq'
    ? await parseUserMessageWithQ(message, parseOptions)
    : await parseUserMessageWithAI(message);
}

function parseActionFromContent(content: string): ParsedAction {
  try {
    const parsed = JSON.parse(content);
    
    switch (parsed.action) {
      case 'create_escrow':
        return validateEscrowAction(parsed) ? {
          type: 'create_escrow',
          amount: parsed.amount,
          recipients: parsed.recipients || [],
          originalCurrency: parsed.originalCurrency,
          title: parsed.title,
          percentages: parsed.percentages
        } : null;

      case 'set_bitcoin_address':
        return validateBitcoinAddress(parsed.address) ? {
          type: 'set_bitcoin_address',
          address: parsed.address
        } : null;

      case 'approval_suggestion':
        return { type: 'approval_suggestion' };

      case 'help_decide_escrows':
        return { type: 'help_decide_escrows' };

      case 'query':
        return validateQueryAction(parsed.query) ? {
          type: 'query',
          query: parsed.query
        } : null;

      case 'positive_acknowledgment':
        return { type: 'positive_acknowledgment' };

      case 'navigate':
        return validateNavigationAction(parsed.destination) ? {
          type: 'navigate',
          destination: parsed.destination
        } : null;

      default:
        console.warn('Unknown action type:', parsed.action);
        return null;
    }
  } catch (error) {
    console.warn('Failed to parse AI response as JSON:', error);
    console.debug('Raw content:', content);
    return null;
  }
}

function validateEscrowAction(parsed: any): boolean {
  if (!parsed.amount || typeof parsed.amount !== 'string') {
    console.warn('Invalid escrow action: missing or invalid amount');
    return false;
  }
  if (!Array.isArray(parsed.recipients)) {
    console.warn('Invalid escrow action: recipients must be an array');
    return false;
  }
  return true;
}

function validateBitcoinAddress(address: any): boolean {
  if (typeof address !== 'string' || address.length < 26 || address.length > 62) {
    console.warn('Invalid Bitcoin address format');
    return false;
  }
  return true;
}

function validateQueryAction(query: any): boolean {
  const validQueries = ['principal', 'icp_balance', 'btc_balance', 'btc_address', 'sei_address', 'sei_balance', 'nickname', 'all'];
  if (!validQueries.includes(query)) {
    console.warn('Invalid query type:', query);
    return false;
  }
  return true;
}

function validateNavigationAction(destination: any): boolean {
  const validDestinations = ['dashboard', 'escrow', 'transactions', 'settings'];
  if (!validDestinations.includes(destination)) {
    console.warn('Invalid navigation destination:', destination);
    return false;
  }
  return true;
}

export { type ParsedAction, type ParseOptions } from '../awsq';

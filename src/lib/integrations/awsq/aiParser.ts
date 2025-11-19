export interface EscrowCreateAction {
  type: 'create_escrow';
  amount: string;
  recipients: string[];
  originalCurrency?: string;
  title?: string;
  percentages?: number[];
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

export interface ParseOptions {
  timeout?: number;
  retries?: number;
  fallbackToLocal?: boolean;
}

export async function parseUserMessageWithQ(
  message: string,
  options: ParseOptions = {}
): Promise<ParsedAction> {
  const {
    timeout = 10000,
    retries = 2,
    fallbackToLocal = true
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`DEBUG: Amazon Q Parser - Attempt ${attempt}/${retries}:`, message);
      
      const { apiCall } = await import('@/lib/internal/auth/api-client');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await apiCall('/api/amazonq/parse', {
          method: 'POST',
          body: JSON.stringify({ message }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.content) {
          throw new Error('No response content received from Amazon Q Parser API');
        }

        const content = data.content;
        console.log('DEBUG: Amazon Q Parser - API response:', content);

        const parsed = parseActionFromContent(content);
        if (parsed) {
          return parsed;
        }

        console.warn('Amazon Q returned unrecognized action format');
        return null;

      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Amazon Q Parser attempt ${attempt}/${retries} failed:`, lastError.message);

      if (attempt < retries) {
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 2000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  if (fallbackToLocal) {
    console.warn('All Amazon Q Parser attempts failed. Falling back to local parser.');
    console.debug('Last error:', lastError);
  }

  return null;
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
    console.warn('Failed to parse Amazon Q response as JSON:', error);
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

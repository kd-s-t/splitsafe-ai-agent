export interface EscrowCreateAction {
  type: 'create_escrow';
  amount: string;
  recipients: string[];
  originalCurrency?: string; // Track original currency for conversion
  title?: string; // Custom title if provided
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

import { detectCurrencyAmount } from '../../utils';


export function parseUserMessage(message: string): ParsedAction {
  const lowerMessage = message.toLowerCase();
  
  // Check for currency amounts first
  const currencyInfo = detectCurrencyAmount(message);
  
  // Pattern 1: Create escrow with amount and recipients (flexible format)
  const escrowPatterns = [
    // "create me an escrow 1.5 split equally with this id 6plni-kg3vz-j364n-kq4og-knybs-dlcve-foeoj-3dom6-72644-44fmd-bqe, modgw-in3j2-6e4ze-4gcda-sixdn-4wj5m-wezzo-3v5gy-nfsz5-5skqf-yqe"
    /create.*escrow.*?(\d*\.?\d+).*?(?:btc|split).*?(?:id|with).*?([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i,
    
    // "create an escrow with amount of .5 btc for my homework with these id: 12312, dsadsa, asdsad, dsadsa"
    /create.*escrow.*amount.*?(\d*\.?\d+)\s*btc.*?id.*?([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i,
    
    // "create escrow 0.5 btc for recipients: 12312, dsadsa"
    /create.*escrow.*?(\d*\.?\d+).*?(?:btc|for).*?(?:recipients?|id).*?([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i,
    
    // "send $5 to user123" or "transfer €10 to alice and bob"
    /(?:send|transfer|create|make).*?(\$?\d*\.?\d+).*?(?:to|for).*?([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i,
    
    // "send $1 to this people: id1, id2, id3" (more flexible format)
    /(?:send|transfer|create|make).*?(\$?\d*\.?\d+).*?(?:to|for).*?(?:this\s+people?|these\s+people?|recipients?):?\s*([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i,
    
    // "send $5 to these people id1, id2, id3" (without colon)
    /(?:send|transfer|create|make).*?(\$?\d*\.?\d+).*?(?:to|for).*?(?:these\s+people?)\s+([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i,
  ];
  
  for (const pattern of escrowPatterns) {
    const match = message.match(pattern);
    if (match) {
      let amount = match[1];
      const recipientsText = match[2];
      let originalCurrency: string | undefined;
      
      // Extract recipient IDs (split by commas, spaces, or other delimiters)
      const recipients = recipientsText
        .split(/[,\s]+/)
        .map(id => id.trim())
        .filter(id => id.length > 0);
      

      
             // Handle currency conversion if currency was detected
       if (currencyInfo && currencyInfo.originalText.includes(amount)) {
         // For local parser, use approximate conversion rates
         const currencyAmount = parseFloat(currencyInfo.amount);
         let btcAmount = 0.03; // Default fallback
         
         // Use approximate rates for local parsing
         switch (currencyInfo.currency) {
           case '$':
           case 'USD':
             btcAmount = currencyAmount * 0.000025; // $1 ≈ 0.000025 BTC
             break;
           case '€':
           case 'EUR':
             btcAmount = currencyAmount * 0.000027; // €1 ≈ 0.000027 BTC
             break;
           case '£':
           case 'GBP':
             btcAmount = currencyAmount * 0.000032; // £1 ≈ 0.000032 BTC
             break;
           case '¥':
           case 'JPY':
             btcAmount = currencyAmount * 0.00000017; // ¥1 ≈ 0.00000017 BTC
             break;
           default:
             btcAmount = currencyAmount * 0.000025; // Default to USD rate
         }
         
         amount = btcAmount.toFixed(8);
         originalCurrency = currencyInfo.originalText;
       }
      
      // Extract title if provided
      let title: string | undefined;
      const titleMatch = message.match(/title\s+(\w+)/i);
      if (titleMatch) {
        title = titleMatch[1];
      }
      
      return {
        type: 'create_escrow',
        amount,
        recipients,
        originalCurrency,
        title
      };
    }
  }
  
  // Pattern 2: Approval suggestions for received escrows
  const approvalPatterns = [
    /(suggest|approve|decline|recommend).*(escrow|transaction)/i,
    /(suggest|approve|decline|recommend).*(approval|approvals)/i,
    /(approval|approvals).*(suggestion|recommendation)/i,
    /(should|can|would).*(approve|decline)/i,
    /(help|assist).*(approve|decline|decision)/i
  ];
  
  for (const pattern of approvalPatterns) {
    if (pattern.test(lowerMessage)) {
      return {
        type: 'approval_suggestion'
      };
    }
  }
  
  
  // Pattern 4: Query account information
  const queryPatterns = [
    // Principal queries
    /(?:what|show|tell).*(?:is|are).*(?:my|your).*(?:principal|id|identity)/i,
    /(?:my|your).*(?:principal|id|identity).*(?:is|are)/i,
    
    // ICP balance queries
    /(?:what|show|tell).*(?:is|are).*(?:my|your).*(?:icp|internet computer).*(?:balance|amount)/i,
    /(?:my|your).*(?:icp|internet computer).*(?:balance|amount).*(?:is|are)/i,
    /(?:icp|internet computer).*(?:balance|amount)/i,
    
    // BTC balance queries
    /(?:what|show|tell).*(?:is|are).*(?:my|your).*(?:btc|bitcoin).*(?:balance|amount)/i,
    /(?:my|your).*(?:btc|bitcoin).*(?:balance|amount).*(?:is|are)/i,
    /(?:btc|bitcoin).*(?:balance|amount)/i,
    
    // BTC address queries
    /(?:what|show|tell).*(?:is|are).*(?:my|your).*(?:btc|bitcoin).*(?:address)/i,
    /(?:my|your).*(?:btc|bitcoin).*(?:address).*(?:is|are)/i,
    /(?:btc|bitcoin).*(?:address)/i,
    
    // General account queries
    /(?:what|show|tell).*(?:is|are).*(?:my|your).*(?:account|info|information)/i,
    /(?:my|your).*(?:account|info|information)/i,
    /(?:account|info|information)/i
  ];
  
  for (const pattern of queryPatterns) {
    const match = message.match(pattern);
    console.log('Testing pattern:', pattern, 'against message:', message, 'match:', match);
    if (match) {
      const lowerMessage = message.toLowerCase();
      
      // Determine the specific query type
      if (lowerMessage.includes('principal') || lowerMessage.includes('id') || lowerMessage.includes('identity')) {
        return { type: 'query', query: 'principal' };
      } else if (lowerMessage.includes('icp') || lowerMessage.includes('internet computer')) {
        return { type: 'query', query: 'icp_balance' };
      } else if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
        if (lowerMessage.includes('address')) {
          return { type: 'query', query: 'btc_address' };
        } else {
          return { type: 'query', query: 'btc_balance' };
        }
      } else {
        // General account query - return all info
        return { type: 'query', query: 'all' };
      }
    }
  }
  
  // Pattern 5: Navigation requests
  const navigationPatterns = [
    // Dashboard navigation
    /(?:go to|show|open|navigate to|take me to).*(?:dashboard|home|main)/i,
    /(?:dashboard|home|main)/i,
    
    // Escrow navigation
    /(?:go to|show|open|navigate to|take me to).*(?:escrow|create|new)/i,
    /(?:escrow|create|new).*(?:escrow|transaction)/i,
    
    // Transactions navigation
    /(?:go to|show|open|navigate to|take me to).*(?:transactions?|history|activity)/i,
    /(?:transactions?|history|activity)/i,
    
    // Integrations navigation
    /(?:go to|show|open|navigate to|take me to).*(?:integrations?|settings?|bitcoin|sei)/i,
    /(?:integrations?|settings?|bitcoin|sei)/i,
    
    // Settings navigation
    /(?:go to|show|open|navigate to|take me to).*(?:settings?|preferences?|config)/i,
    /(?:settings?|preferences?|config)/i
  ];
  
  for (const pattern of navigationPatterns) {
    const match = message.match(pattern);
    if (match) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('dashboard') || lowerMessage.includes('home') || lowerMessage.includes('main')) {
        return { type: 'navigate', destination: 'dashboard' };
      } else if (lowerMessage.includes('escrow') || lowerMessage.includes('create') || lowerMessage.includes('new')) {
        return { type: 'navigate', destination: 'escrow' };
      } else if (lowerMessage.includes('transaction') || lowerMessage.includes('history') || lowerMessage.includes('activity')) {
        return { type: 'navigate', destination: 'transactions' };
      } else if (lowerMessage.includes('integration') || lowerMessage.includes('bitcoin') || lowerMessage.includes('sei')) {
        return { type: 'navigate', destination: 'settings' };
      } else if (lowerMessage.includes('setting') || lowerMessage.includes('preference') || lowerMessage.includes('config')) {
        return { type: 'navigate', destination: 'settings' };
      }
    }
  }

  // Pattern 6: Positive acknowledgments
  const positiveAckPatterns = [
    /^(nice|great|awesome|excellent|perfect|sweet|cool|good|ok|okay|yeah|yes|yep|yup|👍|✅|🎉|😊|😄|😎)$/i,
    /^(thanks?|thank you|thx|ty|appreciate it|grateful)$/i,
    /^(got it|understood|gotcha|roger|copy that|acknowledged)$/i,
    /^(sounds good|looks good|that works|perfect|excellent|brilliant)$/i,
    /^(you're welcome|no problem|anytime|my pleasure)$/i
  ];
  
  for (const pattern of positiveAckPatterns) {
    const match = message.match(pattern);
    if (match) {
      return { type: 'positive_acknowledgment' };
    }
  }
  
  return null;
}

export function generateActionResponse(action: ParsedAction, userData?: {
  principal?: string | null;
  icpBalance?: string | null;
  ckbtcBalance?: string | null;
  ckbtcAddress?: string | null;
  seiAddress?: string | null;
  nickname?: string | null;
}, adjustedAmount?: boolean): string {
  if (!action) {
    return "I can help with three specific actions:\n\n1. **Create Escrow**: Try saying:\n   - 'send 2 btc to [recipient-id]'\n   - 'send $50 to [recipient-id]'\n   - 'create escrow 1.5 btc for [recipient-ids]'\n   - 'transfer €100 to [recipient]'\n   - 'send 1.245 btc to kenan 60% and don 40%'\n\n2. **Account Queries**: Try saying:\n   - 'what is my principal ID?'\n   - 'show my ICP balance'\n   - 'show my BTC balance'\n   - 'what's my Bitcoin address?'\n  - 'what is my nickname?'\n   - 'tell me my account info'\n\n3. **Help with Escrow Decisions**: Try saying:\n   - 'help me decide on my escrows'\n   - 'should I approve or decline?'\n   - 'suggest approvals for my escrows'\n   - 'what should I do with my escrows?'\n   - 'advice on my escrows'\n   - 'give me approval recommendations'\n\nPlease rephrase your request using one of these formats.";
  }
  
  switch (action.type) {
    case 'create_escrow':
      const recipientCount = action.recipients.length;
      const recipientText = recipientCount === 1 ? 'recipient' : 'recipients';
      
      if (action.originalCurrency) {
        if (adjustedAmount && userData?.ckbtcBalance) {
          const titleText = action.title ? ` titled "${action.title}"` : '';
          return `I'll help you create an escrow for ${action.amount} BTC (adjusted from ${action.originalCurrency} due to your available balance of ${userData.ckbtcBalance} BTC) with ${recipientCount} ${recipientText}${titleText}. Redirecting you to the escrow creation form...`;
        } else {
          const titleText = action.title ? ` titled "${action.title}"` : '';
          return `I'll help you create an escrow for ${action.originalCurrency} (converted to ${action.amount} BTC) with ${recipientCount} ${recipientText}${titleText}. Redirecting you to the escrow creation form...`;
        }
      } else {
        return `I'll help you create an escrow for ${action.amount} BTC with ${recipientCount} ${recipientText}. Redirecting you to the escrow creation form...`;
      }
    
    case 'set_bitcoin_address':
      if (action.address === 'invalid') {
        return "I couldn't recognize a valid Bitcoin address in your message. Please provide a valid Bitcoin address that starts with '1', '3', or 'bc1'. For example: 'set my bitcoin address to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'";
      }
      return `I'll help you set your Bitcoin address to ${action.address}. Redirecting you to the integrations page...`;
    
    case 'query':
      if (!userData) {
        return "I'm sorry, but I can't access your account information right now. Please try again later.";
      }
      
      switch (action.query) {
        case 'principal':
          return userData.principal 
            ? `Your principal ID is: ${userData.principal}`
            : "I couldn't find your principal ID. Please make sure you're logged in.";
        
        case 'icp_balance':
          return userData.icpBalance 
            ? `Your ICP balance is: ${userData.icpBalance} ICP`
            : "I couldn't find your ICP balance. Please make sure you're logged in.";
        
        case 'btc_balance':
          return userData.ckbtcBalance 
            ? `Your Bitcoin balance is: ${userData.ckbtcBalance} BTC`
            : "I couldn't find your Bitcoin balance. Please make sure you're logged in.";
        
        case 'btc_address':
          return userData.ckbtcAddress 
            ? `Your Bitcoin address is: ${userData.ckbtcAddress}`
            : "You haven't set a Bitcoin address yet. You can set one in the Integrations page.";
        
        case 'sei_address':
          return userData.seiAddress 
            ? `Your SEI address is: ${userData.seiAddress}`
            : "You haven't set a SEI address yet. You can set one in the Integrations page.";
        
        
        case 'nickname':
          return userData.nickname 
            ? `Your nickname is: ${userData.nickname}`
            : "You haven't set a nickname yet. You can set one in the Settings page.";
        
        case 'all':
          const info = [];
          if (userData.principal) info.push(`Principal: ${userData.principal}`);
          if (userData.icpBalance) info.push(`ICP Balance: ${userData.icpBalance} ICP`);
          if (userData.ckbtcBalance) info.push(`Bitcoin Balance: ${userData.ckbtcBalance} BTC`);
          if (userData.ckbtcAddress) info.push(`Bitcoin Address: ${userData.ckbtcAddress}`);
          
          if (info.length > 0) {
            return `Here's your account information:\n\n${info.join('\n')}`;
          } else {
            return "I couldn't find your account information. Please make sure you're logged in.";
          }
        
        default:
          return "I'm sorry, but I couldn't understand what account information you're looking for.";
      }
    
    case 'positive_acknowledgment':
      return "Great! 😊 Let me know if you need anything else!";
    
    case 'approval_suggestion':
      return `I'll analyze your received escrows and provide approval recommendations. Showing suggestions in 2 seconds...`;
    
    default:
      return "I'm sorry, but I can only handle escrow creation, Bitcoin address setting, account queries, and approval suggestions.";
  }
} 
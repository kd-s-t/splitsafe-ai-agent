'use client';

import { Button } from '@/components/ui/button';
import { generateActionResponse, loadMessages, saveMessages } from '@/lib/integrations/openai';
import { parseUserMessage } from '@/lib/integrations/ai';
import { getAIProvider } from '@/lib/integrations/ai/provider';
import { convertCurrencyToBTC } from '@/lib/utils';
import { Message, RightSidebarProps } from '@/modules/agent/types';
import { BotMessageSquare, Send, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { executeNavigation, getGlobalChatState, handleApprovalSuggestion, handleBitcoinAddressSet, handleEscrowCreation, handleHelpDecideEscrows, handleNavigation, ParsedAction, setRouter } from '@/lib/integrations/openai';
import { useNavigate } from 'react-router-dom';

import { Textarea } from '@/components/ui/textarea';
import { Typography } from '@/components/ui/typography';
import { useUser } from '@/hooks/useUser';
import { DEFAULT_CURRENCY, RANDOM_TITLES } from '@/modules/shared.constants';


export default function AgentRightSidebar({ onToggle }: RightSidebarProps) {
  const navigate = useNavigate();
  const { principal, icpBalance, ckbtcAddress, ckbtcBalance, seiAddress, name } = useUser();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const globalState = getGlobalChatState();
      if (globalState.messages.length > 0) {
        return globalState.messages;
      }
      const savedMessages = loadMessages();
      return savedMessages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);

  useEffect(() => {
    try {
      setRouter(navigate);
    } catch (error) {
      console.error('Error setting router:', error);
    }
  }, [navigate]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const globalState = getGlobalChatState();
      if (globalState.messages.length === 0) {
        const savedMessages = loadMessages();
        if (savedMessages.length === 0) {
          const welcomeMessage: Message = {
            id: 'welcome',
            content: "Hi, I'm your SplitSafe AI Agent! I can help you with three things:\n\n1. **Create an escrow** - Just tell me who you're sending Bitcoin to and how much.\n2. **Check your account info** - Ask about your balance, principal, or address.\n3. **Help with escrow decisions** - I'll help you decide whether to approve or decline received escrows.\n\nJust type what you need and I'll take care of the rest!",
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        } else {
          setMessages(savedMessages);
        }
      }
    } catch {
    }
  }, []);

  // Save messages to localStorage and update global state whenever messages change
  useEffect(() => {
    try {
      saveMessages(messages);
      const globalState = getGlobalChatState();
      globalState.messages = messages;
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);

  // Initial scroll to bottom when messages are first loaded
  useEffect(() => {
    try {
      if (messages.length > 0 && !hasInitiallyScrolled && chatContainerRef.current) {
        // Teleport to bottom immediately on first load
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        setHasInitiallyScrolled(true);
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }, [messages, hasInitiallyScrolled]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let parsedAction: ParsedAction = null;

      // Try AI parser first, then fallback to local parser
      try {
        parsedAction = await parseUserMessage(content, { provider: getAIProvider() });
          
          // Apply balance adjustment to AI parser result if needed
          if (parsedAction && parsedAction.type === 'create_escrow' && ckbtcBalance) {
            const userBalance = parseFloat(ckbtcBalance);
            const requestedAmount = parseFloat(parsedAction.amount);
            
            // DEBUG: AI parser balance check - userBalance:', userBalance, 'requestedAmount:', requestedAmount);
            
            if (requestedAmount > userBalance) {
              // DEBUG: AI parser adjusting amount from', requestedAmount, 'to', userBalance);
              parsedAction.amount = userBalance.toFixed(8);
            }
          }
        } catch (aiError) {
          console.warn('AI parser failed, falling back to local parser:', aiError);
          // Don't show error message to user, just continue to local parser
        }

      if (!parsedAction) {
        // Enhanced fallback to local parsing logic - more intelligent like ChatGPT
        const lowerContent = content.toLowerCase();
        
        // Check for escrow creation with more flexible patterns
        if (lowerContent.includes('send') || lowerContent.includes('transfer') || lowerContent.includes('create') || 
            lowerContent.includes('pay') || lowerContent.includes('split') || lowerContent.includes('give')) {
          
          // Enhanced amount matching - handle more currency formats including $1, €10, etc.
          const amountMatch = content.match(/(?:(\d+(?:\.\d+)?)\s*(?:btc|bitcoin|usd|\$|€|£|¥)|(?:btc|bitcoin|usd|\$|€|£|¥)\s*(\d+(?:\.\d+)?)|(\$|€|£|¥)(\d+(?:\.\d+)?))/i);
          
          // Enhanced recipient matching to handle multiple IDs with spaces and commas
          let recipients: string[] = [];
          let title: string | undefined;
          
          // Try multiple patterns for recipients
          const patterns = [
            // "to these people" followed by IDs (but not including "with" or "title" keywords)
            /(?:to\s+these\s+people?)\s*([a-zA-Z0-9\-\s,]+?)(?:\s+with\s+|\s+title\s+|\s+for\s+|\s*$)/i,
            // "to" followed by IDs - improved to handle comma-separated lists with trailing text
            /(?:to|for)\s+([a-zA-Z0-9\-\s,]+?)(?:\s*,\s*random\s+title|\s+with\s+|\s+title\s+|\s*$)/i,
            // "between" followed by IDs
            /(?:between|among)\s+([a-zA-Z0-9\-\s,]+)/i,
            // "split between" followed by IDs
            /(?:split\s+between)\s+([a-zA-Z0-9\-\s,]+)/i
          ];
          
          for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
              // Split by comma and clean up each ID, preserving spaces within IDs
              recipients = match[1]
                .split(',')
                .map(id => id.trim())
                .filter(id => id.length > 0);
              break;
            }
          }
          
          // Try to extract title from "with" keyword first (more specific)
          const withTitleMatch = content.match(/with\s+([a-zA-Z0-9\s]+)(?:\s*$)/i);
          if (withTitleMatch) {
            const extractedTitle = withTitleMatch[1].trim();
            // If the user asked for a random title, generate one
            if (extractedTitle.toLowerCase() === 'random title') {
              title = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
            } else {
              title = extractedTitle;
            }
          } else {
            // Check for "random title" at the end of the message
            const randomTitleMatch = content.match(/,\s*random\s+title\s*$/i);
            if (randomTitleMatch) {
              title = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
            } else {
              // Fallback to "for" or "title" keywords
              const titleMatch = content.match(/(?:for|title)\s+([a-zA-Z0-9\s]+)(?:\s|$)/i);
              if (titleMatch) {
                const extractedTitle = titleMatch[1].trim();
                if (extractedTitle.toLowerCase() === 'random title') {
                  title = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
                } else {
                  title = extractedTitle;
                }
              }
            }
          }
          
          if (amountMatch && recipients.length > 0) {
            // Handle both number-first and currency-first formats
            const amount = amountMatch[1] || amountMatch[2] || amountMatch[5];
            
            // Extract currency symbol from the full match
            const fullMatch = amountMatch[0];
            let currency = DEFAULT_CURRENCY; // Default to USD
            if (fullMatch.includes('€')) currency = '€';
            else if (fullMatch.includes('£')) currency = '£';
            else if (fullMatch.includes('¥')) currency = '¥';
            else if (fullMatch.includes('btc') || fullMatch.includes('bitcoin')) currency = 'BTC';
            
            const convertedAmount = await convertCurrencyToBTC(parseFloat(amount), currency);
            
            // Check if the converted amount exceeds the user's balance
            let finalAmount = convertedAmount;
            if (ckbtcBalance) {
              const userBalance = parseFloat(ckbtcBalance);
              const requestedAmount = parseFloat(convertedAmount);
              
              // DEBUG: Balance check initiated.');
              // DEBUG: ckbtcBalance (raw):', ckbtcBalance);
              // DEBUG: userBalance (parsed):', userBalance);
              // DEBUG: convertedAmount (from chat):', convertedAmount);
              // DEBUG: requestedAmount (parsed):', requestedAmount);

              if (requestedAmount > userBalance) {
                // DEBUG: Requested amount (', requestedAmount, ') exceeds user balance (', userBalance, '). Adjusting amount.');
                finalAmount = userBalance.toFixed(8);
                // DEBUG: Final amount adjusted to:', finalAmount);
              } else {
                // DEBUG: Requested amount (', requestedAmount, ') is within user balance (', userBalance, '). No adjustment needed.');
              }
            } else {
              // DEBUG: ckbtcBalance is not available, skipping balance check.');
            }
            
            parsedAction = {
              type: 'create_escrow',
              amount: finalAmount,
              recipients: recipients,
              originalCurrency: amountMatch[0],
              title: title
            };
            // DEBUG: Fallback parser created action:', parsedAction);
          } else {
            console.log('Fallback parser could not parse:', { amountMatch, recipients, content });
            // DEBUG: Amount match groups:', amountMatch ? Array.from(amountMatch) : null);
            // DEBUG: Recipients found:', recipients);
          }
        }
        
        // Check for approval suggestions with more patterns
        if (lowerContent.includes('approve') || lowerContent.includes('decline') || 
            lowerContent.includes('suggestion') || lowerContent.includes('recommend') ||
            lowerContent.includes('should i') || lowerContent.includes('what should') ||
            lowerContent.includes('suggest approvals') || lowerContent.includes('approval recommendations')) {
          // DEBUG: Fallback parser detected approval suggestion');
          parsedAction = { type: 'approval_suggestion' };
        }
        
        // Check for help decide on escrows
        if (lowerContent.includes('help me decide') || lowerContent.includes('help decide') ||
            lowerContent.includes('advice on') || lowerContent.includes('help with decision')) {
          // DEBUG: Fallback parser detected help decide escrows');
          parsedAction = { type: 'help_decide_escrows' };
        }
        
        // Check for query patterns - only if no escrow action was detected
        if (!parsedAction) {
          if (lowerContent.includes('what is my principal') || lowerContent.includes('show my principal') || lowerContent.includes('tell me my principal') || lowerContent.includes('my principal id')) {
            // DEBUG: Fallback parser detected principal query');
            parsedAction = { type: 'query', query: 'principal' };
          } else if (lowerContent.includes('what is my icp balance') || lowerContent.includes('show my icp balance') || lowerContent.includes('my icp balance')) {
            // DEBUG: Fallback parser detected ICP balance query');
            parsedAction = { type: 'query', query: 'icp_balance' };
          } else if ((lowerContent.includes('btc') || lowerContent.includes('bitcoin')) && lowerContent.includes('balance') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            // DEBUG: Fallback parser detected BTC balance query');
            parsedAction = { type: 'query', query: 'btc_balance' };
          } else if ((lowerContent.includes('btc') || lowerContent.includes('bitcoin')) && lowerContent.includes('address') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            // DEBUG: Fallback parser detected BTC address query');
            parsedAction = { type: 'query', query: 'btc_address' };
          } else if (lowerContent.includes('sei') && lowerContent.includes('address') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            // DEBUG: Fallback parser detected SEI address query');
            parsedAction = { type: 'query', query: 'sei_address' };
          } else if (lowerContent.includes('sei') && lowerContent.includes('balance') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            // DEBUG: Fallback parser detected SEI balance query');
            parsedAction = { type: 'query', query: 'sei_balance' };
          } else if (lowerContent.includes('nickname') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            // DEBUG: Fallback parser detected nickname query');
            parsedAction = { type: 'query', query: 'nickname' };
          } else if ((lowerContent.includes('account') || lowerContent.includes('info') || lowerContent.includes('information')) && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            // DEBUG: Fallback parser detected general account query');
            parsedAction = { type: 'query', query: 'all' };
          }
        }
      }

      // Generate response based on parsed action
      let response: string;
      if (!parsedAction) {
        // If no action was detected, provide a helpful response
        response = "I can help you with escrow creation! Try saying something like:\n\n• 'send $5 to [recipient-id]'\n• 'create escrow 0.1 btc for [recipient-id]'\n• 'transfer €10 to [recipient-id], random title'\n\nOr ask about your account:\n• 'what is my principal ID?'\n• 'show my Bitcoin balance'\n\nWhat would you like to do?";
      } else {
        response = await generateActionResponse(parsedAction, {
          principal: principal?.toString() || null,
          icpBalance,
          ckbtcAddress,
          ckbtcBalance,
          seiAddress,
          nickname: name
        });
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (parsedAction) {
        let navigation;
        switch (parsedAction.type) {
          case 'create_escrow':
            navigation = handleEscrowCreation(parsedAction);
            break;
          case 'set_bitcoin_address':
            navigation = handleBitcoinAddressSet();
            break;
          case 'approval_suggestion':
            // Set the flag to show approval suggestions
            // DEBUG: Setting approval suggestions flag');
            sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
            // DEBUG: Flag set, current value:', sessionStorage.getItem('splitsafe_show_approval_suggestions'));
            // Also set a timestamp to make it more persistent
            sessionStorage.setItem('splitsafe_approval_timestamp', Date.now().toString());
            navigation = handleApprovalSuggestion(parsedAction);
            break;
          case 'help_decide_escrows':
            // Set the flag to show approval suggestions and help decide
            // DEBUG: Setting help decide escrows flag');
            sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
            sessionStorage.setItem('splitsafe_help_decide', 'true');
            navigation = handleHelpDecideEscrows(parsedAction);
            break;
          case 'navigate':
            navigation = handleNavigation(parsedAction);
            break;
          case 'query':
            // Query actions don't need navigation, they just return information
            // The response is already generated and displayed above
            break;
        }
        
        if (navigation) {
          // If this is an approval suggestion, trigger immediately
          if (parsedAction.type === 'approval_suggestion') {
            // DEBUG: Immediately triggering approval suggestions');
            window.dispatchEvent(new CustomEvent('refresh-approval-suggestions'));
          }
          
          setTimeout(() => {
            executeNavigation(navigation);
            // If this is an approval suggestion, also trigger the suggestions to show
            if (parsedAction.type === 'approval_suggestion') {
              // Dispatch a custom event to trigger suggestions
              window.dispatchEvent(new CustomEvent('refresh-approval-suggestions'));
              // Also set a flag that will persist after navigation
              sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
              // DEBUG: Set flag for after navigation');
              
              // Force show suggestions after navigation
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('force-show-suggestions'));
              }, 2000);
            }
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [principal, icpBalance, ckbtcAddress, ckbtcBalance, seiAddress, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        handleSendMessage(inputValue);
        setInputValue('');
      }
    }
    // Shift+Enter allows new line (default behavior)
  };





  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#212121] border-l border-[#303333] flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#303333]">
        <Typography variant="h4" className="text-white">SplitSafe AI Agent</Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#2F2F2F]"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role !== 'user' && (
              <div className="rounded-full bg-[#FEB64D] self-start p-1">
                <BotMessageSquare size={16} className="text-black" />
              </div>
            )}
            <div
              className={`rounded-lg p-3 overflow-hidden ${
                message.role === 'user'
                  ? 'bg-[#FEB64D] text-black max-w-[70%]'
                  : 'bg-[#2a2a2a] text-white w-full'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm break-all overflow-hidden">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] text-white rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#303333]">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-[#2B2B2B] border-[#424444] text-white placeholder-[#A1A1A1] resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-[#FEB64D] text-black hover:bg-[#FEB64D]/90 disabled:opacity-50 flex-shrink-0"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}

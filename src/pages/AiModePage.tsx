'use client';

import { generateActionResponse, loadMessages, saveMessages } from '@/lib/integrations/openai';
import { parseUserMessage } from '@/lib/integrations/ai';
import { getAIProvider } from '@/lib/integrations/ai/provider';
import { convertCurrencyToBTC } from '@/lib/utils';
import AiModeChatInterface from '@/modules/agent/components/AiModeChatInterface';
import { Message } from '@/modules/agent/types';
import { useCallback, useEffect, useState } from 'react';

import { executeNavigation, getGlobalChatState, handleApprovalSuggestion, handleBitcoinAddressSet, handleEscrowCreation, handleHelpDecideEscrows, handleNavigation, ParsedAction, setRouter } from '@/lib/integrations/openai';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/hooks/useUser';
import { DEFAULT_CURRENCY, RANDOM_TITLES } from '@/modules/shared.constants';

export default function AiModePage() {
  const navigate = useNavigate();
  const { principal, icpBalance, ckbtcAddress, ckbtcBalance, seiAddress, name } = useUser();

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

  useEffect(() => {
    try {
      const wrappedNavigate = (to: string | number, options?: { replace?: boolean }) => {
        if (typeof to === 'number') {
          navigate(to);
        } else {
          navigate(to, options);
        }
      };
      setRouter(wrappedNavigate);
    } catch (error) { 
      console.error('Error setting router:', error);
    }
  }, [navigate]);

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

  useEffect(() => {
    try {
      saveMessages(messages);
      const globalState = getGlobalChatState();
      globalState.messages = messages;
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);


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

      try {
        parsedAction = await parseUserMessage(content, { provider: getAIProvider() });
          
          if (parsedAction && parsedAction.type === 'create_escrow' && ckbtcBalance) {
            const userBalance = parseFloat(ckbtcBalance);
            const requestedAmount = parseFloat(parsedAction.amount);
            
            if (requestedAmount > userBalance) {
              parsedAction.amount = userBalance.toFixed(8);
            }
          }
        } catch (aiError) {
          console.warn('AI parser failed, falling back to local parser:', aiError);
        }

      if (!parsedAction) {
        const lowerContent = content.toLowerCase();
        
        if (lowerContent.includes('send') || lowerContent.includes('transfer') || lowerContent.includes('create') || 
            lowerContent.includes('pay') || lowerContent.includes('split') || lowerContent.includes('give')) {
          
          const amountMatch = content.match(/(?:(\d+(?:\.\d+)?)\s*(?:btc|bitcoin|usd|\$|€|£|¥)|(?:btc|bitcoin|usd|\$|€|£|¥)\s*(\d+(?:\.\d+)?)|(\$|€|£|¥)(\d+(?:\.\d+)?))/i);
          
          let recipients: string[] = [];
          let title: string | undefined;
          
          const patterns = [
            /(?:to\s+these\s+people?)\s*([a-zA-Z0-9\-\s,]+?)(?:\s+with\s+|\s+title\s+|\s+for\s+|\s*$)/i,
            /(?:to|for)\s+([a-zA-Z0-9\-\s,]+?)(?:\s*,\s*random\s+title|\s+with\s+|\s+title\s+|\s*$)/i,
            /(?:between|among)\s+([a-zA-Z0-9\-\s,]+)/i,
            /(?:split\s+between)\s+([a-zA-Z0-9\-\s,]+)/i
          ];
          
          for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
              recipients = match[1]
                .split(',')
                .map(id => id.trim())
                .filter(id => id.length > 0);
              break;
            }
          }
          
          const withTitleMatch = content.match(/with\s+([a-zA-Z0-9\s]+)(?:\s*$)/i);
          if (withTitleMatch) {
            const extractedTitle = withTitleMatch[1].trim();
            if (extractedTitle.toLowerCase() === 'random title') {
              title = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
            } else {
              title = extractedTitle;
            }
          } else {
            const randomTitleMatch = content.match(/,\s*random\s+title\s*$/i);
            if (randomTitleMatch) {
              title = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
            } else {
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
            const amount = amountMatch[1] || amountMatch[2] || amountMatch[5];
            
            const fullMatch = amountMatch[0];
            let currency = DEFAULT_CURRENCY;
            if (fullMatch.includes('€')) currency = '€';
            else if (fullMatch.includes('£')) currency = '£';
            else if (fullMatch.includes('¥')) currency = '¥';
            else if (fullMatch.includes('btc') || fullMatch.includes('bitcoin')) currency = 'BTC';
            
            const convertedAmount = await convertCurrencyToBTC(parseFloat(amount), currency);
            
            let finalAmount = convertedAmount;
            if (ckbtcBalance) {
              const userBalance = parseFloat(ckbtcBalance);
              const requestedAmount = parseFloat(convertedAmount);
              
              if (requestedAmount > userBalance) {
                finalAmount = userBalance.toFixed(8);
              }
            }
            
            parsedAction = {
              type: 'create_escrow',
              amount: finalAmount,
              recipients: recipients,
              originalCurrency: amountMatch[0],
              title: title
            };
          }
        }
        
        if (lowerContent.includes('approve') || lowerContent.includes('decline') || 
            lowerContent.includes('suggestion') || lowerContent.includes('recommend') ||
            lowerContent.includes('should i') || lowerContent.includes('what should') ||
            lowerContent.includes('suggest approvals') || lowerContent.includes('approval recommendations')) {
          parsedAction = { type: 'approval_suggestion' };
        }
        
        if (lowerContent.includes('help me decide') || lowerContent.includes('help decide') ||
            lowerContent.includes('advice on') || lowerContent.includes('help with decision')) {
          parsedAction = { type: 'help_decide_escrows' };
        }
        
        if (!parsedAction) {
          if (lowerContent.includes('what is my principal') || lowerContent.includes('show my principal') || lowerContent.includes('tell me my principal') || lowerContent.includes('my principal id')) {
            parsedAction = { type: 'query', query: 'principal' };
          } else if (lowerContent.includes('what is my icp balance') || lowerContent.includes('show my icp balance') || lowerContent.includes('my icp balance')) {
            parsedAction = { type: 'query', query: 'icp_balance' };
          } else if ((lowerContent.includes('btc') || lowerContent.includes('bitcoin')) && lowerContent.includes('balance') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            parsedAction = { type: 'query', query: 'btc_balance' };
          } else if ((lowerContent.includes('btc') || lowerContent.includes('bitcoin')) && lowerContent.includes('address') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            parsedAction = { type: 'query', query: 'btc_address' };
          } else if (lowerContent.includes('sei') && lowerContent.includes('address') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            parsedAction = { type: 'query', query: 'sei_address' };
          } else if (lowerContent.includes('sei') && lowerContent.includes('balance') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            parsedAction = { type: 'query', query: 'sei_balance' };
          } else if (lowerContent.includes('nickname') && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            parsedAction = { type: 'query', query: 'nickname' };
          } else if ((lowerContent.includes('account') || lowerContent.includes('info') || lowerContent.includes('information')) && (lowerContent.includes('what') || lowerContent.includes('show') || lowerContent.includes('my'))) {
            parsedAction = { type: 'query', query: 'all' };
          }
        }
      }

      let response: string;
      if (!parsedAction) {
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
            sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
            sessionStorage.setItem('splitsafe_approval_timestamp', Date.now().toString());
            navigation = handleApprovalSuggestion(parsedAction);
            break;
          case 'help_decide_escrows':
            sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
            sessionStorage.setItem('splitsafe_help_decide', 'true');
            navigation = handleHelpDecideEscrows(parsedAction);
            break;
          case 'navigate':
            navigation = handleNavigation(parsedAction);
            break;
          case 'query':
            break;
        }
        
        if (navigation) {
          if (parsedAction.type === 'approval_suggestion') {
            window.dispatchEvent(new CustomEvent('refresh-approval-suggestions'));
          }
          
          setTimeout(() => {
            executeNavigation(navigation);
            if (parsedAction.type === 'approval_suggestion') {
              window.dispatchEvent(new CustomEvent('refresh-approval-suggestions'));
              sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
              
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

  const handleSendMessageWrapper = useCallback(async (content: string) => {
    await handleSendMessage(content);
    setInputValue('');
  }, [handleSendMessage]);

  return (
    <AiModeChatInterface
      messages={messages}
      inputValue={inputValue}
      isLoading={isLoading}
      userName={name || undefined}
      onInputChange={setInputValue}
      onSendMessage={handleSendMessageWrapper}
    />
  );
}


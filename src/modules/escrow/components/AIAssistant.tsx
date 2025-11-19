"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from '@/components/ui/typography';
import { parseUserMessage } from '@/lib/integrations/ai';
import { getAIProvider } from '@/lib/integrations/ai/provider';
import { executeNavigation, handleNavigation } from '@/lib/integrations/openai/navigationService';
import { convertCurrencyToBTC } from '@/lib/utils';
import { DEFAULT_PAYMENT_TITLE } from '@/modules/escrow/constants';
import { escrowFormSchema } from '@/validation/escrow';
import { Bitcoin, Bot, Sparkles } from "lucide-react";
import React, { useState } from 'react';
import { UseFormReturn } from "react-hook-form";
import { toast } from 'sonner';
import { z } from "zod";

type FormData = z.infer<typeof escrowFormSchema>;

interface Recipient {
  name: string;
  percentage: number;
  amount: number;
  address: string;
}

interface AiGeneratedSetup {
  title: string;
  totalAmount: number;
  recipients: Recipient[];
}

interface AIAssistantProps {
  form: UseFormReturn<FormData>;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ form }) => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [setup, setSetup] = useState<AiGeneratedSetup | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const generateSplit = async () => {
    if (!description.trim()) {
      toast.error("Error", { description: "Please describe your payment split" });
      return;
    }

    setIsGenerating(true);

    try {
      // Use the existing AI parser to understand the user's description
      const parsedAction = await parseUserMessage(description, { provider: getAIProvider() });

      if (parsedAction && parsedAction.type === 'create_escrow') {
        // Extract information from the AI parsed action
        let totalAmount = parseFloat(parsedAction.amount) || 0.03;
        const recipients = parsedAction.recipients || [];

        // If we have original currency, use real-time conversion instead of AI's static conversion
        if (parsedAction.originalCurrency) {
          const currencyMatch = parsedAction.originalCurrency.match(/(\$|€|£|¥)(\d+(?:\.\d{1,2})?)/);
          if (currencyMatch) {
            const currencySymbol = currencyMatch[1];
            const currencyAmount = parseFloat(currencyMatch[2]);
            // Use real-time conversion
            totalAmount = parseFloat(await convertCurrencyToBTC(currencyAmount, currencySymbol));
          }
        }

        // Use custom title if provided, otherwise generate based on recipients
        const title = parsedAction.title || (recipients.length > 0
          ? `${recipients.length} Recipient${recipients.length > 1 ? 's' : ''} Payment`
          : DEFAULT_PAYMENT_TITLE);

        // Create recipient objects with percentage-based or equal distribution
        const recipientObjects: Recipient[] = recipients.map((recipient, index) => {
          let percentage: number;
          let amount: number;

          if (parsedAction.percentages && parsedAction.percentages[index] !== undefined) {
            // Use provided percentages
            percentage = parsedAction.percentages[index];
            amount = (percentage / 100) * totalAmount;
          } else {
            // Fallback to equal distribution
            percentage = Math.floor(100 / recipients.length);
            amount = (percentage / 100) * totalAmount;
          }

          return {
            name: `Recipient ${index + 1}`,
            percentage,
            amount,
            address: recipient // This will be the ICP principal ID
          };
        });

        // Handle remainder for percentage-based distribution
        if (recipientObjects.length > 0 && parsedAction.percentages) {
          const totalAssigned = recipientObjects.reduce((sum, r) => sum + r.percentage, 0);
          const remainder = 100 - totalAssigned;
          if (remainder > 0) {
            recipientObjects[0].percentage += remainder;
            recipientObjects[0].amount = (recipientObjects[0].percentage / 100) * totalAmount;
          }
        } else if (recipientObjects.length > 0) {
          // Handle remainder for equal distribution
          const totalAssigned = recipientObjects.reduce((sum, r) => sum + r.percentage, 0);
          const remainder = 100 - totalAssigned;
          if (remainder > 0) {
            recipientObjects[0].percentage += remainder;
            recipientObjects[0].amount = (recipientObjects[0].percentage / 100) * totalAmount;
          }
        }

        const generatedSetup: AiGeneratedSetup = {
          title,
          totalAmount,
          recipients: recipientObjects
        };

        setSetup(generatedSetup);

        toast.success("Success", { description: "AI generated setup ready!" });
      } else if (parsedAction && parsedAction.type === 'navigate') {
        // Handle navigation requests
        const navigation = handleNavigation(parsedAction);
        executeNavigation(navigation);

      } else {
        // Fallback to local parsing if AI doesn't work
        const parsed = await parseDescription(description);
        setSetup(parsed);
        toast.success("Success", { description: "Setup generated using local parser" });
      }
    } catch (error) {
      console.error('Error generating split:', error);
      // Fallback to local parsing
      const parsed = await parseDescription(description);
      setSetup(parsed);
      toast.success("Success", { description: "Setup generated using local parser" });
    } finally {
      setIsGenerating(false);
    }
  };

  const parseDescription = async (desc: string): Promise<AiGeneratedSetup> => {
    // Extract amount and check for currency conversion
    let totalAmount = 0.03;

    // Check for currency amounts first
    const currencyMatch = desc.match(/(\$|€|£|¥)(\d+(?:\.\d{1,2})?)/);
    if (currencyMatch) {
      const currencySymbol = currencyMatch[1];
      const currencyAmount = parseFloat(currencyMatch[2]);

      // Convert currency to BTC using centralized function
      totalAmount = parseFloat(await convertCurrencyToBTC(currencyAmount, currencySymbol));
    } else {
      // Extract BTC amount
      const amountMatch = desc.match(/(\d+\.?\d*)\s*btc/i);
      totalAmount = amountMatch ? parseFloat(amountMatch[1]) : 0.03;
    }

    // Extract recipients - look for ICP principals or addresses
    const recipients: Recipient[] = [];

    // Pattern 1: Look for ICP principals (long alphanumeric strings with hyphens)
    const icpPrincipalMatches = desc.match(/[a-zA-Z0-9\-]{20,}/g);

    if (icpPrincipalMatches) {
      icpPrincipalMatches.forEach((principal, index) => {
        // Skip if it looks like a number or short string
        if (principal.length < 20 || /^\d+$/.test(principal)) return;

        recipients.push({
          name: `Recipient ${index + 1}`,
          percentage: Math.floor(100 / icpPrincipalMatches.length),
          amount: (Math.floor(100 / icpPrincipalMatches.length) / 100) * totalAmount,
          address: principal
        });
      });
    }

    // Pattern 2: Look for percentage patterns - multiple formats
    // Format: "send 1.245 btc to kenan 60% and don 40%"

    // First, try the most specific pattern for "to kenan 60% and don 40%"
    const specificPattern = /to\s+(\w+)\s+(\d+)%\s+and\s+(\w+)\s+(\d+)%/gi;
    const specificMatches = desc.matchAll(specificPattern);

    for (const match of specificMatches) {
      if (match[1] && match[2] && match[3] && match[4]) {
        const name1 = match[1];
        const percentage1 = parseInt(match[2]);
        const name2 = match[3];
        const percentage2 = parseInt(match[4]);

        // Clear any existing recipients and add these two
        recipients.length = 0;

        recipients.push({
          name: name1,
          percentage: percentage1,
          amount: (percentage1 / 100) * totalAmount,
          address: ""
        });

        recipients.push({
          name: name2,
          percentage: percentage2,
          amount: (percentage2 / 100) * totalAmount,
          address: ""
        });

        // Found the specific pattern, skip other patterns
        break;
      }
    }

    // If no specific pattern was found, try other patterns
    if (recipients.length === 0) {
      // First, try to handle comma-separated format: "60% to Dev, 30% to Designer, 10% to QA"
      const commaSeparatedPattern = /(\d+)%\s*to\s+(\w+)/gi;
      const commaMatches = desc.matchAll(commaSeparatedPattern);

      for (const match of commaMatches) {
        if (match[1] && match[2]) {
          const percentage = parseInt(match[1]);
          const name = match[2];

          // Skip if name is "and" (conjunction, not a recipient)
          if (name.toLowerCase() === 'and') continue;

          // Check if this recipient already exists
          const existingIndex = recipients.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
          if (existingIndex === -1) {
            recipients.push({
              name: name,
              percentage: percentage,
              amount: (percentage / 100) * totalAmount,
              address: ""
            });
          } else {
            // Update existing recipient
            recipients[existingIndex].percentage = percentage;
            recipients[existingIndex].amount = (percentage / 100) * totalAmount;
          }
        }
      }

      // If no comma-separated pattern was found, try other patterns
      if (recipients.length === 0) {
        const percentagePatterns = [
          /(\d+)%\s*(?:to\s+)?(\w+)(?:\s+and\s+(\d+)%\s*(?:to\s+)?(\w+))?/gi,  // "60% to kenan and 40% to don"
          /(\d+)%\s*and\s+(\w+)\s+(\d+)%/gi,  // "60% and don 40%"
          /(\d+)%\s*to\s+(\w+)/gi  // "60% to kenan"
        ];

        for (const pattern of percentagePatterns) {
          const matches = desc.matchAll(pattern);

          for (const match of matches) {
            if (match[1] && match[2]) {
              const percentage1 = parseInt(match[1]);
              const name1 = match[2];

              // Skip if name is "and" (conjunction, not a recipient)
              if (name1.toLowerCase() === 'and') continue;

              // Check if this recipient already exists
              const existingIndex = recipients.findIndex(r => r.name.toLowerCase() === name1.toLowerCase());
              if (existingIndex === -1) {
                recipients.push({
                  name: name1,
                  percentage: percentage1,
                  amount: (percentage1 / 100) * totalAmount,
                  address: ""
                });
              } else {
                // Update existing recipient
                recipients[existingIndex].percentage = percentage1;
                recipients[existingIndex].amount = (percentage1 / 100) * totalAmount;
              }
            }

            // Handle second recipient if present (for patterns like "60% to kenan and 40% to don")
            if (match[3] && match[4]) {
              const percentage2 = parseInt(match[3]);
              const name2 = match[4];

              // Skip if name is "and" (conjunction, not a recipient)
              if (name2.toLowerCase() === 'and') continue;

              const existingIndex = recipients.findIndex(r => r.name.toLowerCase() === name2.toLowerCase());
              if (existingIndex === -1) {
                recipients.push({
                  name: name2,
                  percentage: percentage2,
                  amount: (percentage2 / 100) * totalAmount,
                  address: ""
                });
              } else {
                // Update existing recipient
                recipients[existingIndex].percentage = percentage2;
                recipients[existingIndex].amount = (percentage2 / 100) * totalAmount;
              }
            }
          }
        }
      }
    }

    // Handle equal distribution only if we have recipients but no percentages were specified
    if (recipients.length > 0) {
      // Check if any recipient has a percentage > 0 (meaning percentages were parsed)
      const hasPercentages = recipients.some(r => r.percentage > 0);

      if (!hasPercentages) {
        // Only apply equal distribution if no percentages were found
        const equalPercentage = Math.floor(100 / recipients.length);
        const remainder = 100 - (equalPercentage * recipients.length);

        recipients.forEach((recipient, index) => {
          recipient.percentage = equalPercentage + (index === 0 ? remainder : 0);
          recipient.amount = (recipient.percentage / 100) * totalAmount;
        });
      } else {
        // Update amounts based on the parsed percentages
        recipients.forEach((recipient) => {
          recipient.amount = (recipient.percentage / 100) * totalAmount;
        });
      }
    }

    // Extract title if provided, otherwise generate based on recipients
    let title = DEFAULT_PAYMENT_TITLE;

    // Look for title pattern: "title <title_text>" or words at the end that aren't ICP principals
    const titleMatch = desc.match(/title\s+(\w+)/i);
    if (titleMatch) {
      title = titleMatch[1];
    } else {
      // Look for words at the end that aren't ICP principals or numbers
      const words = desc.split(/[,\s]+/).filter(word => word.trim());

      // Find the last sequence of words that aren't ICP principals
      const titleWords = [];
      for (let i = words.length - 1; i >= 0; i--) {
        const word = words[i];
        // Check if the word is not an ICP principal (doesn't contain hyphens and is short)
        if (word && !word.includes('-') && word.length < 20 && !/^\d+$/.test(word)) {
          titleWords.unshift(word);
        } else {
          break; // Stop when we hit an ICP principal or number
        }
      }

      if (titleWords.length > 0) {
        title = titleWords.join(' ');
      } else if (recipients.length > 0) {
        title = `${recipients.length} Recipient${recipients.length > 1 ? 's' : ''} Payment`;
      }
    }

    console.log('DEBUG: Local parser - Final recipients:', recipients);

    return {
      title,
      totalAmount,
      recipients
    };
  };

  const handleConfirmSetup = () => {
    if (setup) {
      form.setValue("title", setup.title);
      form.setValue("btcAmount", setup.totalAmount.toString());

      // Set recipients
      const formRecipients = setup.recipients.map((recipient, index) => ({
        id: `recipient-${index + 1}`,
        name: recipient.name || `Recipient ${index + 1}`,
        principal: recipient.address, // Use the address field for ICP principal
        percentage: recipient.percentage
      }));

      form.setValue("recipients", formRecipients);

      setSetup(null);
      setDescription("");
      setIsAccordionOpen(false);
      toast.success("Success", { description: "Setup applied to form!" });
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={isAccordionOpen ? "ai-assistant" : ""}
      onValueChange={(value) => setIsAccordionOpen(value === "ai-assistant")}
      className="mb-6 rounded-[20px] overflow-hidden"
    >
      <AccordionItem value="ai-assistant" className="bg-[#1A1A1A] data-[state=open]:border data-[state=open]:border-[#FEB64D] rounded-[20px] transition-all duration-300 ease-in-out">
        <AccordionTrigger className="px-5 py-4 hover:no-underline !hover:no-underline cursor-pointer transition-all duration-200 hover:bg-[#2A2A2A]/50">
          <div className="flex items-center gap-2">
            <Bot color='#FEB64D' className="h-5 w-5 transition-transform duration-200 " />
            <Typography variant="h4" className="text-[#FAFAFA] no-underline hover:no-underline">
              AI assistant
            </Typography>
            <Badge
              variant="outline"
              className="!bg-[#48351A] !border-[#BD822D] !text-[#FEB64D] uppercase"
            >
              Beta
            </Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent className="!p-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className='font-semibold text-[#A1A1AA] mb-2'>Describe your payment split</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Send 0.03 BTC — 60% to Dev, 30% to Designer, 10% to QA"
                className='h-20 bg-[#2A2A2A] border-[#3A3A3A]'
                rows={5}
              />
              <Typography variant='muted'>Example: &quot;Send 0.03 BTC — 60% to Dev, 30% to Designer, 10% to QA&quot;</Typography>
              <Button
                variant="outline"
                onClick={generateSplit}
                disabled={isGenerating}
                className="w-full mt-4"
              >
                <Sparkles size={16} />
                {isGenerating ? "Generating..." : "Generate split"}
              </Button>
            </div>

            {setup && (
              <div className="container-gray space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#FEB64D] h-4 w-4" />
                  <Typography variant="h4" className="text-[#FAFAFA]">
                    AI Generated Setup
                  </Typography>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-[#A1A1AA] mb-2">Title</Label>
                    <Input
                      value={setup.title}
                      onChange={(e) => setSetup({ ...setup, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-[#A1A1AA] mb-2">Total amount</Label>
                    <div className="flex items-center gap-2 text-[#FAFAFA]">
                      <Bitcoin color='#F97415' />
                      <Typography variant="base" className="font-semibold">{setup.totalAmount} BTC</Typography>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#A1A1AA] mb-2">Recipients</Label>
                    <div className="border border-[#626262] rounded-lg overflow-hidden">
                      {setup.recipients.map((recipient, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 ${index !== setup.recipients.length - 1 ? 'border-b border-[#626262]' : ''
                            } bg-[#2B2B2B]`}
                        >
                          <div className="flex-1">
                            <Typography variant="base" className="text-white font-medium">
                              {recipient.name}
                            </Typography>
                            <Typography variant="small" className="text-[#9F9F9F]">
                              {recipient.percentage}% • {recipient.address || "Address needed"}
                            </Typography>
                          </div>
                          <Typography variant="base" className="text-[#FEB64D] font-semibold">
                            {recipient.amount.toFixed(8)} BTC
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="default"
                    onClick={handleConfirmSetup}
                    className="w-full transition-all duration-200  hover:shadow-lg"
                  >
                    <Sparkles size={16} />
                    Confirm setup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AIAssistant;

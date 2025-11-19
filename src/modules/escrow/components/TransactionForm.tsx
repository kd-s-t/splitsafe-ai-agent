"use client"

import { useAuth } from "@/contexts/auth-context";
import { getTransaction } from "@/lib/internal/icp";
import { RootState } from "@/lib/redux/store/store";
import { useEscrowActions } from "@/modules/escrow/hooks";
import { MilestoneForm, MilestoneSummary } from "@/modules/milesone";
import { useMilestoneActions } from "@/modules/milesone/hooks/useMilestoneActions";
import { escrowFormSchema } from "@/validation/escrow";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from "sonner";
import { z } from "zod";
import { EscrowType } from "../types";
import AIAssistant from "./AIAssistant";
import TransactionDialog from "./Dialog";
import Form from "./Form";
import Summary from './Summary';

type FormData = z.infer<typeof escrowFormSchema>;

interface TransactionFormProps {
  escrowType?: EscrowType;
}

const TransactionForm = ({ escrowType = 'basic' }: TransactionFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editTxId = searchParams.get('edit');
  const { principal } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [isMilestoneLoading, setIsMilestoneLoading] = useState(false);
  const { createEscrow } = useEscrowActions()
  const { createMilestone } = useMilestoneActions()

  // Get UI state from Redux
  const { newTxId } = useSelector((state: RootState) => state.escrow);

  const form = useForm<FormData>({
    resolver: zodResolver(escrowFormSchema) as Resolver<FormData>,
    defaultValues: {
      title: "",
      btcAmount: "",
      recipients: [
        {
          id: "recipient-1",
          name: "Recipient 1",
          principal: "",
          percentage: 100 as number
        }
      ],
      useSeiAcceleration: true,
      isMilestone: escrowType === 'milestone',
      milestones: [],
      startDate: ""
    }
  });

  const { setValue, getValues } = form;

  // Set isMilestone flag when escrowType changes
  useEffect(() => {
    setValue("isMilestone", escrowType === 'milestone');
  }, [escrowType, setValue]);

  // Load existing transaction data if in edit mode
  useEffect(() => {
    const loadTransactionForEdit = async () => {
      if (!editTxId || !principal) return;

      try {
        const tx = await getTransaction(principal, editTxId);

        if (tx) {
          setValue("title", tx.title);

          // Convert recipients to the form format
          const formRecipients = tx.to.map((recipient: { principal: string | { toText: () => string }; percentage: number }, index: number) => ({
            id: `recipient-${index + 1}`,
            name: "",
            principal: typeof recipient.principal === "string" ? recipient.principal : (recipient.principal as { toText: () => string }).toText(),
            percentage: Number(recipient.percentage)
          }));

          setValue("recipients", formRecipients);

          // Calculate total BTC amount
          const totalAmount = tx.to.reduce((sum: number, recipient) => sum + Number(recipient.amount), 0);
          setValue("btcAmount", (totalAmount / 1e8).toString());
        }
      } catch (error) {
        console.error('Failed to load transaction for editing:', error);
        toast.error('Error', { description: 'Failed to load transaction for editing' });
      }
    };

    loadTransactionForEdit();
  }, [editTxId, principal, setValue]);

  // Load data from AI assistant chat
  useEffect(() => {
    const loadChatData = () => {
      try {
        const chatData = sessionStorage.getItem('splitsafe_chat_data');
        if (chatData) {
          const data = JSON.parse(chatData);
          console.log('DEBUG: TransactionForm received chat data:', data);

          // Populate title if provided
          if (data.title) {
            console.log('DEBUG: Setting title to:', data.title);
            setValue("title", data.title);
          }

          // Populate amount if provided
          if (data.amount) {
            console.log('DEBUG: Setting btcAmount to:', data.amount);
            setValue("btcAmount", data.amount);
          }

          // Populate recipients if provided
          if (data.recipients && Array.isArray(data.recipients) && data.recipients.length > 0) {
            const recipientCount = data.recipients.length;
            const basePercentage = Math.floor(100 / recipientCount);
            const remainder = 100 - (basePercentage * recipientCount);

            const formRecipients = data.recipients.map((recipient: string | { name?: string; principal: string }, index: number) => {
              if (typeof recipient === 'string') {
                return {
                  id: `recipient-${index + 1}`,
                  name: `Recipient ${index + 1}`,
                  principal: recipient,
                  percentage: basePercentage + (index < remainder ? 1 : 0) // Distribute remainder to first few recipients
                };
              } else {
                return {
                  id: `recipient-${index + 1}`,
                  name: recipient.name || `Recipient ${index + 1}`,
                  principal: recipient.principal,
                  percentage: basePercentage + (index < remainder ? 1 : 0) // Distribute remainder to first few recipients
                };
              }
            });

            setValue("recipients", formRecipients);
          }

          // Clear the sessionStorage data after using it
          sessionStorage.removeItem('splitsafe_chat_data');
        }
      } catch (error) {
        console.error('Failed to load chat data:', error);
      }
    };

    loadChatData();
  }, [setValue]);

  // const onSubmit = async (data: FormData) => {
  //   console.log('🔍 Form submitted with data:', data);
  //   console.log('🔍 Escrow type:', escrowType);
  //   
  //   const formDataWithTokenType = {
  //     ...data,
  //     tokenType: 'btc' as const
  //   };
  //   
  //   try {
  //     if (editTxId) {
  //       console.log('🔍 Updating escrow...');
  //       await updateEscrow(formDataWithTokenType);
  //     } else {
  //       if (escrowType === 'milestone') {
  //         console.log('🔍 Creating milestone...');
  //         console.log('🔍 Form data for milestone:', formDataWithTokenType);
  //         setIsMilestoneLoading(true);
  //         try {
  //           const result = await createMilestone(formDataWithTokenType);
  //           console.log('🔍 Create milestone result:', result);
  //           if (result && result.success) {
  //             console.log('🔍 Milestone created successfully, showing dialog');
  //             setShowDialog(true);
  //           } else {
  //             console.log('🔍 Milestone creation failed or returned no result');
  //           }
  //         } finally {
  //           setIsMilestoneLoading(false);
  //         }
  //       } else {
  //         console.log('🔍 Creating escrow...');
  //         const result = await createEscrow(formDataWithTokenType);
  //         console.log('🔍 Create escrow result:', result);
  //         if (result && result.success) {
  //           console.log('🔍 Escrow created successfully, showing dialog');
  //           setShowDialog(true);
  //         } else {
  //           console.log('🔍 Escrow creation failed or returned no result');
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('🔍 Error in onSubmit:', error);
  //   }
  // };

  // Create props for the Summary component
  const summaryProps = {
    form: form,
    handleInitiateEscrow: async () => {
      console.log('🔍 handleInitiateEscrow called!');
      console.log('🔍 Form values:', getValues());
      console.log('🔍 Escrow type:', escrowType);

      setIsMilestoneLoading(true);
      try {
        const formData = getValues();

        if (escrowType === 'milestone') {
          console.log('🔍 Creating milestone with form data:', formData);

          const result = await createMilestone(formData);

          console.log('🔍 Create milestone result:', result);

          if (result && result.success) {
            console.log('🔍 Milestone created successfully, showing dialog');
            setShowDialog(true);
            // Keep loading state - don't set setIsMilestoneLoading(false) here
          } else {
            console.log('🔍 Milestone creation failed');
            setIsMilestoneLoading(false);
          }
        } else {
          console.log('🔍 Creating basic escrow with form data:', formData);

          const result = await createEscrow({
            ...formData,
            tokenType: 'btc' as const
          });

          if (result && result.success) {
            setShowDialog(true);
            // Keep loading state - don't set setIsMilestoneLoading(false) here
          } else {
            setIsMilestoneLoading(false);
          }
        }
      } catch (error) {
        console.error('🔍 Error creating escrow/milestone:', error);
        setIsMilestoneLoading(false);
      }
      // Remove the finally block that was setting loading to false
    },
    newTxId,
    isEditMode: !!editTxId,
    isLoading: isMilestoneLoading
  };

  return (
    <div className="flex gap-4 min-h-screen w-full">
      <div className="flex-1 min-w-0">
        {escrowType === 'milestone' ? (
          <MilestoneForm form={form} />
        ) : (
          <>
            <AIAssistant form={form} />
            <Form form={form} />
          </>
        )}
      </div>
      {escrowType === 'milestone' ? (
        <MilestoneSummary {...summaryProps} />
      ) : (
        <div className="w-80 flex-shrink-0">
          <Summary {...summaryProps} />
        </div>
      )}

      <TransactionDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        open={showDialog}
        onOpenChange={setShowDialog}
        amount={getValues("btcAmount")}
        isLoading={isDialogLoading}
        onDone={async () => {
          setIsDialogLoading(true);

          try {
            if (newTxId) {
              await navigate(`/transactions/${newTxId}`);
              // Reset loading after successful navigation but keep modal open
              setIsMilestoneLoading(false);
              setIsDialogLoading(false);
            } else {
              console.error('No transaction ID available for redirect');
              toast.error('Error', { description: 'Transaction created but redirect failed - no transaction ID' });
              setIsMilestoneLoading(false);
              setIsDialogLoading(false);
            }
          } catch (error) {
            console.error('Navigation error:', error);
            toast.error('Error', { description: 'Failed to redirect to transaction page' });
            setIsMilestoneLoading(false);
            setIsDialogLoading(false);
          }
        }}
      />
    </div>
  );
};

export default TransactionForm;

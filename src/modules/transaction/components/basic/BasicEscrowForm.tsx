"use client";

import { useAuth } from "@/contexts/auth-context";
import { setIsFeedbackDialogOpen } from "@/lib/redux/store/dialogSlice";
import type { RootState } from "@/lib/redux/store/store";
import AIAssistant from "@/modules/escrow/components/AIAssistant";
import TransactionDialog from "@/modules/escrow/components/Dialog";
import Form from "@/modules/escrow/components/Form";
import Summary from "@/modules/escrow/components/Summary";
import { useEscrowActions } from "@/modules/escrow/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { basicEscrowFormSchema, type BasicEscrowFormData } from "./basicEscrowSchema";

// Schema is now imported from separate file
/*
const basicEscrowFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  btcAmount: z
    .string()
    .refine((val) => val.trim() !== "", { message: "Please enter an amount to continue." })
    .refine((val) => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine(
      (val) => {
        const trimmed = val.trim();
        if (/^0+(\.0+)?$/.test(trimmed)) {
          return false;
        }
        return Number(trimmed) > 0;
      },
      { message: "Amount must be greater than zero." }
    )
    .refine((val) => Number(val) <= 10, { message: "Escrow amount exceeds the maximum allowed. Please lower the amount." })
    .refine(
      (val) => {
        const [, decimals] = val.split(".");
        if (!decimals) return true;
        const trimmedDecimals = decimals.replace(/0+$/, "");
        return trimmedDecimals.length <= 8;
      },
      { message: "Bitcoin supports up to 8 decimal places only." }
    ),
  recipients: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Recipient name is required").max(50, "Name must be less than 50 characters"),
      principal: z.string()
        .min(1, "ICP Principal ID is required")
        .refine((val) => {
          // Basic ICP principal validation
          const trimmed = val.trim();
          return trimmed.length > 0 && !trimmed.startsWith('1') && !trimmed.startsWith('3') && !trimmed.startsWith('bc1');
        }, "Please enter a valid ICP Principal ID (not a Bitcoin address)"),
      percentage: z.coerce.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100")
    })
  ).min(1, "At least one recipient is required"),
  useSeiAcceleration: z.boolean().default(true),
}).refine((data) => {
  // Check total percentage
  const totalPercentage = data.recipients.reduce((sum, r) => sum + r.percentage, 0);
  return Math.abs(totalPercentage - 100) < 0.01;
}, "Total percentage must equal 100%");
*/

// Type is now imported from separate file
/*
type BasicEscrowFormData = {
  title: string;
  btcAmount: string;
  recipients: Array<{
    id: string;
    name: string;
    principal: string;
    percentage: number;
  }>;
  useSeiAcceleration: boolean;
};
*/

const BasicEscrowForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editTxId = searchParams.get('edit');
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const [showDialog, setShowDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createEscrow } = useEscrowActions(editTxId || undefined);

  // Get UI state from Redux
  const { newTxId } = useSelector((state: RootState) => state.escrow);

  const form = useForm<BasicEscrowFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(basicEscrowFormSchema) as any,
    defaultValues: {
      title: "",
      btcAmount: "",
      recipients: [
        {
          id: "rcpnt-1",
          name: "Recipient 1",
          principal: "",
          percentage: 100
        }
      ],
      useSeiAcceleration: true,
    }
  });

  const { getValues } = form;


  // Load existing transaction data if in edit mode
  useEffect(() => {
    if (editTxId && principal) {
      // TODO: Load existing transaction data for editing
      console.log('Loading transaction for edit:', editTxId);
    }
  }, [editTxId, principal]);

  // const onSubmit = async (data: BasicEscrowFormData) => {
  //   console.log('🔍 Basic escrow form submitted:', data);
  //   setIsLoading(true);
  //   
  //   try {
  //     const result = await createEscrow({
  //       ...data,
  //       tokenType: 'btc' as const
  //     });
  //     
  //     if (result && result.success) {
  //       setShowDialog(true);
  //     }
  //   } catch (error) {
  //     console.error('🔍 Error in onSubmit:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Create props for the Summary component
  const summaryProps = {
    form: form,
    handleInitiateEscrow: async () => {
      console.log('🔍 handleInitiateEscrow called for basic escrow!');
      console.log('🔍 Form values:', getValues());

      setIsLoading(true);
      try {
        const formData = getValues();
        console.log('🔍 Creating basic escrow with form data:', formData);

        const result = await createEscrow({
          ...formData,
          tokenType: 'btc' as const
        });

        if (result && result.success) {
          setShowDialog(true);
          // Show feedback modal immediately
          console.log('🔍 [BasicEscrowForm] Showing feedback modal immediately...');
          dispatch(setIsFeedbackDialogOpen(true));
        } else {
          console.log('🔍 Escrow creation failed');
        }
      } catch (error) {
        console.error('🔍 Error creating escrow:', error);
      } finally {
        setIsLoading(false);
      }
    },
    newTxId,
    isEditMode: !!editTxId,
    isLoading
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-screen w-full">
      <div className="flex-1 min-w-0">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AIAssistant form={form as any} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Form form={form as any} />
      </div>
      <div className="w-full md:w-80 flex-shrink-0">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Summary {...(summaryProps as any)} />
      </div>

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
              setIsLoading(false);
              setIsDialogLoading(false);
              
              // Feedback modal already triggered after success dialog
            } else {
              console.error('No transaction ID available for redirect');
              toast.error('Transaction failed', { description: 'Transaction created but redirect failed - no transaction ID' });
              setIsLoading(false);
              setIsDialogLoading(false);
            }
          } catch (error) {
            console.error('Navigation error:', error);
            toast.error('Navigation error', { description: 'Failed to redirect to transaction page' });
            setIsLoading(false);
            setIsDialogLoading(false);
          }
        }}
      />
    </div>
  );
};

export default BasicEscrowForm;

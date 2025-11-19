"use client";

import { useAuth } from "@/contexts/auth-context";
import { shouldShowFeedbackModal } from "@/lib/internal/icp/feedback";
import { getUserTransactionCount } from "@/lib/internal/icp/transactions";
import { setIsFeedbackDialogOpen } from "@/lib/redux/store/dialogSlice";
import type { RootState } from "@/lib/redux/store/store";
import TransactionDialog from "@/modules/escrow/components/Dialog";
import { useMilestoneActions } from "@/modules/milesone/hooks/useMilestoneActions";
import { escrowFormSchema } from "@/validation/escrow";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import MilestoneForm from "./MilestoneForm";
import MilestoneSummary from "./MilestoneSummary";

type MilestoneEscrowFormData = {
  title: string;
  btcAmount: string;
  recipients: Array<{
    id: string;
    name: string;
    principal: string;
    percentage: number;
  }>;
  useSeiAcceleration: boolean;
  isMilestone: boolean;
  milestones: Array<{
    id: string;
    title: string;
    allocation: number;
    coin: string;
    recipients: Array<{
      id: string;
      name: string;
      principal: string;
      share: number;
      approvedAt?: number;
      declinedAt?: number;
    }>;
    startDate: number;
    createdAt: number;
    releasedDate?: number;
    frequency: string; // e.g., "day-1", "day-15", etc.
    completedAt?: number;
  }>;
  startDate?: string;
  contractSigningPeriod?: number;
};

const MilestoneEscrowForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editTxId = searchParams.get('edit');
  const { principal } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createMilestone } = useMilestoneActions();

  // Get UI state from Redux
  const { newTxId } = useSelector((state: RootState) => state.escrow);

  const form = useForm<MilestoneEscrowFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(escrowFormSchema) as any,
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
      isMilestone: true,
      milestones: [],
      startDate: "",
      contractSigningPeriod: 7
    }
  });

  const { setValue, getValues } = form;

  // Check if user should see feedback modal (smart frequency)
  const checkIfUserShouldSeeFeedback = async () => {
    if (!principal) return;

    try {
      console.log('🔍 Checking if user should see feedback modal...');
      
      // Get actual transaction count from user data
      const transactionCount = await getUserTransactionCount(principal);
      console.log('🔍 User transaction count:', transactionCount);

      // Use direct ICP call to check if user should see feedback modal
      const shouldShow = await shouldShowFeedbackModal(principal, transactionCount);
      console.log('🔍 Should show feedback modal:', shouldShow);

      if (shouldShow) {
        // User should see feedback modal, show after delay
        console.log('🔍 Showing feedback modal after 2 second delay...');
        setTimeout(() => {
          setIsFeedbackDialogOpen(true);
        }, 2000);
      } else {
        console.log('🔍 Not showing feedback modal - user has already submitted or conditions not met');
      }
    } catch (error) {
      console.error('Error checking feedback status:', error);
      // On error, show modal anyway (fail-safe)
      console.log('🔍 Error occurred, showing feedback modal as fail-safe...');
      setTimeout(() => {
        setIsFeedbackDialogOpen(true);
      }, 2000);
    }
  };

  // Set isMilestone flag
  useEffect(() => {
    setValue("isMilestone", true);
  }, [setValue]);

  // Load existing transaction data if in edit mode
  useEffect(() => {
    if (editTxId && principal) {
      // TODO: Load existing transaction data for editing
    }
  }, [editTxId, principal]);

  // const onSubmit = async (data: MilestoneEscrowFormData) => {
  //   setIsLoading(true);
  //   
  //   try {
  //     const result = await createMilestone(data);
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

  // Create props for the MilestoneSummary component
  const summaryProps = {
    form: form,
    handleInitiateEscrow: async () => {

      setIsLoading(true);
      try {
        const formData = getValues();

        const result = await createMilestone(formData as any); // eslint-disable-line @typescript-eslint/no-explicit-any


        if (result && result.success) {
          setShowDialog(true);
          // Show feedback modal after success dialog (with delay to avoid overlap)
          setTimeout(() => {
            checkIfUserShouldSeeFeedback();
          }, 3000); // 3-second delay to let user see the success message
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🔍 Error creating milestone:', error);
        setIsLoading(false);
      }
      // Remove the finally block that was setting loading to false
    },
    newTxId,
    isEditMode: !!editTxId,
    isLoading
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-screen w-full">
      <div className="flex-1 min-w-0">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <MilestoneForm form={form as any} />
      </div>
      <div className="w-full md:w-80 flex-shrink-0">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <MilestoneSummary {...(summaryProps as any)} />
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

export default MilestoneEscrowForm;
